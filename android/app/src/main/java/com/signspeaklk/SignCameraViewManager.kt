package com.signspeaklk

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class SignCameraViewManager : ViewGroupManager<SignCameraView>() {

    override fun getName(): String = "SignCameraView"

    override fun createViewInstance(reactContext: ThemedReactContext): SignCameraView {
        return SignCameraView(reactContext)
    }

    @ReactProp(name = "lensFacing")
    fun setLensFacing(view: SignCameraView, lensFacing: String?) {
        view.setLensFacing(lensFacing ?: "front")
    }

    @ReactProp(name = "isPaused", defaultBoolean = false)
    fun setPaused(view: SignCameraView, isPaused: Boolean) {
        view.setPaused(isPaused)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.of(
            "topSignDetected",
            MapBuilder.of("registrationName", "onSignDetected")
        )
    }

    override fun onDropViewInstance(view: SignCameraView) {
        super.onDropViewInstance(view)
        view.cleanup()
    }
}
