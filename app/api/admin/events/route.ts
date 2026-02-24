import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { createEvent, listEvents } from "@/lib/models/Event";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const events = await listEvents();
    return NextResponse.json(events);
  } catch (err) {
    console.error("List events error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let eventName: string;
    let eventBanner: string;
    let eventStartDate: string;
    let eventEndDate: string;
    let venue: string;
    let speaker: string;
    let phone: string;
    let registrationStatus: "open" | "closed";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      eventName = (formData.get("eventName") as string) || "";
      eventBanner = (formData.get("eventBanner") as string) || "";
      eventStartDate = (formData.get("eventStartDate") as string) || "";
      eventEndDate = (formData.get("eventEndDate") as string) || "";
      venue = (formData.get("venue") as string) || "";
      speaker = (formData.get("speaker") as string) || "";
      phone = (formData.get("phone") as string) || "";
      registrationStatus =
        (formData.get("registrationStatus") as "open" | "closed") || "open";

      const file = formData.get("bannerFile") as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || ".jpg";
        const filename = `banner-${Date.now()}${ext}`;
        const publicDir = path.join(process.cwd(), "public", "events");
        await mkdir(publicDir, { recursive: true });
        const filepath = path.join(publicDir, filename);
        await writeFile(filepath, buffer);
        eventBanner = `/events/${filename}`;
      }
    } else {
      const body = await request.json();
      eventName = body.eventName ?? "";
      eventBanner = body.eventBanner ?? "";
      eventStartDate = body.eventStartDate ?? "";
      eventEndDate = body.eventEndDate ?? "";
      venue = body.venue ?? "";
      speaker = body.speaker ?? "";
      phone = body.phone ?? "";
      registrationStatus = body.registrationStatus ?? "open";
    }

    if (!eventName.trim()) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    const event = await createEvent({
      eventName,
      eventBanner,
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      venue,
      speaker,
      phone,
      registrationStatus: registrationStatus === "closed" ? "closed" : "open",
    });

    return NextResponse.json(event);
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
