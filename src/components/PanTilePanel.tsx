"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  RefreshCwIcon,
} from "lucide-react";

const API_BASE_URL = "http://192.168.1.59:81"; // replace with your ESP32 IP

export default function ServoControlCard() {
  const [panAngle, setPanAngle] = useState(90);
  const [tiltAngle, setTiltAngle] = useState(90);
  const [loading, setLoading] = useState(false);
  const panIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tiltIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const PAN_STEP = 10;
  const TILT_STEP = 10;

  async function sendServoCommand(pan: number | null, tilt: number | null) {
    setLoading(true);
    try {
      if (pan !== null) {
        await fetch(`${API_BASE_URL}/pan?value=${pan}`, {
          method: "GET",
        });
      }
      if (tilt !== null) {
        await fetch(`${API_BASE_URL}/tilt?value=${pan}`, {
          method: "GET",
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const startContinuousChange = (
    ref: React.MutableRefObject<NodeJS.Timeout | null>,
    changeFn: () => void
  ) => {
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      changeFn();
    }, 150);
  };

  const stopContinuousChange = (
    ref: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  const canPanLeft = panAngle > 0;
  const canPanRight = panAngle < 180;
  const canTiltUp = tiltAngle < 180;
  const canTiltDown = tiltAngle > 0;

  const panLeft = () => {
    if (!canPanLeft) return;
    const newPan = Math.max(0, panAngle - PAN_STEP);
    setPanAngle(newPan);
    sendServoCommand(newPan, null);
  };
  const panRight = () => {
    if (!canPanRight) return;
    const newPan = Math.min(180, panAngle + PAN_STEP);
    setPanAngle(newPan);
    sendServoCommand(newPan, null);
  };
  const tiltUp = () => {
    if (!canTiltUp) return;
    const newTilt = Math.min(180, tiltAngle + TILT_STEP);
    setTiltAngle(newTilt);
    sendServoCommand(null, newTilt);
  };
  const tiltDown = () => {
    if (!canTiltDown) return;
    const newTilt = Math.max(0, tiltAngle - TILT_STEP);
    setTiltAngle(newTilt);
    sendServoCommand(null, newTilt);
  };

  const reset = () => {
    setPanAngle(90);
    setTiltAngle(90);
    sendServoCommand(90, 90);
  };

  return (
    <Card className="gradient-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Servo Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <Button
            aria-label="Tilt Up"
            variant="secondary"
            size="icon"
            disabled={!canTiltUp || loading}
            onClick={tiltUp}
            onMouseDown={() => startContinuousChange(tiltIntervalRef, tiltUp)}
            onMouseUp={() => stopContinuousChange(tiltIntervalRef)}
            onMouseLeave={() => stopContinuousChange(tiltIntervalRef)}
            onTouchStart={() => startContinuousChange(tiltIntervalRef, tiltUp)}
            onTouchEnd={() => stopContinuousChange(tiltIntervalRef)}
            className="transform hover:scale-110 active:scale-95 transition"
          >
            <ChevronUpIcon className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex justify-between mb-6">
          <Button
            aria-label="Pan Left"
            variant="secondary"
            size="icon"
            disabled={!canPanLeft || loading}
            onClick={panLeft}
            onMouseDown={() => startContinuousChange(panIntervalRef, panLeft)}
            onMouseUp={() => stopContinuousChange(panIntervalRef)}
            onMouseLeave={() => stopContinuousChange(panIntervalRef)}
            onTouchStart={() => startContinuousChange(panIntervalRef, panLeft)}
            onTouchEnd={() => stopContinuousChange(panIntervalRef)}
            className="transform hover:scale-110 active:scale-95 transition"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <Button
            aria-label="Pan Right"
            variant="secondary"
            size="icon"
            disabled={!canPanRight || loading}
            onClick={panRight}
            onMouseDown={() => startContinuousChange(panIntervalRef, panRight)}
            onMouseUp={() => stopContinuousChange(panIntervalRef)}
            onMouseLeave={() => stopContinuousChange(panIntervalRef)}
            onTouchStart={() => startContinuousChange(panIntervalRef, panRight)}
            onTouchEnd={() => stopContinuousChange(panIntervalRef)}
            className="transform hover:scale-110 active:scale-95 transition"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex justify-center mb-6">
          <Button
            aria-label="Tilt Down"
            variant="secondary"
            size="icon"
            disabled={!canTiltDown || loading}
            onClick={tiltDown}
            onMouseDown={() => startContinuousChange(tiltIntervalRef, tiltDown)}
            onMouseUp={() => stopContinuousChange(tiltIntervalRef)}
            onMouseLeave={() => stopContinuousChange(tiltIntervalRef)}
            onTouchStart={() =>
              startContinuousChange(tiltIntervalRef, tiltDown)
            }
            onTouchEnd={() => stopContinuousChange(tiltIntervalRef)}
            className="transform hover:scale-110 active:scale-95 transition"
          >
            <ChevronDownIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Sliders for visualization and fine control */}
        <div className="mb-4">
          <label
            htmlFor="pan-slider"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Pan Angle: {panAngle}°
          </label>
          <Slider
            id="pan-slider"
            min={0}
            max={180}
            step={1}
            value={[panAngle]}
            onValueChange={(value: number[]) => {
              setPanAngle(value[0]);
              sendServoCommand(value[0], null);
            }}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="tilt-slider"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tilt Angle: {tiltAngle}°
          </label>
          <Slider
            id="tilt-slider"
            min={0}
            max={180}
            step={1}
            value={[tiltAngle]}
            onValueChange={(value: number[]) => {
              setTiltAngle(value[0]);
              sendServoCommand(null, value[0]);
            }}
            disabled={loading}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          onClick={reset}
          disabled={loading}
          variant="secondary"
          className="flex items-center gap-1"
        >
          <RefreshCwIcon className="w-5 h-5" />
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
