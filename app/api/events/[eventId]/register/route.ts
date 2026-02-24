import { NextResponse } from "next/server";
import { getEventByEventId } from "@/lib/models/Event";
import { isEligible } from "@/lib/models/EligibleEmail";
import { createRegistration, findRegistrationByEventAndEmail } from "@/lib/models/Registration";
import { sendPassEmail } from "@/lib/email";
import { generatePassPng } from "@/lib/pass-png";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const event = await getEventByEventId(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

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
      agreedToPrivacy,
    } = body;

    if (!firstName?.trim() || !surname?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "First name, surname and email are required" }, { status: 400 });
    }
    if (!agreedToPrivacy) {
      return NextResponse.json({ error: "You must agree to the Privacy Policy" }, { status: 400 });
    }

    const eligible = await isEligible(eventId, email);
    if (!eligible) {
      return NextResponse.json({ error: "This email is not eligible to register for this event" }, { status: 403 });
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
      agreedToPrivacy: true,
    });

    const baseUrl =
      process.env.SITE_URL ||
      (typeof request.url === "string" ? new URL(request.url).origin : null) ||
      "http://localhost:3000";
    const passUrl = `${baseUrl}/events/${eventId}/pass/${reg.uniqueCode}`;

    (async () => {
      let passPngBuffer: Buffer | undefined;
      try {
        passPngBuffer = await generatePassPng({
          firstName: reg.firstName,
          surname: reg.surname,
          email: reg.email,
          mobileNumber: reg.mobileNumber,
          eventName: reg.eventName,
          eventStartDate: reg.eventStartDate,
          eventEndDate: reg.eventEndDate,
          venue: reg.venue,
          uniqueCode: reg.uniqueCode,
          createdAt: reg.createdAt,
        });
      } catch (err) {
        console.error("Pass PNG generation failed:", err);
      }
      await sendPassEmail({
        to: reg.email,
        firstName: reg.firstName,
        surname: reg.surname,
        eventName: reg.eventName,
        passUrl,
        uniqueCode: reg.uniqueCode,
        passPngBuffer,
      });
    })().catch((err) => console.error("Pass email failed:", err));

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
