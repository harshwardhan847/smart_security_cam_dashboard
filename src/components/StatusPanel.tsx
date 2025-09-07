import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wifi,
  WifiOff,
  Camera,
  Activity,
  Brain,
  Video,
  Clock,
  Signal,
} from "lucide-react";

interface StatusPanelProps {
  cameraUrl: string;
  isRecording: boolean;
  motionEnabled: boolean;
  detectionEnabled: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  cameraUrl,
  isRecording,
  motionEnabled,
  detectionEnabled,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [uptime, setUptime] = useState("00:00:00");
  const [signalStrength, setSignalStrength] = useState(85);

  useEffect(() => {
    // Simulate uptime counter
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setUptime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate connectivity check
    const checkConnection = () => {
      // In a real implementation, you would ping the camera endpoint
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
      setSignalStrength(Math.floor(Math.random() * 30) + 70); // 70-100% signal
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [cameraUrl]);

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-surveillance-green";
    if (strength >= 60) return "text-surveillance-amber";
    return "text-surveillance-red";
  };

  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Camera className="w-5 h-5 text-primary" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-surveillance-green" />
            ) : (
              <WifiOff className="w-4 h-4 text-surveillance-red" />
            )}
            <span className="text-sm font-medium text-foreground">
              Connection
            </span>
          </div>
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className={isOnline ? "bg-surveillance-green text-white" : ""}
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Signal Strength */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Signal className={`w-4 h-4 ${getSignalColor(signalStrength)}`} />
            <span className="text-sm font-medium text-foreground">Signal</span>
          </div>
          <span
            className={`text-sm font-medium ${getSignalColor(signalStrength)}`}
          >
            {signalStrength}%
          </span>
        </div>

        <Separator />

        {/* Recording Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video
              className={`w-4 h-4 ${
                isRecording ? "text-surveillance-red" : "text-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              Recording
            </span>
          </div>
          <Badge
            variant={isRecording ? "destructive" : "secondary"}
            className={
              isRecording ? "bg-surveillance-red text-white animate-pulse" : ""
            }
          >
            {isRecording ? "Active" : "Stopped"}
          </Badge>
        </div>

        {/* Motion Detection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity
              className={`w-4 h-4 ${
                motionEnabled
                  ? "text-surveillance-amber"
                  : "text-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              Motion Detection
            </span>
          </div>
          <Badge
            variant={motionEnabled ? "default" : "secondary"}
            className={motionEnabled ? "bg-surveillance-amber text-black" : ""}
          >
            {motionEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* AI Detection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain
              className={`w-4 h-4 ${
                detectionEnabled
                  ? "text-surveillance-blue"
                  : "text-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium text-foreground">
              AI Detection
            </span>
          </div>
          <Badge
            variant={detectionEnabled ? "default" : "secondary"}
            className={
              detectionEnabled ? "bg-surveillance-blue text-white" : ""
            }
          >
            {detectionEnabled ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Separator />

        {/* Uptime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Uptime</span>
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            {uptime}
          </span>
        </div>

        {/* Camera IP */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-foreground">Camera IP</span>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {new URL(cameraUrl).hostname}:{new URL(cameraUrl).port || "80"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
