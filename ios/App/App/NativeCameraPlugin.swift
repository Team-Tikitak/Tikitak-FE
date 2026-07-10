import AVFoundation
import Capacitor
import UIKit
import WebKit

@objc(NativeCameraPlugin)
class NativeCameraPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "NativeCameraPlugin"
    let jsName = "NativeCamera"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startPreview", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setZoom", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "capture", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopPreview", returnType: CAPPluginReturnPromise)
    ]

    private let session = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "space.tikitak.native-camera.session")
    private let photoOutput = AVCapturePhotoOutput()
    private var previewView: UIView?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var originalWebViewBackgroundColor: UIColor?
    private var originalWebViewIsOpaque = true
    private var originalScrollViewBackgroundColor: UIColor?
    private var currentInput: AVCaptureDeviceInput?
    private var captureDelegates: [PhotoCaptureDelegate] = []

    @objc func startPreview(_ call: CAPPluginCall) {
        let facingMode = call.getString("facingMode", "environment")
        let zoomLevel = call.getDouble("zoomLevel", 1)

        ensureCameraPermission { [weak self] granted in
            guard let self = self else { return }
            guard granted else {
                call.reject("permission denied")
                return
            }

            DispatchQueue.main.async {
                self.attachPreviewView()
            }

            self.sessionQueue.async {
                do {
                    try self.configureSession(facingMode: facingMode, zoomLevel: zoomLevel)
                    if !self.session.isRunning {
                        self.session.startRunning()
                    }
                    DispatchQueue.main.async {
                        self.showPreviewView()
                        call.resolve()
                    }
                } catch {
                    call.reject(error.localizedDescription)
                }
            }
        }
    }

    @objc func setZoom(_ call: CAPPluginCall) {
        let zoomLevel = call.getDouble("zoomLevel", 1)
        sessionQueue.async { [weak self] in
            guard let self = self else { return }
            guard let device = self.currentInput?.device else {
                call.resolve()
                return
            }
            do {
                try self.applyZoom(zoomLevel, to: device, animated: true)
                call.resolve()
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func capture(_ call: CAPPluginCall) {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }
            guard self.session.isRunning else {
                call.reject("camera preview is not running")
                return
            }

            let settings: AVCapturePhotoSettings
            if self.photoOutput.availablePhotoCodecTypes.contains(.jpeg) {
                settings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.jpeg])
            } else {
                settings = AVCapturePhotoSettings()
            }
            settings.flashMode = .off

            let delegate = PhotoCaptureDelegate(
                resolve: { [weak self] data in
                    call.resolve([
                        "data": data.base64EncodedString(),
                        "mimeType": "image/jpeg"
                    ])
                    self?.removeFinishedDelegates()
                },
                reject: { [weak self] message in
                    call.reject(message)
                    self?.removeFinishedDelegates()
                }
            )
            self.captureDelegates.append(delegate)
            self.photoOutput.capturePhoto(with: settings, delegate: delegate)
        }
    }

    @objc func stopPreview(_ call: CAPPluginCall) {
        stopPreview()
        call.resolve()
    }

    private func ensureCameraPermission(_ completion: @escaping (Bool) -> Void) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            completion(true)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video, completionHandler: completion)
        default:
            completion(false)
        }
    }

    private func attachPreviewView() {
        guard let webView = bridge?.webView else { return }

        if previewView == nil {
            let view = NativeCameraPreviewView(frame: webView.bounds)
            view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            view.backgroundColor = .black

            let layer = AVCaptureVideoPreviewLayer(session: session)
            layer.videoGravity = .resizeAspectFill
            layer.contentsScale = UIScreen.main.scale
            layer.frame = view.bounds
            view.layer.addSublayer(layer)

            webView.insertSubview(view, at: 0)
            previewView = view
            previewLayer = layer
        }

        previewView?.frame = webView.bounds
        previewLayer?.frame = previewView?.bounds ?? .zero
        previewView?.isHidden = true

        if originalWebViewBackgroundColor == nil {
            originalWebViewBackgroundColor = webView.backgroundColor
            originalWebViewIsOpaque = webView.isOpaque
            originalScrollViewBackgroundColor = webView.scrollView.backgroundColor
        }
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
    }

    private func showPreviewView() {
        previewView?.isHidden = false
    }

    private func configureSession(facingMode: String, zoomLevel: Double) throws {
        session.beginConfiguration()
        defer { session.commitConfiguration() }

        session.sessionPreset = .photo

        if let currentInput = currentInput {
            session.removeInput(currentInput)
            self.currentInput = nil
        }

        let position: AVCaptureDevice.Position = facingMode == "user" ? .front : .back
        guard let device = selectDevice(position: position) else {
            throw NativeCameraError.deviceUnavailable
        }

        let input = try AVCaptureDeviceInput(device: device)
        guard session.canAddInput(input) else {
            throw NativeCameraError.inputUnavailable
        }
        session.addInput(input)
        currentInput = input

        if !session.outputs.contains(photoOutput) {
            guard session.canAddOutput(photoOutput) else {
                throw NativeCameraError.outputUnavailable
            }
            session.addOutput(photoOutput)
        }

        if let connection = photoOutput.connection(with: .video), connection.isVideoOrientationSupported {
            connection.videoOrientation = .portrait
        }
        try configureDeviceForPreview(device)
        try applyZoom(zoomLevel, to: device, animated: false)
    }

    private func selectDevice(position: AVCaptureDevice.Position) -> AVCaptureDevice? {
        if position == .front {
            return AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front)
        }

        return AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back)
            ?? AVCaptureDevice.default(.builtInDualWideCamera, for: .video, position: .back)
            ?? AVCaptureDevice.default(.builtInTripleCamera, for: .video, position: .back)
            ?? AVCaptureDevice.default(.builtInDualCamera, for: .video, position: .back)
    }

    private func applyZoom(_ zoomLevel: Double, to device: AVCaptureDevice, animated: Bool) throws {
        let targetZoom = max(1, min(CGFloat(zoomLevel), device.activeFormat.videoMaxZoomFactor))
        try device.lockForConfiguration()
        defer { device.unlockForConfiguration() }

        guard abs(device.videoZoomFactor - targetZoom) > 0.01 else {
            return
        }

        if !animated {
            device.videoZoomFactor = targetZoom
            return
        }

        if device.isRampingVideoZoom {
            device.cancelVideoZoomRamp()
        }
        device.ramp(toVideoZoomFactor: targetZoom, withRate: 2.8)
    }

    private func configureDeviceForPreview(_ device: AVCaptureDevice) throws {
        try device.lockForConfiguration()
        defer { device.unlockForConfiguration() }

        if device.isFocusModeSupported(.continuousAutoFocus) {
            device.focusMode = .continuousAutoFocus
        }
        if device.isExposureModeSupported(.continuousAutoExposure) {
            device.exposureMode = .continuousAutoExposure
        }
        if device.isWhiteBalanceModeSupported(.continuousAutoWhiteBalance) {
            device.whiteBalanceMode = .continuousAutoWhiteBalance
        }
        if device.isFocusPointOfInterestSupported {
            device.focusPointOfInterest = CGPoint(x: 0.5, y: 0.5)
        }
        if device.isExposurePointOfInterestSupported {
            device.exposurePointOfInterest = CGPoint(x: 0.5, y: 0.5)
        }
        if device.isSubjectAreaChangeMonitoringEnabled == false {
            device.isSubjectAreaChangeMonitoringEnabled = true
        }
    }

    private func stopPreview() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }
            if self.session.isRunning {
                self.session.stopRunning()
            }
            DispatchQueue.main.async {
                self.previewView?.isHidden = true
                if let webView = self.bridge?.webView {
                    webView.isOpaque = self.originalWebViewIsOpaque
                    webView.backgroundColor = self.originalWebViewBackgroundColor
                    webView.scrollView.backgroundColor = self.originalScrollViewBackgroundColor
                }
            }
        }
    }

    private func removeFinishedDelegates() {
        captureDelegates.removeAll { $0.finished }
    }
}

private final class NativeCameraPreviewView: UIView {
    override func layoutSubviews() {
        super.layoutSubviews()
        layer.sublayers?.forEach { $0.frame = bounds }
    }
}

private enum NativeCameraError: LocalizedError {
    case deviceUnavailable
    case inputUnavailable
    case outputUnavailable

    var errorDescription: String? {
        switch self {
        case .deviceUnavailable:
            return "camera device unavailable"
        case .inputUnavailable:
            return "camera input unavailable"
        case .outputUnavailable:
            return "camera output unavailable"
        }
    }
}

private final class PhotoCaptureDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    private let resolve: (Data) -> Void
    private let reject: (String) -> Void
    private(set) var finished = false

    init(resolve: @escaping (Data) -> Void, reject: @escaping (String) -> Void) {
        self.resolve = resolve
        self.reject = reject
    }

    func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        if let error = error {
            finished = true
            reject(error.localizedDescription)
            return
        }

        guard let data = photo.fileDataRepresentation() else {
            finished = true
            reject("photo data unavailable")
            return
        }

        finished = true
        resolve(data)
    }
}
