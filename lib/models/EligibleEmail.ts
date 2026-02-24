import { getDb } from "../mongodb";
import type { ObjectId } from "mongodb";

export interface EligibleEmailDoc {
  _id?: ObjectId;
  email: string;
  createdAt: Date;
}

const COLLECTION = "eligible_emails";

export async function getEligibleEmailsCollection() {
  const db = await getDb();
  return db.collection<EligibleEmailDoc>(COLLECTION);
}

/** List all eligible emails (global list for all events). Dedupes by email. */
export async function listEligible(): Promise<EligibleEmailDoc[]> {
  const col = await getEligibleEmailsCollection();
  const all = await col.find({}).sort({ createdAt: -1 }).toArray();
  const seen = new Set<string>();
  return all.filter((doc) => {
    const key = doc.email.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function addEligibleEmail(email: string): Promise<EligibleEmailDoc> {
  const col = await getEligibleEmailsCollection();
  const normalized = email.toLowerCase().trim();
  const existing = await col.findOne({ email: normalized });
  if (existing) return existing;
  const doc: EligibleEmailDoc = { email: normalized, createdAt: new Date() };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function addEligibleEmailsBulk(
  emails: string[]
): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;
  for (const email of emails) {
    const normalized = email.toLowerCase().trim();
    if (!normalized) continue;
    const col = await getEligibleEmailsCollection();
    const existing = await col.findOne({ email: normalized });
    if (existing) {
      skipped++;
      continue;
    }
    const doc: EligibleEmailDoc = { email: normalized, createdAt: new Date() };
    await col.insertOne(doc);
    added++;
  }
  return { added, skipped };
}

export async function removeEligibleEmail(email: string): Promise<boolean> {
  const col = await getEligibleEmailsCollection();
  const result = await col.deleteMany({ email: email.toLowerCase().trim() });
  return result.deletedCount > 0;
}

/** Check if email is eligible (for any event - eligibility is global). */
export async function isEligible(_eventId: string, email: string): Promise<boolean> {
  const col = await getEligibleEmailsCollection();
  const doc = await col.findOne({ email: email.toLowerCase().trim() });
  return !!doc;
}
