import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Plus } from "lucide-react";

interface MotionDetectionProps {
  settings: {
    enabled: boolean;
    sensitivity: number;
    zones: any[];
  };
  onSettingsChange: (settings: any) => void;
}

export const MotionDetection: React.FC<MotionDetectionProps> = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const addDetectionZone = () => {
    const newZone = {
      id: Date.now(),
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      name: `Zone ${settings.zones.length + 1}`,
    };
    updateSetting("zones", [...settings.zones, newZone]);
  };

  const removeZone = (zoneId: number) => {
    updateSetting(
      "zones",
      settings.zones.filter((zone) => zone.id !== zoneId)
    );
  };

  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          {settings.enabled ? (
            <Eye className="w-5 h-5 text-surveillance-green" />
          ) : (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          )}
          Motion Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Motion Detection */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Enable Motion Detection
          </Label>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSetting("enabled", checked)}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Sensitivity */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Sensitivity
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings.sensitivity}%
                </span>
              </div>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={(value) =>
                  updateSetting("sensitivity", value[0])
                }
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Detection Zones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Detection Zones
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addDetectionZone}
                  className="h-8 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Zone
                </Button>
              </div>

              {settings.zones.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {settings.zones.map((zone, index) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span className="text-sm text-foreground">
                        {zone.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeZone(zone.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No detection zones defined. Add zones to monitor specific
                  areas.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
