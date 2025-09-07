import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  User,
  PawPrint,
  Activity,
  Trash2,
  Clock,
} from "lucide-react";

interface Alert {
  id: string;
  type: "motion" | "face" | "animal";
  timestamp: Date;
  thumbnail?: string;
  confidence?: number;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onClearAlerts: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onClearAlerts,
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "motion":
        return <Activity className="w-4 h-4" />;
      case "face":
        return <User className="w-4 h-4" />;
      case "animal":
        return <PawPrint className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "motion":
        return "bg-surveillance-amber text-black";
      case "face":
        return "bg-surveillance-blue text-white";
      case "animal":
        return "bg-surveillance-green text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <Card className="gradient-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-surveillance-amber" />
            Security Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          {alerts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAlerts}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No alerts recorded</p>
            <p className="text-sm text-muted-foreground mt-1">
              Motion and AI detection alerts will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div
                  className={`p-2 rounded-full ${getAlertColor(alert.type)}`}
                >
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground capitalize">
                      {alert.type} Detected
                    </span>
                    {alert.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(alert.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(alert.timestamp)}
                  </div>
                </div>

                {alert.thumbnail && (
                  <div className="w-12 h-12 bg-black rounded overflow-hidden">
                    <img
                      src={alert.thumbnail}
                      alt="Alert thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
