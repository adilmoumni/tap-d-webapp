import { NextResponse } from "next/server";
import {
  doc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ------------------------------------------------------------------
   POST /api/click — lightweight click tracker for bio page links.

   Body: { username: string, linkId: string }

   Increments the click counter on the bio link document and
   writes a daily aggregate stat. Fire-and-forget from the client.
------------------------------------------------------------------ */

export async function POST(request: Request) {
  try {
    const { username, linkId } = await request.json();

    if (!username || !linkId) {
      return NextResponse.json({ error: "Missing username or linkId" }, { status: 400 });
    }

    // Increment click count on the link doc
    const linkRef = doc(db, "biopages", username, "links", linkId);
    await updateDoc(linkRef, { clicks: increment(1) });

    // Write daily aggregate
    const today = new Date().toISOString().slice(0, 10);
    const statsRef = doc(db, "biopages", username, "stats", today);
    await setDoc(
      statsRef,
      {
        clicks: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/click] Error:", error);
    return NextResponse.json({ error: "Failed to log click" }, { status: 500 });
  }
}
