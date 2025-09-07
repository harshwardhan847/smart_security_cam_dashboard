import React from "react";
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
import { Settings, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

interface CameraControlsProps {
  settings: {
    resolution: string;
    brightness: number;
    contrast: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    rotation: number;
  };
  onSettingsChange: (settings: any) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resolutions = [
    { value: "QVGA", label: "QVGA (320x240)" },
    { value: "VGA", label: "VGA (640x480)" },
    { value: "SVGA", label: "SVGA (800x600)" },
    { value: "XGA", label: "XGA (1024x768)" },
    { value: "UXGA", label: "UXGA (1600x1200)" },
  ];

  const rotateVideo = () => {
    const newRotation = (settings.rotation + 90) % 360;
    updateSetting("rotation", newRotation);
  };

  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="w-5 h-5 text-primary" />
          Camera Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resolution */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Resolution
          </Label>
          <Select
            value={settings.resolution}
            onValueChange={(value) => updateSetting("resolution", value)}
          >
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
          <Label className="text-sm font-medium text-foreground">
            Video Transform
          </Label>

          <div className="flex gap-2">
            <Button
              variant={settings.flipHorizontal ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                updateSetting("flipHorizontal", !settings.flipHorizontal)
              }
              className="flex-1"
            >
              <FlipHorizontal className="w-4 h-4 mr-1" />
              Flip H
            </Button>

            <Button
              variant={settings.flipVertical ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                updateSetting("flipVertical", !settings.flipVertical)
              }
              className="flex-1"
            >
              <FlipVertical className="w-4 h-4 mr-1" />
              Flip V
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={rotateVideo}
              className="flex-1"
            >
              <RotateCw className="w-4 h-4 mr-1" />
              {settings.rotation}°
            </Button>
          </div>
        </div>

        {/* Brightness */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-sm font-medium text-foreground">
              Brightness
            </Label>
            <span className="text-sm text-muted-foreground">
              {settings.brightness}%
            </span>
          </div>
          <Slider
            value={[settings.brightness]}
            onValueChange={(value) => updateSetting("brightness", value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-sm font-medium text-foreground">
              Contrast
            </Label>
            <span className="text-sm text-muted-foreground">
              {settings.contrast}%
            </span>
          </div>
          <Slider
            value={[settings.contrast]}
            onValueChange={(value) => updateSetting("contrast", value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
