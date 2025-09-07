// ...existing code...

/**
 * Send an alert to a specified service (Telegram, WhatsApp, etc.)
 * @param message The alert message
 * @param options { service: 'telegram' | 'whatsapp' | 'custom', apiUrl?: string, chatId?: string, token?: string }
 */
export async function sendAlert(
  message: string,
  options: {
    service: "telegram" | "whatsapp" | "custom";
    apiUrl?: string;
    chatId?: string;
    token?: string;
    [key: string]: any;
  }
) {
  if (options.service === "telegram" && options.token && options.chatId) {
    // Telegram Bot API
    const url = `https://api.telegram.org/bot${options.token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: options.chatId, text: message }),
    });
  } else if (options.service === "whatsapp" && options.apiUrl) {
    // WhatsApp API (example, depends on provider)
    await fetch(options.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } else if (options.service === "custom" && options.apiUrl) {
    // Custom API
    await fetch(options.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } else {
    console.warn("Alert service not configured correctly:", options);
  }
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
