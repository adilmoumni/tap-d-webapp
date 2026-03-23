import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  increment, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DevicePlatform } from "@/lib/device";

export interface LinkDocument {
  slug: string;
  uid: string;
  title: string;
  icon: string;
  isSmart: boolean;
  iosUrl?: string;
  androidUrl?: string;
  fallbackUrl: string;
  isActive: boolean;
  clicks: number;
  biopageUsername?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DayStats {
  date: string;
  clicks: number;
  iosClicks: number;
  androidClicks: number;
  desktopClicks: number;
  countries: Record<string, number>;
  referrers: Record<string, number>;
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const docRef = doc(db, "links", slug);
  const snap = await getDoc(docRef);
  return !snap.exists();
}

export async function createLink(data: {
  slug: string;
  uid: string;
  title: string;
  icon: string;
  isSmart: boolean;
  iosUrl?: string;
  androidUrl?: string;
  fallbackUrl: string;
  biopageUsername?: string;
}): Promise<void> {
  const isAvailable = await checkSlugAvailable(data.slug);
  if (!isAvailable) {
    throw new Error("Slug is already taken");
  }

  const linkData: LinkDocument = {
    ...data,
    isActive: true,
    clicks: 0,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const promises = [];
  
  // Write to top-level links collection
  promises.push(setDoc(doc(db, "links", data.slug), linkData));

  // If biopageUsername provided, also write to the user's bio page nested links collection
  if (data.biopageUsername) {
    promises.push(setDoc(doc(db, "biopages", data.biopageUsername, "links", data.slug), linkData));
  }

  await Promise.all(promises);
}

export async function getLink(slug: string): Promise<LinkDocument | null> {
  const docRef = doc(db, "links", slug);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as LinkDocument;
}

export async function getLinksByOwner(uid: string): Promise<LinkDocument[]> {
  const linksRef = collection(db, "links");
  const q = query(
    linksRef, 
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => docSnap.data() as LinkDocument);
}

export async function updateLink(slug: string, data: Partial<LinkDocument>): Promise<void> {
  const existingLink = await getLink(slug);
  if (!existingLink) {
    throw new Error("Link not found");
  }

  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  const promises = [];
  
  // Update top-level link
  promises.push(updateDoc(doc(db, "links", slug), updateData));

  // Determine if it was on a bio page, and if we should update it there too
  const targetBioUsername = data.biopageUsername !== undefined ? data.biopageUsername : existingLink.biopageUsername;
  
  if (targetBioUsername) {
    promises.push(updateDoc(doc(db, "biopages", targetBioUsername, "links", slug), updateData));
  }

  await Promise.all(promises);
}

export async function deleteLink(slug: string): Promise<void> {
  const existingLink = await getLink(slug);
  if (!existingLink) return;

  const promises = [];
  
  // Delete top-level link document
  promises.push(deleteDoc(doc(db, "links", slug)));

  // If it was attached to a bio page, delete it from there too
  if (existingLink.biopageUsername) {
    promises.push(deleteDoc(doc(db, "biopages", existingLink.biopageUsername, "links", slug)));
  }

  // Delete all stats documents in the subcollection
  const statsRef = collection(db, "links", slug, "stats");
  const statsSnap = await getDocs(statsRef);
  for (const statDoc of statsSnap.docs) {
    promises.push(deleteDoc(statDoc.ref));
  }

  await Promise.all(promises);
}

export async function toggleLinkActive(slug: string): Promise<void> {
  const link = await getLink(slug);
  if (!link) throw new Error("Link not found");

  await updateLink(slug, { isActive: !link.isActive });
}

export async function trackClick(slug: string, platform: DevicePlatform, country: string, referrer: string): Promise<void> {
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const statsRef = doc(db, "links", slug, "stats", dateStr);
  const linkRef = doc(db, "links", slug);
  
  const promises = [];
  
  // Increment global clicks
  promises.push(updateDoc(linkRef, { clicks: increment(1) }));
  
  // Set day stats with merge
  const platformKey = `${platform}Clicks`;
  promises.push(setDoc(statsRef, {
    clicks: increment(1),
    iosClicks: platform === "ios" ? increment(1) : increment(0),
    androidClicks: platform === "android" ? increment(1) : increment(0),
    desktopClicks: platform === "desktop" ? increment(1) : increment(0),
    [`countries.${country}`]: increment(1),
    [`referrers.${referrer}`]: increment(1),
  }, { merge: true }));

  await Promise.all(promises);
}

export async function getLinksStats(slug: string, days: number): Promise<DayStats[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  const statsRef = collection(db, "links", slug, "stats");
  
  // Query all stats >= cutoffDate
  const q = query(
    statsRef,
    where("__name__", ">=", cutoffStr)
  );

  const snap = await getDocs(q);
  
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      date: docSnap.id,
      clicks: data.clicks || 0,
      iosClicks: data.iosClicks || 0,
      androidClicks: data.androidClicks || 0,
      desktopClicks: data.desktopClicks || 0,
      countries: data.countries || {},
      referrers: data.referrers || {}
    };
  });
}
