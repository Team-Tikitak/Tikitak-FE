package app.tikitak.space;

import android.Manifest;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.graphics.Color;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.core.ZoomState;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.common.util.concurrent.ListenableFuture;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// iOS NativeCameraPlugin.swift 대응. WebView 뒤에 CameraX PreviewView를 심고
// WebView 배경을 투명하게 뚫어 네이티브 프리뷰가 웹 UI 밑에 비치게 한다.
@CapacitorPlugin(
    name = "NativeCamera",
    permissions = { @Permission(strings = { Manifest.permission.CAMERA }, alias = "camera") }
)
public class NativeCameraPlugin extends Plugin {

    private ExecutorService cameraExecutor;
    private ProcessCameraProvider cameraProvider;
    private Camera camera;
    private ImageCapture imageCapture;
    private PreviewView previewView;
    private Integer originalWebViewBackgroundColor;

    @Override
    public void load() {
        cameraExecutor = Executors.newSingleThreadExecutor();
    }

    @PluginMethod
    public void startPreview(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermissionCallback");
            return;
        }
        startPreviewInternal(call);
    }

    @PermissionCallback
    private void cameraPermissionCallback(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            startPreviewInternal(call);
        } else {
            call.reject("permission denied");
        }
    }

    private void startPreviewInternal(PluginCall call) {
        String facingMode = call.getString("facingMode", "environment");
        Double zoomLevel = call.getDouble("zoomLevel", 1.0);
        JSObject previewFrame = call.getObject("previewFrame");

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("activity unavailable");
            return;
        }

        activity.runOnUiThread(() -> {
            attachPreviewView(previewFrame);

            ListenableFuture<ProcessCameraProvider> future = ProcessCameraProvider.getInstance(getContext());
            future.addListener(
                () -> {
                    try {
                        cameraProvider = future.get();
                        bindCameraUseCases(facingMode, zoomLevel);
                        previewView.setVisibility(View.VISIBLE);
                        call.resolve();
                    } catch (Exception e) {
                        call.reject(e.getMessage());
                    }
                },
                ContextCompat.getMainExecutor(getContext())
            );
        });
    }

    private void attachPreviewView(JSObject previewFrame) {
        Activity activity = getActivity();
        ViewGroup rootView = (ViewGroup) bridge.getWebView().getParent();

        if (previewView == null) {
            previewView = new PreviewView(activity);
            previewView.setBackgroundColor(Color.BLACK);
            previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
            previewView.setVisibility(View.INVISIBLE);
            rootView.addView(previewView, 0);
        }

        float density = activity.getResources().getDisplayMetrics().density;
        CoordinatorLayout.LayoutParams params;
        if (previewFrame != null) {
            int width = Math.round((float) previewFrame.optDouble("width", 0) * density);
            int height = Math.round((float) previewFrame.optDouble("height", 0) * density);
            int x = Math.round((float) previewFrame.optDouble("x", 0) * density);
            int y = Math.round((float) previewFrame.optDouble("y", 0) * density);
            params = new CoordinatorLayout.LayoutParams(width, height);
            params.leftMargin = x;
            params.topMargin = y;
        } else {
            params = new CoordinatorLayout.LayoutParams(
                CoordinatorLayout.LayoutParams.MATCH_PARENT,
                CoordinatorLayout.LayoutParams.MATCH_PARENT
            );
        }
        previewView.setLayoutParams(params);

        if (originalWebViewBackgroundColor == null) {
            originalWebViewBackgroundColor = Color.WHITE;
        }
        bridge.getWebView().setBackgroundColor(Color.TRANSPARENT);
    }

    private void bindCameraUseCases(String facingMode, Double zoomLevel) {
        cameraProvider.unbindAll();

        Preview preview = new Preview.Builder().build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());

        imageCapture = new ImageCapture.Builder().setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY).build();

        CameraSelector selector = "user".equals(facingMode)
            ? CameraSelector.DEFAULT_FRONT_CAMERA
            : CameraSelector.DEFAULT_BACK_CAMERA;

        camera = cameraProvider.bindToLifecycle(getActivity(), selector, preview, imageCapture);
        applyZoom(zoomLevel, false);
    }

    @PluginMethod
    public void setZoom(PluginCall call) {
        Double zoomLevel = call.getDouble("zoomLevel", 1.0);
        Activity activity = getActivity();
        if (activity == null) {
            call.resolve();
            return;
        }
        activity.runOnUiThread(() -> {
            applyZoom(zoomLevel, true);
            call.resolve();
        });
    }

    private void applyZoom(Double zoomLevel, boolean animated) {
        if (camera == null) return;

        ZoomState zoomState = camera.getCameraInfo().getZoomState().getValue();
        float min = zoomState != null ? zoomState.getMinZoomRatio() : 1f;
        float max = zoomState != null ? zoomState.getMaxZoomRatio() : 1f;
        float current = zoomState != null ? zoomState.getZoomRatio() : 1f;
        float target = Math.max(min, Math.min(zoomLevel.floatValue(), max));

        if (!animated) {
            camera.getCameraControl().setZoomRatio(target);
            return;
        }

        ValueAnimator animator = ValueAnimator.ofFloat(current, target);
        animator.setDuration(200);
        animator.addUpdateListener(animation -> {
            if (camera != null) {
                camera.getCameraControl().setZoomRatio((float) animation.getAnimatedValue());
            }
        });
        animator.start();
    }

    @PluginMethod
    public void capture(PluginCall call) {
        if (imageCapture == null) {
            call.reject("camera preview is not running");
            return;
        }

        File outputFile = new File(getContext().getCacheDir(), "native_camera_capture.jpg");
        ImageCapture.OutputFileOptions outputOptions = new ImageCapture.OutputFileOptions.Builder(outputFile).build();

        imageCapture.takePicture(
            outputOptions,
            cameraExecutor,
            new ImageCapture.OnImageSavedCallback() {
                @Override
                public void onImageSaved(ImageCapture.OutputFileResults outputFileResults) {
                    try {
                        String base64Data = readFileAsBase64(outputFile);
                        JSObject result = new JSObject();
                        result.put("data", base64Data);
                        result.put("mimeType", "image/jpeg");
                        call.resolve(result);
                    } catch (Exception e) {
                        call.reject("photo data unavailable");
                    } finally {
                        outputFile.delete();
                    }
                }

                @Override
                public void onError(ImageCaptureException exception) {
                    call.reject(exception.getMessage());
                }
            }
        );
    }

    private String readFileAsBase64(File file) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (FileInputStream inputStream = new FileInputStream(file)) {
            byte[] chunk = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(chunk)) != -1) {
                buffer.write(chunk, 0, bytesRead);
            }
        }
        return Base64.encodeToString(buffer.toByteArray(), Base64.NO_WRAP);
    }

    @PluginMethod
    public void stopPreview(PluginCall call) {
        stopPreviewInternal();
        call.resolve();
    }

    private void stopPreviewInternal() {
        Activity activity = getActivity();
        if (activity == null) return;

        activity.runOnUiThread(() -> {
            if (cameraProvider != null) {
                cameraProvider.unbindAll();
            }
            camera = null;
            imageCapture = null;
            if (previewView != null) {
                previewView.setVisibility(View.INVISIBLE);
            }
            if (originalWebViewBackgroundColor != null) {
                bridge.getWebView().setBackgroundColor(originalWebViewBackgroundColor);
            }
        });
    }
}
