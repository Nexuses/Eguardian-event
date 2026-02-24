import { NextResponse } from "next/server";
import { listEvents } from "@/lib/models/Event";

export async function GET() {
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
