import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram configuration missing");
      return NextResponse.json(
        { error: "Telegram configuration missing" },
        { status: 500 }
      );
    }

    // Check if request contains FormData (for images/videos) or JSON (for text only)
    const contentType = request.headers.get("content-type");
    let text: string | null = null;
    let image: File | null = null;
    let video: File | null = null;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      text = formData.get("text") as string;
      image = formData.get("image") as File;
      video = formData.get("video") as File;
    } else {
      const body = await request.json();
      text = body.text;
      image = body.image;
      video = body.video;
    }

    if (!text && !image && !video) {
      return NextResponse.json(
        { error: "Message text, image, or video is required" },
        { status: 400 }
      );
    }

    let response;

    // Send image with caption
    if (image) {
      const telegramFormData = new FormData();
      telegramFormData.append("chat_id", TELEGRAM_CHAT_ID);
      telegramFormData.append("photo", image);
      if (text) {
        telegramFormData.append("caption", text);
      }
      telegramFormData.append("parse_mode", "HTML");

      response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          body: telegramFormData,
        }
      );
    }
    // Send video with caption
    else if (video) {
      const telegramFormData = new FormData();
      telegramFormData.append("chat_id", TELEGRAM_CHAT_ID);
      telegramFormData.append("video", video);
      if (text) {
        telegramFormData.append("caption", text);
      }
      telegramFormData.append("parse_mode", "HTML");

      response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`,
        {
          method: "POST",
          body: telegramFormData,
        }
      );
    }
    // Send text message only
    else {
      response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: "HTML",
          }),
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Telegram API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send Telegram message" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Telegram message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
