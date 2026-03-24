import { 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  addDoc,
  collection
} from "firebase/firestore";
import { db } from "./firebase";

/** Sanitise a string for use as a Firestore field key (no dots). */
function toFieldKey(s: string): string {
  return s.replace(/\./g, "_").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "unknown";
}

export interface LinkClickEvent {
  linkId: string;
  uid: string;
  device: string;
  country?: string;
  referrer?: string;
}

/** Log a link click from the client side (for static export compatibility) */
export async function logClickClient(event: LinkClickEvent): Promise<void> {
  try {
    // 1. Write raw click event for detailed analytics
    await addDoc(collection(db, "clicks"), {
      ...event,
      createdAt: serverTimestamp(),
    });

    // 2. Atomic increments for daily/global stats
    const today = new Date().toISOString().slice(0, 10);
    const statsRef = doc(db, "links", event.linkId, "stats", today);
    const linkRef = doc(db, "links", event.linkId);

    const deviceField =
      event.device === "ios"     ? "iosClicks" :
      event.device === "android" ? "androidClicks" :
                                    "desktopClicks";

    const aggregates: Record<string, any> = {
      clicks:      increment(1),
      [deviceField]: increment(1),
      updatedAt: serverTimestamp(),
    };

    if (event.country) {
      aggregates[`countries.${toFieldKey(event.country)}`] = increment(1);
    }
    if (event.referrer) {
      aggregates[`referrers.${toFieldKey(event.referrer)}`] = increment(1);
    }

    // Update both concurrently
    await Promise.all([
      setDoc(statsRef, aggregates, { merge: true }),
      updateDoc(linkRef, { clicks: increment(1) })
    ]);
  } catch (err) {
    console.error("[logClickClient] Error:", err);
  }
}
