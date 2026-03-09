import { NextResponse } from "next/server";
import { getEventByEventId } from "@/lib/models/Event";
import { isEligible } from "@/lib/models/EligibleEmail";
import { createRegistration, findRegistrationByEventAndEmail } from "@/lib/models/Registration";
import { sendPassEmail } from "@/lib/email";
import { generateIcs } from "@/lib/ics";
import { generatePassPdf } from "@/lib/pass-pdf-direct";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const event = await getEventByEventId(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (event.registrationStatus === "closed") {
      return NextResponse.json({ error: "Registration is closed for this event" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      surname,
      email,
      organization,
      designation,
      mobileNumber,
      addToWhatsapp,
      whatsappNumber,
      identityCardOrPassport,
      specialComment,
      apparelSize,
      overnightStay,
      passportNic,
      agreedToPrivacy,
    } = body;

    if (!firstName?.trim() || !surname?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "First name, surname and email are required" }, { status: 400 });
    }
    if (!agreedToPrivacy) {
      return NextResponse.json({ error: "You must agree to the Privacy Policy" }, { status: 400 });
    }

    const requireEligible = event.registrationType !== "open_for_all";
    if (requireEligible) {
      const eligible = await isEligible(eventId, email);
      if (!eligible) {
        return NextResponse.json({ error: "This email is not eligible to register for this event" }, { status: 403 });
      }
    }

    const existing = await findRegistrationByEventAndEmail(eventId, email);
    if (existing) {
      return NextResponse.json({ error: "Already registered" }, { status: 409 });
    }

    const reg = await createRegistration({
      eventId,
      eventName: event.eventName,
      eventStartDate: event.eventStartDate,
      eventEndDate: event.eventEndDate,
      venue: event.venue,
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.trim().toLowerCase(),
      organization: (organization || "").trim(),
      designation: (designation || "").trim(),
      mobileNumber: (mobileNumber || "").trim(),
      addToWhatsapp: !!addToWhatsapp,
      whatsappNumber: whatsappNumber?.trim() || undefined,
      identityCardOrPassport: identityCardOrPassport?.trim() || undefined,
      specialComment: specialComment?.trim() || undefined,
      apparelSize: apparelSize?.trim() || undefined,
      overnightStay: event.collectOvernightStay ? !!overnightStay : undefined,
      passportNic: passportNic?.trim() || undefined,
      agreedToPrivacy: true,
    });

    const baseUrl =
      process.env.SITE_URL ||
      (typeof request.url === "string" ? new URL(request.url).origin : null) ||
      "http://localhost:3000";
    const passUrl = `${baseUrl}/events/${eventId}/pass/${reg.uniqueCode}`;

    let passPdfBuffer: Buffer | undefined;
    let passIcsBuffer: Buffer | undefined;
    try {
      passPdfBuffer = await generatePassPdf({
        firstName: reg.firstName,
        surname: reg.surname,
        organization: reg.organization,
        designation: reg.designation,
        uniqueCode: reg.uniqueCode,
      });
    } catch (err) {
      console.error("Pass generation failed:", err);
    }
    try {
      const icsContent = generateIcs(
        {
          eventName: reg.eventName,
          eventStartDate: reg.eventStartDate,
          eventEndDate: reg.eventEndDate,
          venue: reg.venue,
          uniqueCode: reg.uniqueCode,
          passUrl,
          attendeeName: `${reg.firstName} ${reg.surname}`,
          attendeeEmail: reg.email,
        },
        eventId
      );
      passIcsBuffer = Buffer.from(icsContent, "utf-8");
    } catch (err) {
      console.error("ICS generation failed:", err);
    }
    try {
      await sendPassEmail({
        to: reg.email,
        firstName: reg.firstName,
        surname: reg.surname,
        eventName: reg.eventName,
        passUrl,
        uniqueCode: reg.uniqueCode,
        passPdfBuffer,
        passIcsBuffer,
      });
    } catch (err) {
      console.error("Pass email failed:", err);
    }

    return NextResponse.json({
      success: true,
      uniqueCode: reg.uniqueCode,
      registrationId: reg._id?.toString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
