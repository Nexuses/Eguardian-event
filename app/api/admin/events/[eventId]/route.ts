import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { getEventById, updateEvent } from "@/lib/models/Event";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { eventId } = await params;
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (err) {
    console.error("Get event error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await params;
    const contentType = request.headers.get("content-type") || "";
    let eventName: string | undefined;
    let eventBanner: string | undefined;
    let eventStartDate: string | undefined;
    let eventEndDate: string | undefined;
    let venue: string | undefined;
    let speaker: string | undefined;
    let phone: string | undefined;
    let registrationStatus: "open" | "closed" | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      eventName = formData.get("eventName") as string | null ?? undefined;
      eventBanner = formData.get("eventBanner") as string | null ?? undefined;
      eventStartDate = formData.get("eventStartDate") as string | null ?? undefined;
      eventEndDate = formData.get("eventEndDate") as string | null ?? undefined;
      venue = formData.get("venue") as string | null ?? undefined;
      speaker = formData.get("speaker") as string | null ?? undefined;
      phone = formData.get("phone") as string | null ?? undefined;
      registrationStatus = (formData.get("registrationStatus") as "open" | "closed") || undefined;
      const file = formData.get("bannerFile") as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || ".jpg";
        const filename = `banner-${Date.now()}${ext}`;
        const publicDir = path.join(process.cwd(), "public", "events");
        await mkdir(publicDir, { recursive: true });
        await writeFile(path.join(publicDir, filename), buffer);
        eventBanner = `/events/${filename}`;
      }
    } else {
      const body = await request.json();
      eventName = body.eventName;
      eventBanner = body.eventBanner;
      eventStartDate = body.eventStartDate;
      eventEndDate = body.eventEndDate;
      venue = body.venue;
      speaker = body.speaker;
      phone = body.phone;
      registrationStatus = body.registrationStatus;
    }

    const updated = await updateEvent(eventId, {
      ...(eventName !== undefined && { eventName }),
      ...(eventBanner !== undefined && { eventBanner }),
      ...(eventStartDate !== undefined && { eventStartDate: new Date(eventStartDate) }),
      ...(eventEndDate !== undefined && { eventEndDate: new Date(eventEndDate) }),
      ...(venue !== undefined && { venue }),
      ...(speaker !== undefined && { speaker }),
      ...(phone !== undefined && { phone }),
      ...(registrationStatus !== undefined && { registrationStatus }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update event error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
