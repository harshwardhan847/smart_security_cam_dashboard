import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Download, Video, Square } from "lucide-react";
import { toast } from "sonner";
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
  const [detections, setDetections] = useState<any[]>([]);

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

  const toggleRecording = () => {
    onRecordingChange(!isRecording);
    toast(isRecording ? "Recording Stopped" : "Recording Started", {
      description: isRecording
        ? "Video recording has been stopped"
        : "Video recording has been started",
    });
  };

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <img
          ref={videoRef}
          src={streamUrl}
          alt="ESP32-CAM Stream"
          className="w-full h-full object-contain"
          style={{ transform: getTransformStyle() }}
          onError={() => {
            toast.error("Stream Error", {
              description: "Unable to connect to camera stream",
            });
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
            <span className="absolute top-2 left-2 bg-surveillance-green text-white px-2 py-1 text-xs rounded">
              Motion Detection: ON
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
