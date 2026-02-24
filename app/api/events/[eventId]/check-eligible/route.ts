import { NextResponse } from "next/server";
import { isEligible } from "@/lib/models/EligibleEmail";
import { findRegistrationByEventAndEmail } from "@/lib/models/Registration";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ eligible: false, error: "Email required" }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    const alreadyRegistered = await findRegistrationByEventAndEmail(eventId, normalized);
    if (alreadyRegistered) {
      return NextResponse.json({ eligible: true, alreadyRegistered: true });
    }
    const eligible = await isEligible(eventId, email);
    return NextResponse.json({ eligible });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
