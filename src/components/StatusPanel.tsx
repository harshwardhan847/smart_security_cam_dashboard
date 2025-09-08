import React, { useState, useEffect, useRef } from "react";
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
  const [uptime, setUptime] = useState("00:00:00");
  const startTimeRef = useRef(Date.now());
  const isOnline = true;

  // Real uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
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

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-surveillance-green";
    if (strength >= 60) return "text-surveillance-amber";
    return "text-surveillance-red";
  };

  return (
    <Card className="gradient-card border-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Camera className="w-5 h-5 text-primary" />
          <span className="text-lg">System Status</span>
          <div className="ml-auto flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <span className="text-sm font-medium text-foreground block">
                Connection
              </span>
              <span className="text-xs text-muted-foreground">
                Camera Status
              </span>
            </div>
          </div>
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className={isOnline ? "bg-green-500 text-white" : ""}
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        <Separator />

        {/* Recording Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Video
              className={`w-5 h-5 ${
                isRecording ? "text-red-500" : "text-muted-foreground"
              }`}
            />
            <div>
              <span className="text-sm font-medium text-foreground block">
                Recording
              </span>
              <span className="text-xs text-muted-foreground">
                Video Status
              </span>
            </div>
          </div>
          <Badge
            variant={isRecording ? "destructive" : "secondary"}
            className={isRecording ? "bg-red-500 text-white animate-pulse" : ""}
          >
            {isRecording ? "Active" : "Stopped"}
          </Badge>
        </div>

        {/* Detection Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Activity
                className={`w-4 h-4 ${
                  motionEnabled ? "text-amber-500" : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium text-foreground">
                Motion
              </span>
            </div>
            <Badge
              variant={motionEnabled ? "default" : "secondary"}
              className={motionEnabled ? "bg-amber-500 text-black" : ""}
            >
              {motionEnabled ? "ON" : "OFF"}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Brain
                className={`w-4 h-4 ${
                  detectionEnabled ? "text-blue-500" : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium text-foreground">AI</span>
            </div>
            <Badge
              variant={detectionEnabled ? "default" : "secondary"}
              className={detectionEnabled ? "bg-blue-500 text-white" : ""}
            >
              {detectionEnabled ? "ON" : "OFF"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Uptime & Camera Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Uptime
              </span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {uptime}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-foreground">
              Camera IP
            </span>
            <p className="text-xs font-mono text-muted-foreground break-all bg-muted/50 p-2 rounded">
              {new URL(cameraUrl).hostname}:{new URL(cameraUrl).port || "80"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
