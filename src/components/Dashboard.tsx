"use client";
import React, { useEffect, useRef, useState } from "react";

const TELEGRAM_BOT_TOKEN = "<YOUR_BOT_TOKEN>";
const TELEGRAM_CHAT_ID = "<YOUR_CHAT_ID>";
const TELEGRAM_PROXY_ENDPOINT = "/telegram-message"; // Your safe backend proxy endpoint for Telegram

function createMotionWorker() {
  const code = `
    let lastImageData = null;
    self.onmessage = function(e) {
      const { imageData, width, height, threshold } = e.data;
      if(!lastImageData) {
        lastImageData = imageData;
        self.postMessage(false);
        return;
      }
      let diffCount = 0;
      for(let i=0; i < imageData.length; i+=4) {
        const rDiff = Math.abs(imageData[i] - lastImageData[i]);
        const gDiff = Math.abs(imageData[i+1] - lastImageData[i+1]);
        const bDiff = Math.abs(imageData[i+2] - lastImageData[i+2]);
        if (rDiff > threshold || gDiff > threshold || bDiff > threshold) diffCount++;
      }
      lastImageData = imageData;
      // Decide motion detected if diffCount > fraction of pixels
      const motionDetected = diffCount > (width * height * 0.01);
      self.postMessage(motionDetected);
    }
  `;
  const blob = new Blob([code], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}

export default function MotionDetectionStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [motionDetected, setMotionDetected] = useState(false);
  const [worker] = useState(() => createMotionWorker());
  const lastNotificationTime = useRef(0);
  const detectionCooldown = 10000; // 10 seconds cooldown

  useEffect(() => {
    worker.onmessage = (e) => {
      if (e.data) {
        const now = Date.now();
        if (now - lastNotificationTime.current > detectionCooldown) {
          setMotionDetected(true);
          lastNotificationTime.current = now;
          sendTelegramMessage("Motion detected by ESP32-CAM React app");
          showBrowserNotification(
            "Motion Detected",
            "Motion detected in camera stream"
          );
          setTimeout(() => setMotionDetected(false), 5000);
        }
      }
    };
    return () => worker.terminate();
  }, [worker]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      canvas.width = video.width || 320;
      canvas.height = video.height || 240;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Send pixel data to worker
      worker.postMessage({
        imageData: frame.data,
        width: canvas.width,
        height: canvas.height,
        threshold: 50,
      });
    }, 500); // Analyze every 500ms

    return () => clearInterval(interval);
  }, [worker]);

  // Telegram message sender - call your proxy here to secure bot token (change URL accordingly)
  const sendTelegramMessage = async (text: string) => {
    try {
      await fetch(TELEGRAM_PROXY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error("Telegram message error", err);
    }
  };

  // Browser notification
  const showBrowserNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  return (
    <div>
      <h2>ESP32-CAM Motion Detection Stream</h2>
      <img
        ref={videoRef}
        src="http://192.168.1.59:80/stream"
        alt="ESP32 Stream"
        width="320"
        height="240"
        crossOrigin="anonymous"
        style={{ border: motionDetected ? "3px solid red" : "3px solid green" }}
      />
      {/* Hidden canvas for frame analysis */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {motionDetected && <p style={{ color: "red" }}>Motion Detected!</p>}
    </div>
  );
}
