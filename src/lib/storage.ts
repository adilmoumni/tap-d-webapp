/* ------------------------------------------------------------------
   Firebase Storage helpers — image upload, resize, delete.
   Client-side only (uses Canvas API for resize).
------------------------------------------------------------------ */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ================================================================
   Client-side image resize
   ================================================================ */

export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down to fit within max bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob returned null"));
            return;
          }
          resolve(blob);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/* ================================================================
   Validation
   ================================================================ */

function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 5 MB.");
  }
}

/* ================================================================
   Upload functions
   ================================================================ */

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  validateImageFile(file);

  const blob = await resizeImage(file, 400, 400, 0.8);

  const storageRef = ref(storage, `avatars/${uid}/avatar.webp`);
  await uploadBytes(storageRef, blob, {
    contentType: "image/webp",
    customMetadata: { cacheControl: "public, max-age=31536000" },
  });

  return getDownloadURL(storageRef);
}

export async function uploadWallpaper(uid: string, file: File): Promise<string> {
  validateImageFile(file);

  const blob = await resizeImage(file, 1200, 1200, 0.8);

  const storageRef = ref(storage, `wallpapers/${uid}/wallpaper.webp`);
  await uploadBytes(storageRef, blob, {
    contentType: "image/webp",
    customMetadata: { cacheControl: "public, max-age=31536000" },
  });

  return getDownloadURL(storageRef);
}

export async function uploadThumbnail(uid: string, linkId: string, file: File): Promise<string> {
  validateImageFile(file);

  const blob = await resizeImage(file, 200, 200, 0.75);

  const storageRef = ref(storage, `thumbnails/${uid}/${linkId}.webp`);
  await uploadBytes(storageRef, blob, {
    contentType: "image/webp",
    customMetadata: { cacheControl: "public, max-age=31536000" },
  });

  return getDownloadURL(storageRef);
}

/* ================================================================
   Delete
   ================================================================ */

export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
