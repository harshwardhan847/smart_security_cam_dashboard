"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Download, Video, Square, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const TELEGRAM_PROXY_ENDPOINT = "/api/telegram-message"; // Safe backend proxy endpoint for Telegram
interface VideoStreamProps {
  streamUrl: string;
  settings: {
    flipHorizontal: boolean;
    flipVertical: boolean;
    rotation: number;
  };
  motionSettings: {
    enabled: boolean;
    sensitivity: number;
    zones: any[];
    recordOnMotion?: boolean;
    sendToTelegram?: boolean;
  };
  detectionSettings: {
    faceDetection: boolean;
    animalDetection: boolean;
  };
  onAlert: (alert: any) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export const VideoStream: React.FC<VideoStreamProps> = ({
  streamUrl,
  settings,
  motionSettings,
  detectionSettings,
  onAlert,
  isRecording,
  onRecordingChange,
}) => {
  const videoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingDrawRafRef = useRef<number | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [motionDetected, setMotionDetected] = useState(false);
  const lastNotificationTime = useRef(0);
  const detectionCooldown = 2000; // 2 seconds cooldown between notifications
  const lastImageData = useRef<ImageData | null>(null);
  // Auto-stop recording when motion-triggered recording sees no motion for a while
  const autoRecordingRef = useRef(false);
  const noMotionStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const NO_MOTION_STOP_MS = 10000; // stop after 10s without motion
  // Store current motion settings for use in recording callbacks
  const motionSettingsRef = useRef(motionSettings);

  // Recording functions
  const pickSupportedMimeType = (): string | undefined => {
    const types = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp9",
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return undefined;
  };

  const startRecordingDrawLoop = () => {
    if (!videoRef.current) return;

    const draw = () => {
      if (!recordingCanvasRef.current || !videoRef.current) return;
      const rc = recordingCanvasRef.current;
      const rctx = rc.getContext("2d");
      if (!rctx) return;

      // Keep canvas size in sync with image natural size
      const w = videoRef.current.naturalWidth || 640;
      const h = videoRef.current.naturalHeight || 480;
      if (rc.width !== w || rc.height !== h) {
        rc.width = w;
        rc.height = h;
      }
      rctx.drawImage(videoRef.current, 0, 0, rc.width, rc.height);
      recordingDrawRafRef.current = window.requestAnimationFrame(draw);
    };
    recordingDrawRafRef.current = window.requestAnimationFrame(draw);
  };

  const stopRecordingDrawLoop = () => {
    if (recordingDrawRafRef.current !== null) {
      window.cancelAnimationFrame(recordingDrawRafRef.current);
      recordingDrawRafRef.current = null;
    }
  };

  const startRecording = useCallback(() => {
    try {
      if (!videoRef.current) return;

      // Create a dedicated offscreen canvas for recording
      if (!recordingCanvasRef.current) {
        recordingCanvasRef.current = document.createElement("canvas");
      }

      const rc = recordingCanvasRef.current;
      const w = videoRef.current.naturalWidth || 640;
      const h = videoRef.current.naturalHeight || 480;
      rc.width = w;
      rc.height = h;

      // Start draw loop copying frames from <img> to canvas
      startRecordingDrawLoop();

      // Capture stream from the recording canvas
      const stream = (rc as HTMLCanvasElement).captureStream(25);
      const mimeType = pickSupportedMimeType();
      mediaRecorderRef.current = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        stopRecordingDrawLoop();
        const blob = new Blob(recordedChunksRef.current, {
          type: mimeType || "video/webm",
        });

        // If this was a motion-triggered recording, send video to Telegram if enabled
        console.log("Recording stopped:", {
          autoRecording: autoRecordingRef.current,
          sendToTelegram: motionSettingsRef.current.sendToTelegram,
          blobSize: blob.size,
        });

        if (
          autoRecordingRef.current &&
          motionSettingsRef.current.sendToTelegram
        ) {
          console.log("Sending motion-triggered video to Telegram");
          const messageText = `🎥 <b>Motion Recording Complete</b>\n\n📅 Time: ${new Date().toLocaleString()}\n📹 Camera: ESP32-CAM Surveillance System\n⏱️ Duration: Motion-triggered recording\n\nThis video was automatically recorded due to detected motion.`;
          sendTelegramMessage(messageText, undefined, blob);
        } else if (!autoRecordingRef.current) {
          // Only download for manual recordings (not motion-triggered)
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `surveillance-${new Date().toISOString()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        }

        // Reset auto recording flag after processing
        autoRecordingRef.current = false;
        recordedChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      onRecordingChange(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      toast.error("Recording Error", {
        description: "Could not start recording",
      });
    }
  }, [onRecordingChange]);

  const stopRecording = useCallback(() => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } finally {
      onRecordingChange(false);
      stopRecordingDrawLoop();
    }
  }, [onRecordingChange]);

  // Motion detection function
  const detectMotion = useCallback(
    (currentFrame: ImageData, threshold: number) => {
      if (!lastImageData.current) {
        lastImageData.current = currentFrame;
        return false;
      }

      let diffCount = 0;
      const { data: currentData } = currentFrame;
      const { data: lastData } = lastImageData.current;

      for (let i = 0; i < currentData.length; i += 4) {
        const rDiff = Math.abs(currentData[i] - lastData[i]);
        const gDiff = Math.abs(currentData[i + 1] - lastData[i + 1]);
        const bDiff = Math.abs(currentData[i + 2] - lastData[i + 2]);
        if (rDiff > threshold || gDiff > threshold || bDiff > threshold) {
          diffCount++;
        }
      }

      lastImageData.current = currentFrame;
      const totalPixels = currentFrame.width * currentFrame.height;
      const motionDetected = diffCount > totalPixels * 0.01;

      console.log("Motion detection:", {
        diffCount,
        totalPixels,
        threshold,
        percentage: (diffCount / totalPixels) * 100,
        motionDetected,
      });

      return motionDetected;
    },
    []
  );

  // Telegram message sender - call your proxy here to secure bot token
  const sendTelegramMessage = async (
    text: string,
    imageBlob?: Blob,
    videoBlob?: Blob
  ) => {
    try {
      console.log("Sending Telegram message:", {
        text: text.substring(0, 50) + "...",
        hasImage: !!imageBlob,
        hasVideo: !!videoBlob,
        imageSize: imageBlob?.size,
        videoSize: videoBlob?.size,
      });

      const formData = new FormData();
      formData.append("text", text);

      if (imageBlob) {
        formData.append("image", imageBlob, "motion-detected.png");
      }

      if (videoBlob) {
        formData.append("video", videoBlob, "motion-recording.webm");
      }

      const response = await fetch(TELEGRAM_PROXY_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram API error:", errorText);
      } else {
        console.log("Telegram message sent successfully");
      }
    } catch (err) {
      console.error("Telegram message error", err);
    }
  };

  // Browser notification
  const showBrowserNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  // Motion detection handler
  const handleMotionDetection = useCallback(
    async (motionDetected: boolean) => {
      if (motionDetected) {
        const now = Date.now();
        if (now - lastNotificationTime.current > detectionCooldown) {
          setMotionDetected(true);
          lastNotificationTime.current = now;

          // Create alert
          const alert = {
            id: Date.now(),
            type: "motion",
            timestamp: new Date().toISOString(),
            message: "Motion detected in camera stream",
            severity: "high",
          };

          onAlert(alert);

          // Capture image for Telegram if enabled
          if (motionSettings.sendToTelegram) {
            const imageBlob = await captureImageForTelegram();

            // Send Telegram notification with image
            const messageText = `🚨 <b>Motion Detected!</b>\n\n📅 Time: ${new Date().toLocaleString()}\n📹 Camera: ESP32-CAM Surveillance System\n\nMotion has been detected in the monitored area.`;
            sendTelegramMessage(messageText, imageBlob || undefined);
          } else {
            // Send text-only notification
            sendTelegramMessage("Motion detected by ESP32-CAM React app");
          }

          // Show browser notification
          showBrowserNotification(
            "Motion Detected",
            "Motion detected in camera stream"
          );

          // Show toast notification
          toast.warning("Motion Detected!", {
            description: "Motion detected in camera stream",
            duration: 3000,
          });

          // Reset motion detected after 5 seconds
          setTimeout(() => setMotionDetected(false), 5000);
        }

        // Auto-start recording on first motion if not already recording and setting is enabled
        if (!isRecording && motionSettings.recordOnMotion) {
          autoRecordingRef.current = true;
          startRecording();
          toast("Recording Started", {
            description: "Motion-triggered recording",
          });
        }

        // Extend no-motion auto-stop timer on each motion
        if (noMotionStopTimerRef.current)
          clearTimeout(noMotionStopTimerRef.current);
        noMotionStopTimerRef.current = setTimeout(() => {
          // Only auto-stop if this session was started by motion
          if (autoRecordingRef.current) {
            stopRecording();
            toast("Recording Stopped", { description: "No motion for 10s" });
          }
        }, NO_MOTION_STOP_MS);
      }
    },
    [
      onAlert,
      detectionCooldown,
      isRecording,
      motionSettings.recordOnMotion,
      motionSettings.sendToTelegram,
      startRecording,
      stopRecording,
    ]
  );

  // Motion detection analysis
  useEffect(() => {
    console.log("Motion detection useEffect triggered", {
      motionEnabled: motionSettings.enabled,
      hasVideoRef: !!videoRef.current,
      hasCanvasRef: !!canvasRef.current,
    });

    if (!motionSettings.enabled || !videoRef.current || !canvasRef.current) {
      console.log("Motion detection conditions not met, returning early");
      return;
    }

    console.log("Starting motion detection interval");

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const img = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        console.log("Canvas context not available");
        return;
      }

      const width = img.naturalWidth || 320;
      const height = img.naturalHeight || 240;

      console.log("Processing frame", { width, height });

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Convert sensitivity to threshold (higher sensitivity = lower threshold)
      const threshold = Math.max(10, 100 - motionSettings.sensitivity);

      console.log("Running motion detection", { threshold });
      // Use direct motion detection
      const motionDetected = detectMotion(frame, threshold);
      if (motionDetected) {
        handleMotionDetection(true);
      }
    }, 500); // Analyze every 500ms

    return () => {
      console.log("Clearing motion detection interval");
      clearInterval(interval);
    };
  }, [motionSettings.enabled, motionSettings.sensitivity, detectMotion]);

  const getTransformStyle = () => {
    const transforms = [];

    if (settings.flipHorizontal) transforms.push("scaleX(-1)");
    if (settings.flipVertical) transforms.push("scaleY(-1)");
    if (settings.rotation) transforms.push(`rotate(${settings.rotation}deg)`);

    return transforms.length > 0 ? transforms.join(" ") : "none";
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 640;
    canvas.height = 480;

    // Draw the current frame
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `surveillance-${new Date().toISOString()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast("Image Captured", {
          description: "Screenshot saved successfully",
        });
      }
    });
  };

  // Capture image for Telegram sending
  const captureImageForTelegram = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current) {
        resolve(null);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(null);
        return;
      }

      // Use natural dimensions for better quality
      const width = videoRef.current.naturalWidth || 640;
      const height = videoRef.current.naturalHeight || 480;

      canvas.width = width;
      canvas.height = height;

      // Draw the current frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/png",
        0.9
      );
    });
  };

  const toggleRecording = () => {
    // Manual toggle overrides auto mode
    if (isRecording) {
      stopRecording();
      if (noMotionStopTimerRef.current) {
        clearTimeout(noMotionStopTimerRef.current);
        noMotionStopTimerRef.current = null;
      }
      toast("Recording Stopped", {
        description: "Video recording has been stopped",
      });
    } else {
      startRecording();
      autoRecordingRef.current = false; // manual session, don't auto-stop on timer
      if (noMotionStopTimerRef.current) {
        clearTimeout(noMotionStopTimerRef.current);
        noMotionStopTimerRef.current = null;
      }
      toast("Recording Started", {
        description: "Video recording has been started",
      });
    }
  };

  // Update motion settings ref when settings change
  useEffect(() => {
    motionSettingsRef.current = motionSettings;
  }, [motionSettings]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (noMotionStopTimerRef.current)
        clearTimeout(noMotionStopTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <img
          ref={videoRef}
          src={streamUrl}
          alt="ESP32-CAM Stream"
          className="w-full h-full object-contain"
          style={{
            transform: getTransformStyle(),
            border: motionDetected ? "3px solid red" : "3px solid green",
          }}
          crossOrigin="anonymous"
          onError={() => {
            toast.error("Stream Error", {
              description: "Unable to connect to camera stream",
            });
          }}
          onLoad={() => {
            // Ensure image is ready for motion detection
            if (videoRef.current) {
              videoRef.current.crossOrigin = "anonymous";
            }
          }}
          onLoadStart={() => {
            // Update FPS counter when new frame loads
            if ((window as any).updateStreamFps) {
              (window as any).updateStreamFps();
            }
          }}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            REC
          </div>
        )}

        {/* Detection Overlays */}
        {detections.map((detection, index) => (
          <div
            key={index}
            className="absolute border-2 border-primary bg-primary/20"
            style={{
              left: `${detection.x}%`,
              top: `${detection.y}%`,
              width: `${detection.width}%`,
              height: `${detection.height}%`,
            }}
          >
            <span className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
              {detection.type}
            </span>
          </div>
        ))}

        {/* Motion Detection Overlay */}
        {motionSettings.enabled && (
          <div className="absolute inset-0 border-2 border-dashed border-surveillance-green/50">
            <span
              className={`absolute top-2 left-2 px-2 py-1 text-xs rounded flex items-center gap-1 ${
                motionDetected
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-surveillance-green text-white"
              }`}
            >
              {motionDetected ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  Motion Detected!
                </>
              ) : (
                "Motion Detection: ON"
              )}
            </span>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={captureImage}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Capture
        </Button>

        <Button
          onClick={toggleRecording}
          variant={isRecording ? "destructive" : "default"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Start Recording
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
