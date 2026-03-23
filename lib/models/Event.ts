import { getDb } from "../mongodb";
import { ObjectId } from "mongodb";
import { DEFAULT_EVENT_BANNER_URL } from "../constants";

export type RegistrationStatus = "open" | "closed";

/** Who can register: open_for_all = anyone; invitees_only = only eligible client list */
export type RegistrationType = "open_for_all" | "invitees_only";

export interface EventDoc {
  _id?: ObjectId;
  eventId: string;
  eventName: string;
  eventBanner: string; // URL or path like /events/xxx.jpg
  eventStartDate: Date;
  eventEndDate: Date;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  venue: string;
  speaker: string;
  phone: string;
  registrationStatus: RegistrationStatus;
  /** Who can register: open_for_all = anyone, invitees_only = only eligible list */
  registrationType?: RegistrationType;
  /** If true, registration form shows Apparel - sizes field */
  collectApparelSize?: boolean;
  /** If true, registration form shows Overnight Stay field */
  collectOvernightStay?: boolean;
  /** If true, registration form shows Passport/NIC field */
  collectPassportNic?: boolean;
  createdAt: Date;
}

const COLLECTION = "events";

/** Re-export for convenience */
export { DEFAULT_EVENT_BANNER_URL };

export function getEventBannerUrl(doc: { eventBanner?: string | null }): string {
  const url = doc.eventBanner?.trim();
  return url || DEFAULT_EVENT_BANNER_URL;
}

function asValidDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getEffectiveRegistrationStatus(
  event: Pick<EventDoc, "registrationStatus" | "registrationStartDate" | "registrationEndDate">,
  now: Date = new Date()
): RegistrationStatus {
  const start = asValidDate(event.registrationStartDate);
  const end = asValidDate(event.registrationEndDate);

  if (start && end) {
    return now >= start && now <= end ? "open" : "closed";
  }
  if (start) {
    return now >= start ? "open" : "closed";
  }
  if (end) {
    return now <= end ? "open" : "closed";
  }

  return event.registrationStatus === "closed" ? "closed" : "open";
}

export async function getEventsCollection() {
  const db = await getDb();
  return db.collection<EventDoc>(COLLECTION);
}

export async function createEvent(data: Omit<EventDoc, "_id" | "eventId" | "createdAt">): Promise<EventDoc> {
  const col = await getEventsCollection();
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const doc: EventDoc = {
    eventId,
    eventName: data.eventName.trim(),
    eventBanner: data.eventBanner.trim() || "",
    eventStartDate: new Date(data.eventStartDate),
    eventEndDate: new Date(data.eventEndDate),
    registrationStartDate: data.registrationStartDate ? new Date(data.registrationStartDate) : undefined,
    registrationEndDate: data.registrationEndDate ? new Date(data.registrationEndDate) : undefined,
    venue: data.venue.trim(),
    speaker: data.speaker.trim(),
    phone: data.phone.trim(),
    registrationStatus: data.registrationStatus,
    registrationType: data.registrationType ?? "invitees_only",
    collectApparelSize: data.collectApparelSize ?? false,
    collectOvernightStay: data.collectOvernightStay ?? false,
    collectPassportNic: data.collectPassportNic ?? false,
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function listEvents(): Promise<EventDoc[]> {
  const col = await getEventsCollection();
  const cursor = col.find({}).sort({ createdAt: -1 });
  return cursor.toArray();
}

export async function getEventById(id: string): Promise<EventDoc | null> {
  const col = await getEventsCollection();
  if (!ObjectId.isValid(id)) return null;
  return col.findOne({ _id: new ObjectId(id) });
}

export async function getEventByEventId(eventId: string): Promise<EventDoc | null> {
  const col = await getEventsCollection();
  return col.findOne({ eventId });
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<EventDoc, "_id" | "eventId" | "createdAt">>
): Promise<EventDoc | null> {
  const col = await getEventsCollection();
  if (!ObjectId.isValid(id)) return null;
  const update: Record<string, unknown> = {};
  if (data.eventName !== undefined) update.eventName = data.eventName.trim();
  if (data.eventBanner !== undefined) update.eventBanner = data.eventBanner.trim();
  if (data.eventStartDate !== undefined) update.eventStartDate = new Date(data.eventStartDate);
  if (data.eventEndDate !== undefined) update.eventEndDate = new Date(data.eventEndDate);
  if (data.registrationStartDate !== undefined) {
    update.registrationStartDate = data.registrationStartDate ? new Date(data.registrationStartDate) : null;
  }
  if (data.registrationEndDate !== undefined) {
    update.registrationEndDate = data.registrationEndDate ? new Date(data.registrationEndDate) : null;
  }
  if (data.venue !== undefined) update.venue = data.venue.trim();
  if (data.speaker !== undefined) update.speaker = data.speaker.trim();
  if (data.phone !== undefined) update.phone = data.phone.trim();
  if (data.registrationStatus !== undefined) update.registrationStatus = data.registrationStatus;
  if (data.registrationType !== undefined) update.registrationType = data.registrationType;
  if (data.collectApparelSize !== undefined) update.collectApparelSize = data.collectApparelSize;
  if (data.collectOvernightStay !== undefined) update.collectOvernightStay = data.collectOvernightStay;
  if (data.collectPassportNic !== undefined) update.collectPassportNic = data.collectPassportNic;
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );
  return result ?? null;
}
