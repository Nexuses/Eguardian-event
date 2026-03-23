import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";
import { parseEventDateTime } from "@/lib/date-utils";
import { createEvent, listEvents } from "@/lib/models/Event";
import { saveBannerFile } from "@/lib/banner-upload";

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
    let registrationStartDate: string;
    let registrationEndDate: string;
    let venue: string;
    let speaker: string;
    let phone: string;
    let registrationStatus: "open" | "closed";
    let registrationType: "open_for_all" | "invitees_only";
    let collectApparelSize: boolean;
    let collectOvernightStay: boolean;
    let collectPassportNic: boolean;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      eventName = (formData.get("eventName") as string) || "";
      eventBanner = (formData.get("eventBanner") as string) || "";
      eventStartDate = (formData.get("eventStartDate") as string) || "";
      eventEndDate = (formData.get("eventEndDate") as string) || "";
      registrationStartDate = (formData.get("registrationStartDate") as string) || "";
      registrationEndDate = (formData.get("registrationEndDate") as string) || "";
      venue = (formData.get("venue") as string) || "";
      speaker = (formData.get("speaker") as string) || "";
      phone = (formData.get("phone") as string) || "";
      registrationStatus =
        (formData.get("registrationStatus") as "open" | "closed") || "open";
      registrationType =
        (formData.get("registrationType") as "open_for_all" | "invitees_only") || "invitees_only";
      collectApparelSize = formData.get("collectApparelSize") === "true" || formData.get("collectApparelSize") === "1";
      collectOvernightStay = formData.get("collectOvernightStay") === "true" || formData.get("collectOvernightStay") === "1";
      collectPassportNic = formData.get("collectPassportNic") === "true" || formData.get("collectPassportNic") === "1";

      const file = formData.get("bannerFile") as File | null;
      if (file && file.size > 0) {
        eventBanner = await saveBannerFile(file);
      }
    } else {
      const body = await request.json();
      eventName = body.eventName ?? "";
      eventBanner = body.eventBanner ?? "";
      eventStartDate = body.eventStartDate ?? "";
      eventEndDate = body.eventEndDate ?? "";
      registrationStartDate = body.registrationStartDate ?? "";
      registrationEndDate = body.registrationEndDate ?? "";
      venue = body.venue ?? "";
      speaker = body.speaker ?? "";
      phone = body.phone ?? "";
      registrationStatus = body.registrationStatus ?? "open";
      registrationType = body.registrationType ?? "invitees_only";
      collectApparelSize = !!body.collectApparelSize;
      collectOvernightStay = !!body.collectOvernightStay;
      collectPassportNic = !!body.collectPassportNic;
    }

    if (!eventName.trim()) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }
    if (registrationStartDate && registrationEndDate) {
      const start = parseEventDateTime(registrationStartDate);
      const end = parseEventDateTime(registrationEndDate);
      if (start > end) {
        return NextResponse.json(
          { error: "Start Registration Date must be before End Registration Date" },
          { status: 400 }
        );
      }
    }

    const event = await createEvent({
      eventName,
      eventBanner,
      eventStartDate: parseEventDateTime(eventStartDate),
      eventEndDate: parseEventDateTime(eventEndDate),
      registrationStartDate: registrationStartDate ? parseEventDateTime(registrationStartDate) : undefined,
      registrationEndDate: registrationEndDate ? parseEventDateTime(registrationEndDate) : undefined,
      venue,
      speaker,
      phone,
      registrationStatus: registrationStatus === "closed" ? "closed" : "open",
      registrationType: registrationType === "open_for_all" ? "open_for_all" : "invitees_only",
      collectApparelSize: !!collectApparelSize,
      collectOvernightStay: !!collectOvernightStay,
      collectPassportNic: !!collectPassportNic,
    });

    return NextResponse.json(event);
  } catch (err) {
    console.error("Create event error:", err);
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = /Only image files|too large/i.test(message) ? 400 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
