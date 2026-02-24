import { getDb } from "../mongodb";
import { ObjectId } from "mongodb";

export type RegistrationStatus = "open" | "closed";

export interface EventDoc {
  _id?: ObjectId;
  eventId: string;
  eventName: string;
  eventBanner: string; // URL or path like /events/xxx.jpg
  eventStartDate: Date;
  eventEndDate: Date;
  venue: string;
  speaker: string;
  phone: string;
  registrationStatus: RegistrationStatus;
  createdAt: Date;
}

const COLLECTION = "events";

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
    venue: data.venue.trim(),
    speaker: data.speaker.trim(),
    phone: data.phone.trim(),
    registrationStatus: data.registrationStatus,
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
  if (data.venue !== undefined) update.venue = data.venue.trim();
  if (data.speaker !== undefined) update.speaker = data.speaker.trim();
  if (data.phone !== undefined) update.phone = data.phone.trim();
  if (data.registrationStatus !== undefined) update.registrationStatus = data.registrationStatus;
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );
  return result ?? null;
}
