import React, { useState, useEffect } from "react";
import { VideoStream } from "./VideoStream";
import { CameraControls } from "./CameraControls";
import { MotionDetection } from "./MotionDetection";
import { DetectionSettings } from "./DetectionSettings";
import { AlertsPanel } from "./AlertsPanel";
import { StatusPanel } from "./StatusPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

// Local storage utility functions
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

export const SurveillanceDashboard = () => {
  // Default settings
  const defaultCameraSettings = {
    resolution: "VGA",
    brightness: 50,
    contrast: 50,
    flipHorizontal: false,
    flipVertical: false,
    rotation: 0,
  };

  const defaultMotionSettings = {
    enabled: false,
    sensitivity: 50,
    zones: [],
    recordOnMotion: false,
  };

  const defaultDetectionSettings = {
    faceDetection: false,
    animalDetection: false,
  };

  // Initialize state with localStorage values
  const [cameraSettings, setCameraSettings] = useState(() =>
    loadFromStorage("surveillance-camera-settings", defaultCameraSettings)
  );

  const [motionSettings, setMotionSettings] = useState(() =>
    loadFromStorage("surveillance-motion-settings", defaultMotionSettings)
  );

  const [detectionSettings, setDetectionSettings] = useState(() =>
    loadFromStorage("surveillance-detection-settings", defaultDetectionSettings)
  );

  const [streamUrl, setStreamUrl] = useState(() =>
    loadFromStorage("surveillance-stream-url", "http://192.168.1.59:80/stream")
  );
  const [alerts, setAlerts] = useState<any[]>(() =>
    loadFromStorage("surveillance-alerts", [])
  );
  const [isRecording, setIsRecording] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveToStorage("surveillance-camera-settings", cameraSettings);
  }, [cameraSettings]);

  useEffect(() => {
    saveToStorage("surveillance-motion-settings", motionSettings);
  }, [motionSettings]);

  useEffect(() => {
    saveToStorage("surveillance-detection-settings", detectionSettings);
  }, [detectionSettings]);

  useEffect(() => {
    saveToStorage("surveillance-stream-url", streamUrl);
  }, [streamUrl]);

  useEffect(() => {
    saveToStorage("surveillance-alerts", alerts);
  }, [alerts]);

  // Function to clear all stored data
  const clearAllData = () => {
    if (typeof window === "undefined") return;

    const keys = [
      "surveillance-camera-settings",
      "surveillance-motion-settings",
      "surveillance-detection-settings",
      "surveillance-stream-url",
      "surveillance-alerts",
    ];

    keys.forEach((key) => localStorage.removeItem(key));

    // Reset to default values
    setCameraSettings(defaultCameraSettings);
    setMotionSettings(defaultMotionSettings);
    setDetectionSettings(defaultDetectionSettings);
    setStreamUrl("http://192.168.1.59:80/stream");
    setAlerts([]);

    toast.success("All data cleared", {
      description: "Settings and alerts have been reset to defaults",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ESP32-CAM Surveillance Dashboard
              </h1>
              <p className="text-muted-foreground">
                Advanced home security monitoring and control system
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllData}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
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

            {/* Stream Settings */}
            <Card className="gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Stream Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="stream-url"
                    className="text-sm font-medium text-foreground"
                  >
                    Camera Stream URL
                  </Label>
                  <Input
                    id="stream-url"
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="http://192.168.1.59:80/stream"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

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
