package com.signspeaklk

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel

data class RecognitionResult(
    val label: String,
    val confidence: Float,
    val index: Int
)

class SignLanguageClassifier(private val context: Context) {
    private var interpreter: Interpreter? = null
    private var labels: List<String> = emptyList()
    private val inputImageSize = 224
    private val pixelBytes = 4 // Float32 (4 bytes per float)
    private val channels = 3
    private val modelFileName = "best_model_int8.tflite"

    init {
        loadModel()
        loadLabels()
    }

    @Synchronized
    private fun loadModel() {
        try {
            val assetFileDescriptor = context.assets.openFd(modelFileName)
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
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun loadLabels() {
        try {
            labels = context.assets.open("labels.txt").bufferedReader().useLines { lines ->
                lines.filter { it.isNotBlank() }.toList()
            }
        } catch (e: Exception) {
            labels = emptyList()
            e.printStackTrace()
        }
    }

    fun isModelLoaded(): Boolean = interpreter != null && labels.isNotEmpty()

    fun getLabelsCount(): Int = labels.size

    fun getLabels(): List<String> = labels

    fun classifyBitmap(bitmap: Bitmap, topK: Int = 3): List<RecognitionResult> {
        val currentInterpreter = interpreter ?: return emptyList()
        val numClasses = if (labels.isNotEmpty()) labels.size else 111

        val resized = Bitmap.createScaledBitmap(bitmap, inputImageSize, inputImageSize, true)
        val byteBuffer = ByteBuffer.allocateDirect(1 * inputImageSize * inputImageSize * channels * pixelBytes)
        byteBuffer.order(ByteOrder.nativeOrder())

        val intValues = IntArray(inputImageSize * inputImageSize)
        resized.getPixels(intValues, 0, resized.width, 0, 0, resized.width, resized.height)

        var pixel = 0
        for (i in 0 until inputImageSize) {
            for (j in 0 until inputImageSize) {
                val value = intValues[pixel++]
                // Standard ImageNet normalization: (x/255.0 - mean) / std
                val r = (((value shr 16 and 0xFF) / 255.0f) - 0.485f) / 0.229f
                val g = (((value shr 8 and 0xFF) / 255.0f) - 0.456f) / 0.224f
                val b = (((value and 0xFF) / 255.0f) - 0.406f) / 0.225f

                byteBuffer.putFloat(r)
                byteBuffer.putFloat(g)
                byteBuffer.putFloat(b)
            }
        }

        val outputArray = Array(1) { FloatArray(numClasses) }
        currentInterpreter.run(byteBuffer, outputArray)

        // Extract and sort results by highest confidence
        val probabilities = outputArray[0]
        val results = mutableListOf<RecognitionResult>()
        for (i in probabilities.indices) {
            val label = if (i < labels.size) labels[i] else "Class_$i"
            results.add(RecognitionResult(label, probabilities[i], i))
        }

        return results.sortedByDescending { it.confidence }.take(topK)
    }

    fun classifyBase64(base64Data: String, topK: Int = 3): List<RecognitionResult> {
        val cleanBase64 = if (base64Data.contains(",")) {
            base64Data.substringAfter(",")
        } else {
            base64Data
        }
        val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
        val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
            ?: throw IllegalArgumentException("Failed to decode base64 image data")
        return classifyBitmap(bitmap, topK)
    }

    fun close() {
        interpreter?.close()
        interpreter = null
    }
}
