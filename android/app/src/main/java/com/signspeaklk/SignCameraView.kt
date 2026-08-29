package com.signspeaklk

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.AttributeSet
import android.util.Log
import android.widget.FrameLayout
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class SignCameraView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    companion object {
        private const val TAG = "SignCameraView"
    }

    private val previewView: PreviewView = PreviewView(context)
    private var cameraProvider: ProcessCameraProvider? = null
    private var cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private var classifier: SignLanguageClassifier = SignLanguageClassifier(context)

    private var lensFacing: Int = CameraSelector.LENS_FACING_FRONT
    private var isPaused: Boolean = false
    private var lastAnalysisTimestamp = 0L
    private val analysisThrottleMs = 180L // ~5-6 inferences per second

    private val measureAndLayoutRunnable = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    init {
        // Use COMPATIBLE (TextureView) mode so it renders reliably with React Native view hierarchy and rounded borders
        previewView.implementationMode = PreviewView.ImplementationMode.COMPATIBLE
        previewView.scaleType = PreviewView.ScaleType.FILL_CENTER

        val layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        addView(previewView, layoutParams)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayoutRunnable)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        val w = right - left
        val h = bottom - top
        if (w > 0 && h > 0) {
            previewView.measure(
                MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
            )
            previewView.layout(0, 0, w, h)
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        startCamera()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        cleanup()
    }

    fun setLensFacing(facing: String) {
        val newFacing = if (facing.equals("back", ignoreCase = true)) {
            CameraSelector.LENS_FACING_BACK
        } else {
            CameraSelector.LENS_FACING_FRONT
        }
        if (lensFacing != newFacing) {
            lensFacing = newFacing
            restartCamera()
        }
    }

    fun setPaused(paused: Boolean) {
        if (isPaused != paused) {
            isPaused = paused
            if (paused) {
                cameraProvider?.unbindAll()
            } else {
                startCamera()
            }
        }
    }

    private fun getLifecycleOwner(): LifecycleOwner? {
        var ctx = context
        while (ctx is android.content.ContextWrapper) {
            if (ctx is LifecycleOwner) {
                return ctx
            }
            ctx = ctx.baseContext
        }
        val reactContext = context as? ReactContext
        return reactContext?.currentActivity as? LifecycleOwner
    }

    fun startCamera() {
        val lifecycleOwner = getLifecycleOwner() ?: return

        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                cameraProvider = cameraProviderFuture.get()
                bindCameraUseCases(lifecycleOwner)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get CameraProvider", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun restartCamera() {
        cameraProvider?.unbindAll()
        val lifecycleOwner = getLifecycleOwner() ?: return
        bindCameraUseCases(lifecycleOwner)
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun bindCameraUseCases(lifecycleOwner: LifecycleOwner) {
        val provider = cameraProvider ?: return
        provider.unbindAll()

        if (isPaused) return

        val cameraSelector = CameraSelector.Builder()
            .requireLensFacing(lensFacing)
            .build()

        val preview = Preview.Builder()
            .setTargetAspectRatio(AspectRatio.RATIO_4_3)
            .build()
            .also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

        val imageAnalysis = ImageAnalysis.Builder()
            .setTargetAspectRatio(AspectRatio.RATIO_4_3)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
            .build()

        imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
            processImageProxy(imageProxy)
        }

        try {
            provider.bindToLifecycle(lifecycleOwner, cameraSelector, preview, imageAnalysis)
            Log.d(TAG, "Camera bound successfully to lifecycle")
        } catch (e: Exception) {
            Log.e(TAG, "Use case binding failed, trying fallback camera selector", e)
            try {
                // Fallback to DEFAULT_BACK_CAMERA if front camera fails
                provider.bindToLifecycle(
                    lifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageAnalysis
                )
            } catch (fallbackEx: Exception) {
                Log.e(TAG, "Fallback camera binding failed", fallbackEx)
            }
        }
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun processImageProxy(imageProxy: ImageProxy) {
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastAnalysisTimestamp < analysisThrottleMs || !classifier.isModelLoaded()) {
            imageProxy.close()
            return
        }
        lastAnalysisTimestamp = currentTime

        try {
            val bitmap = imageProxy.toBitmap()
            val rotationDegrees = imageProxy.imageInfo.rotationDegrees

            // Rotate if necessary to match portrait orientation
            val rotatedBitmap = if (rotationDegrees != 0) {
                val matrix = Matrix().apply { postRotate(rotationDegrees.toFloat()) }
                Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
            } else {
                bitmap
            }

            val startTime = System.currentTimeMillis()
            val predictions = classifier.classifyBitmap(rotatedBitmap, 3)
            val latencyMs = System.currentTimeMillis() - startTime

            if (predictions.isNotEmpty()) {
                sendDetectionEvent(predictions, latencyMs)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Image analysis error", e)
        } finally {
            imageProxy.close()
        }
    }

    private fun sendDetectionEvent(predictions: List<RecognitionResult>, latencyMs: Long) {
        val reactContext = context as? ReactContext ?: return

        val resultArray = Arguments.createArray()
        predictions.forEach { p ->
            val map = Arguments.createMap().apply {
                putString("label", p.label)
                putDouble("confidence", p.confidence.toDouble())
                putInt("classIndex", p.index)
            }
            resultArray.pushMap(map)
        }

        val event = Arguments.createMap().apply {
            putArray("predictions", resultArray)
            putDouble("latencyMs", latencyMs.toDouble())
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }

        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "topSignDetected", event)
    }

    fun cleanup() {
        try {
            if (!cameraExecutor.isShutdown) {
                cameraExecutor.shutdown()
            }
            cameraProvider?.unbindAll()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
