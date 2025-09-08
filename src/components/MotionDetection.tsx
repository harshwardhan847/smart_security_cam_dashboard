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
    recordOnMotion?: boolean;
    sendToTelegram?: boolean;
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
    <Card className="gradient-card border-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          {settings.enabled ? (
            <Eye className="w-5 h-5 text-green-500" />
          ) : (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-lg">Motion Detection</span>
          <div className="ml-auto flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                settings.enabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {settings.enabled ? "Active" : "Inactive"}
            </span>
          </div>
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
            <div className="space-y-3 p-4 rounded-lg bg-muted/30">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">
                  Detection Sensitivity
                </Label>
                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
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
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Low
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  High
                </span>
              </div>
            </div>

            {/* Record on Motion */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label className="text-sm font-medium text-foreground block">
                  Auto Recording
                </Label>
                <span className="text-xs text-muted-foreground">
                  Start recording when motion detected
                </span>
              </div>
              <Switch
                checked={settings.recordOnMotion || false}
                onCheckedChange={(checked) =>
                  updateSetting("recordOnMotion", checked)
                }
              />
            </div>

            {/* Send to Telegram */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label className="text-sm font-medium text-foreground block">
                  Telegram Notifications
                </Label>
                <span className="text-xs text-muted-foreground">
                  Send images/videos to Telegram
                </span>
              </div>
              <Switch
                checked={settings.sendToTelegram || false}
                onCheckedChange={(checked) =>
                  updateSetting("sendToTelegram", checked)
                }
              />
            </div>

            {/* Detection Zones */}
            <div className="space-y-3 hidden">
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
