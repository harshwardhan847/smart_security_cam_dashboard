import React, { useState } from "react";
import { VideoStream } from "./VideoStream";
import { CameraControls } from "./CameraControls";
import { MotionDetection } from "./MotionDetection";
import { DetectionSettings } from "./DetectionSettings";
import { AlertsPanel } from "./AlertsPanel";
import { StatusPanel } from "./StatusPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SurveillanceDashboard = () => {
  const [cameraSettings, setCameraSettings] = useState({
    resolution: "VGA",
    brightness: 50,
    contrast: 50,
    flipHorizontal: false,
    flipVertical: false,
    rotation: 0,
  });

  const [motionSettings, setMotionSettings] = useState({
    enabled: false,
    sensitivity: 50,
    zones: [],
    recordOnMotion: false,
  });

  const [detectionSettings, setDetectionSettings] = useState({
    faceDetection: false,
    animalDetection: false,
  });

  const [streamUrl] = useState("http://192.168.1.59:80/stream");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ESP32-CAM Surveillance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Advanced home security monitoring and control system
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Stream - Main Content */}
          <div className="lg:col-span-8">
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  Live Video Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoStream
                  streamUrl={streamUrl}
                  settings={cameraSettings}
                  motionSettings={motionSettings}
                  detectionSettings={detectionSettings}
                  onAlert={(alert) =>
                    setAlerts((prev: any[]) => [alert, ...prev.slice(0, 9)])
                  }
                  isRecording={isRecording}
                  onRecordingChange={setIsRecording}
                />
              </CardContent>
            </Card>
          </div>

          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status Panel */}
            <StatusPanel
              cameraUrl={streamUrl}
              isRecording={isRecording}
              motionEnabled={motionSettings.enabled}
              detectionEnabled={
                detectionSettings.faceDetection ||
                detectionSettings.animalDetection
              }
            />

            {/* Camera Controls */}
            <CameraControls
              settings={cameraSettings}
              onSettingsChange={setCameraSettings}
            />

            {/* Motion Detection */}
            <MotionDetection
              settings={motionSettings}
              onSettingsChange={setMotionSettings}
            />

            {/* Detection Settings */}
            {/* <DetectionSettings
              settings={detectionSettings}
              onSettingsChange={setDetectionSettings}
            /> */}
          </div>
        </div>

        {/* Alerts Panel - Full Width */}
        <div className="mt-6">
          <AlertsPanel alerts={alerts} onClearAlerts={() => setAlerts([])} />
        </div>
      </div>
    </div>
  );
};
