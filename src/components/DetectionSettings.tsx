import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, PawPrint, Brain } from "lucide-react";

interface DetectionSettingsProps {
  settings: {
    faceDetection: boolean;
    animalDetection: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const DetectionSettings: React.FC<DetectionSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Brain className="w-5 h-5 text-primary" />
          AI Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Face Detection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-foreground" />
              <Label className="text-sm font-medium text-foreground">
                Face Detection
              </Label>
            </div>
            <Switch
              checked={settings.faceDetection}
              onCheckedChange={(checked) =>
                updateSetting("faceDetection", checked)
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Detect and track human faces in the video stream with bounding
            boxes.
          </p>
        </div>

        <Separator />

        {/* Animal Detection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-foreground" />
              <Label className="text-sm font-medium text-foreground">
                Animal Detection
              </Label>
            </div>
            <Switch
              checked={settings.animalDetection}
              onCheckedChange={(checked) =>
                updateSetting("animalDetection", checked)
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Detect pets and wildlife using basic object classification models.
          </p>
        </div>

        {/* Status Indicator */}
        {(settings.faceDetection || settings.animalDetection) && (
          <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                AI Detection Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {settings.faceDetection && settings.animalDetection
                ? "Face and animal detection are enabled"
                : settings.faceDetection
                ? "Face detection is enabled"
                : "Animal detection is enabled"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
