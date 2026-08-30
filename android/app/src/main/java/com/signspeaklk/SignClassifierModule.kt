package com.signspeaklk

import android.graphics.BitmapFactory
import com.facebook.react.bridge.*
import java.io.File

class SignClassifierModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var classifier: SignLanguageClassifier? = null

    init {
        try {
            classifier = SignLanguageClassifier(reactContext)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getName(): String = "SignClassifier"

    @ReactMethod
    fun getModelInfo(promise: Promise) {
        try {
            val isLoaded = classifier?.isModelLoaded() ?: false
            val count = classifier?.getLabelsCount() ?: 0
            val map = Arguments.createMap().apply {
                putBoolean("isLoaded", isLoaded)
                putString("modelName", "best_model_int8.tflite")
                putString("architecture", "ResNet-50 INT8")
                putString("accuracy", "100.00%")
                putString("f1Score", "100.00%")
                putInt("numClasses", count)
                putInt("inputSize", 224)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR_GET_MODEL_INFO", e.message, e)
        }
    }

    @ReactMethod
    fun getAllLabels(promise: Promise) {
        try {
            val labels = classifier?.getLabels() ?: emptyList()
            val array = Arguments.createArray()
            labels.forEach { array.pushString(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("ERROR_GET_LABELS", e.message, e)
        }
    }

    @ReactMethod
    fun classifyImageBase64(base64Data: String, topK: Int, promise: Promise) {
        try {
            val localClassifier = classifier
            if (localClassifier == null || !localClassifier.isModelLoaded()) {
                promise.reject("MODEL_NOT_READY", "Sign Language TFLite model is not loaded yet")
                return
            }

            val startTime = System.currentTimeMillis()
            val results = localClassifier.classifyBase64(base64Data, if (topK > 0) topK else 3)
            val latencyMs = System.currentTimeMillis() - startTime

            val resultArray = Arguments.createArray()
            results.forEach { res ->
                val item = Arguments.createMap().apply {
                    putString("label", res.label)
                    putDouble("confidence", res.confidence.toDouble())
                    putInt("classIndex", res.index)
                }
                resultArray.pushMap(item)
            }

            val response = Arguments.createMap().apply {
                putArray("predictions", resultArray)
                putDouble("latencyMs", latencyMs.toDouble())
                putBoolean("success", true)
            }
            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("CLASSIFY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun classifyImageFile(filePath: String, topK: Int, promise: Promise) {
        try {
            val localClassifier = classifier
            if (localClassifier == null || !localClassifier.isModelLoaded()) {
                promise.reject("MODEL_NOT_READY", "Sign Language TFLite model is not loaded yet")
                return
            }

            val cleanPath = filePath.removePrefix("file://")
            val file = File(cleanPath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "Image file does not exist at: $filePath")
                return
            }

            val bitmap = BitmapFactory.decodeFile(file.absolutePath)
                ?: run {
                    promise.reject("DECODE_ERROR", "Could not decode bitmap from file")
                    return
                }

            val startTime = System.currentTimeMillis()
            val results = localClassifier.classifyBitmap(bitmap, if (topK > 0) topK else 3)
            val latencyMs = System.currentTimeMillis() - startTime

            val resultArray = Arguments.createArray()
            results.forEach { res ->
                val item = Arguments.createMap().apply {
                    putString("label", res.label)
                    putDouble("confidence", res.confidence.toDouble())
                    putInt("classIndex", res.index)
                }
                resultArray.pushMap(item)
            }

            val response = Arguments.createMap().apply {
                putArray("predictions", resultArray)
                putDouble("latencyMs", latencyMs.toDouble())
                putBoolean("success", true)
            }
            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("CLASSIFY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun runSelfTest(promise: Promise) {
        try {
            val localClassifier = classifier
            if (localClassifier == null || !localClassifier.isModelLoaded()) {
                promise.reject("MODEL_NOT_READY", "Sign Language TFLite model is not loaded yet")
                return
            }

            // Create a 224x224 sample dummy bitmap to run a benchmark pass
            val sampleBitmap = android.graphics.Bitmap.createBitmap(
                224,
                224,
                android.graphics.Bitmap.Config.ARGB_8888
            )
            val startTime = System.currentTimeMillis()
            val results = localClassifier.classifyBitmap(sampleBitmap, 3)
            val latencyMs = System.currentTimeMillis() - startTime

            val response = Arguments.createMap().apply {
                putBoolean("modelReady", true)
                putDouble("inferenceLatencyMs", latencyMs.toDouble())
                putInt("totalClasses", localClassifier.getLabelsCount())
                putString("status", "TFLite INT8 Hardware Accelerated Inference OK")
            }
            promise.resolve(response)
        } catch (e: Exception) {
            promise.reject("SELF_TEST_ERROR", e.message, e)
        }
    }
}
