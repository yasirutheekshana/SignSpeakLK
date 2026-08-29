package com.signspeak.lk.classifier

import android.content.Context
import android.graphics.Bitmap
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel

data class Recognition(val label: String, val confidence: Float)

class SignLanguageClassifier(private val context: Context) {
    private var interpreter: Interpreter? = null
    private var labels: List<String> = emptyList()
    private val inputImageSize = 224
    private val pixelBytes = 4 // Float32
    private val channels = 3

    init {
        loadModel()
        loadLabels()
    }

    private fun loadModel() {
        val assetFileDescriptor = context.assets.openFd("best_model_int8.tflite")
        val inputStream = FileInputStream(assetFileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = assetFileDescriptor.startOffset
        val declaredLength = assetFileDescriptor.declaredLength
        val buffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
        
        val options = Interpreter.Options().apply {
            setNumThreads(4)
            setUseNNAPI(true)
        }
        interpreter = Interpreter(buffer, options)
    }

    private fun loadLabels() {
        labels = context.assets.open("labels.txt").bufferedReader().useLines { it.toList() }
    }

    fun classifyFrame(bitmap: Bitmap): Recognition {
        val resized = Bitmap.createScaledBitmap(bitmap, inputImageSize, inputImageSize, true)
        val byteBuffer = ByteBuffer.allocateDirect(1 * inputImageSize * inputImageSize * channels * pixelBytes)
        byteBuffer.order(ByteOrder.nativeOrder())

        val intValues = IntArray(inputImageSize * inputImageSize)
        resized.getPixels(intValues, 0, resized.width, 0, 0, resized.width, resized.height)

        var pixel = 0
        for (i in 0 until inputImageSize) {
            for (j in 0 until inputImageSize) {
                val value = intValues[pixel++]
                // Normalize ImageNet mean/std
                val r = (((value shr 16 and 0xFF) / 255.0f) - 0.485f) / 0.229f
                val g = (((value shr 8 and 0xFF) / 255.0f) - 0.456f) / 0.224f
                val b = (((value and 0xFF) / 255.0f) - 0.406f) / 0.225f
                byteBuffer.putFloat(r)
                byteBuffer.putFloat(g)
                byteBuffer.putFloat(b)
            }
        }

        val outputArray = Array(1) { FloatArray(labels.size) }
        interpreter?.run(byteBuffer, outputArray)

        var maxIdx = 0
        var maxConf = 0.0f
        for (i in outputArray[0].indices) {
            if (outputArray[0][i] > maxConf) {
                maxConf = outputArray[0][i]
                maxIdx = i
            }
        }

        val detectedLabel = if (maxIdx < labels.size) labels[maxIdx] else "Unknown"
        return Recognition(detectedLabel, maxConf)
    }
}
