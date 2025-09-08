import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface CameraControlsProps {
  settings: {
    resolution: string;
    brightness: number;
    contrast: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    rotation: number;
    saturation?: number;
    sharpness?: number;
    exposure?: number;
    whiteBalance?: string;
    nightMode?: boolean;
    autoFocus?: boolean;
  };
  onSettingsChange: (settings: any) => void;
  cameraUrl?: string;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  settings,
  onSettingsChange,
  cameraUrl,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<any>(null);

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resolutions = [
    { value: "QVGA", label: "QVGA (320x240)", width: 320, height: 240 },
    { value: "VGA", label: "VGA (640x480)", width: 640, height: 480 },
    { value: "SVGA", label: "SVGA (800x600)", width: 800, height: 600 },
    { value: "XGA", label: "XGA (1024x768)", width: 1024, height: 768 },
    { value: "UXGA", label: "UXGA (1600x1200)", width: 1600, height: 1200 },
  ];

  // Send camera control command to ESP32-CAM
  const sendCameraCommand = async (command: string, value?: any) => {
    try {
      setIsApplying(true);
      const controlUrl = `http://192.168.1.59:81/control?var=${command}&val=${value}`;

      const response = await fetch(controlUrl, {
        method: "GET",
        mode: "no-cors",
      });

      toast.success("Camera setting applied", {
        description: `${command} set to ${value}`,
      });
    } catch (error) {
      toast.error("Failed to apply setting", {
        description: "Camera may not support this control",
      });
    } finally {
      setIsApplying(false);
    }
  };
  const sendFlashCommand = async (state: string) => {
    try {
      setIsApplying(true);
      const controlUrl = `http://192.168.1.59:81/flash?state=${state}`;

      const response = await fetch(controlUrl, {
        method: "GET",
        mode: "no-cors",
      });

      toast.success("Camera setting applied", {
        description: `Flash set to ${state}`,
      });
    } catch (error) {
      toast.error("Failed to apply setting", {
        description: "Camera may not support this control",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const rotateVideo = () => {
    const newRotation = (settings.rotation + 90) % 360;
    updateSetting("rotation", newRotation);
  };

  const applyResolution = (resolution: string) => {
    updateSetting("resolution", resolution);
    const res = resolutions.find((r) => r.value === resolution);
    if (res) {
      sendCameraCommand("framesize", res.value);
    }
  };

  const applyBrightness = (brightness: number) => {
    updateSetting("brightness", brightness);
    sendCameraCommand("brightness", brightness);
  };

  const applyContrast = (contrast: number) => {
    updateSetting("contrast", contrast);
    sendCameraCommand("contrast", contrast);
  };

  const applySaturation = (saturation: number) => {
    updateSetting("saturation", saturation);
    sendCameraCommand("saturation", saturation);
  };

  const applySharpness = (sharpness: number) => {
    updateSetting("sharpness", sharpness);
    sendCameraCommand("sharpness", sharpness);
  };

  const applyExposure = (exposure: number) => {
    updateSetting("exposure", exposure);
    sendCameraCommand("exposure", exposure);
  };

  const applyWhiteBalance = (whiteBalance: string) => {
    updateSetting("whiteBalance", whiteBalance);
    sendCameraCommand("awb", whiteBalance === "auto" ? 1 : 0);
  };

  const toggleNightMode = async (enabled: boolean) => {
    updateSetting("nightMode", enabled);
    // sendCameraCommand("night_vision", enabled ? 1 : 0);
    if (enabled) {
      await sendFlashCommand("on");
    } else {
      await sendFlashCommand("off");
    }
  };

  const toggleAutoFocus = (enabled: boolean) => {
    updateSetting("autoFocus", enabled);
    sendCameraCommand("autofocus", enabled ? 1 : 0);
  };

  const resetToDefaults = () => {
    const defaults = {
      resolution: "VGA",
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      exposure: 0,
      whiteBalance: "auto",
      nightMode: false,
      autoFocus: true,
    };

    Object.entries(defaults).forEach(([key, value]) => {
      updateSetting(key, value);
      if (key !== "resolution") {
        sendCameraCommand(key, value);
      }
    });

    toast.success("Camera reset to defaults");
  };

  return (
    <Card className="gradient-card border-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="w-5 h-5 text-primary" />
          <span className="text-lg">Camera Controls</span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              disabled={isApplying}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resolution */}
        <div className="space-y-2 hidden">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Resolution
          </Label>
          <Select value={settings.resolution} onValueChange={applyResolution}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resolutions.map((res) => (
                <SelectItem key={res.value} value={res.value}>
                  {res.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transform Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Video Transform
          </Label>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={settings.flipHorizontal ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                updateSetting("flipHorizontal", !settings.flipHorizontal)
              }
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-xs">Flip H</span>
            </Button>

            <Button
              variant={settings.flipVertical ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                updateSetting("flipVertical", !settings.flipVertical)
              }
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <FlipVertical className="w-4 h-4" />
              <span className="text-xs">Flip V</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={rotateVideo}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-xs">{settings.rotation}°</span>
            </Button>
          </div>
        </div>

        {/* Image Quality Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">
            Image Quality
          </Label>

          {/* Brightness */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Brightness
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {settings.brightness || 0}
              </span>
            </div>
            <Slider
              value={[settings.brightness || 0]}
              onValueChange={(value) => applyBrightness(value[0])}
              min={-2}
              max={2}
              step={1}
              className="w-full"
            />
          </div>
          {/* Toggle Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Night Mode
              </Label>
              <Switch
                checked={settings.nightMode || false}
                onCheckedChange={toggleNightMode}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        {isApplying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Applying camera settings...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
