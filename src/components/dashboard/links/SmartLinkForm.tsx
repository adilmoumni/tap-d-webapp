"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Check, X, Monitor } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { BioLink } from "@/types/bio";
import { cn } from "@/lib/utils";

const RESERVED = new Set(["dashboard", "login", "signup", "api", "settings", "pricing", "bio", "b", "d", "_next"]);

const PLATFORM_PRESETS: Record<string, { 
  smart: boolean, 
  iosPlaceholder?: string, 
  androidPlaceholder?: string,
  fallbackPlaceholder?: string,
  icon: string 
}> = {
  "Spotify": { smart: true, iosPlaceholder: "https://apps.apple.com/app/spotify/...", androidPlaceholder: "https://play.google.com/store/apps/details?id=com.spotify.music", fallbackPlaceholder: "https://open.spotify.com/...", icon: "🎵" },
  "Apple Music": { smart: true, iosPlaceholder: "https://music.apple.com/...", fallbackPlaceholder: "https://music.apple.com/...", icon: "🎵" },
  "Podcast": { smart: true, iosPlaceholder: "https://podcasts.apple.com/...", androidPlaceholder: "https://open.spotify.com/show/...", fallbackPlaceholder: "https://yourpodcast.com", icon: "🎙️" },
  "YouTube": { smart: false, fallbackPlaceholder: "https://youtube.com/@...", icon: "▶️" },
  "Instagram": { smart: false, fallbackPlaceholder: "https://instagram.com/...", icon: "📸" },
  "TikTok": { smart: false, fallbackPlaceholder: "https://tiktok.com/@...", icon: "🎵" },
  "Twitter / X": { smart: false, fallbackPlaceholder: "https://x.com/...", icon: "🐦" },
  "WhatsApp": { smart: false, fallbackPlaceholder: "https://wa.me/...", icon: "💬" },
  "LinkedIn": { smart: false, fallbackPlaceholder: "https://linkedin.com/in/...", icon: "💼" },
  "GitHub": { smart: false, fallbackPlaceholder: "https://github.com/...", icon: "💻" },
  "Website": { smart: false, fallbackPlaceholder: "https://yourwebsite.com", icon: "🌐" },
  "Email": { smart: false, fallbackPlaceholder: "mailto:you@email.com", icon: "✉️" },
  "Discord": { smart: false, fallbackPlaceholder: "https://discord.gg/...", icon: "💬" },
  "Twitch": { smart: false, fallbackPlaceholder: "https://twitch.tv/...", icon: "🎮" },
  "Shop": { smart: false, fallbackPlaceholder: "https://yourshop.com", icon: "🛒" },
};

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isValidSlug(str: string) {
  if (str.length < 3 || str.length > 50) return false;
  if (RESERVED.has(str)) return false;
  if (!/^[a-z0-9-]+$/.test(str)) return false;
  if (str.startsWith("-") || str.endsWith("-")) return false;
  return true;
}

export function SmartLinkForm({
  initialData,
  onSuccess,
  onCancel,
  mode
}: {
  initialData?: Partial<BioLink>;
  onSuccess: (link: BioLink) => void;
  onCancel: () => void;
  mode: "create" | "edit";
}) {
  const { profile } = useAuth();

  const preset = mode === "create" && initialData?.title ? PLATFORM_PRESETS[initialData.title] : undefined;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || (preset && initialData?.title ? generateSlug(initialData.title) : ""));
  const [isSmart, setIsSmart] = useState(initialData?.isSmart ?? (preset?.smart ?? false));
  const [iosUrl, setIosUrl] = useState(initialData?.iosUrl || "");
  const [androidUrl, setAndroidUrl] = useState(initialData?.androidUrl || "");
  const [fallbackUrl, setFallbackUrl] = useState(initialData?.fallbackUrl || initialData?.url || "");
  const [icon, setIcon] = useState(initialData?.icon || (preset?.icon ?? "🔗"));
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "");
  const [addToBio, setAddToBio] = useState(mode === "create");
  const [uploading, setUploading] = useState(false);

  const [slugState, setSlugState] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mode === "edit" && slug === initialData?.slug) {
      setSlugState("available");
      return;
    }

    if (!slug) {
      setSlugState("idle");
      return;
    }

    if (!isValidSlug(slug)) {
      setSlugState("invalid");
      return;
    }

    setSlugState("checking");
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const snap = await getDoc(doc(db, "links", slug));
        if (snap.exists()) {
          setSlugState("taken");
        } else {
          setSlugState("available");
        }
      } catch (e) {
        console.error("Error checking slug:", e);
        setSlugState("idle");
      }
    }, 500);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [slug, mode, initialData?.slug]);

  const [userEditedSlug, setUserEditedSlug] = useState(!!initialData?.slug);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!userEditedSlug && mode === "create") {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setUserEditedSlug(true);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugState === "checking" || slugState === "taken" || slugState === "invalid") return;
    if (!title.trim() || !slug.trim() || !fallbackUrl.trim()) return;

    try {
      new URL(fallbackUrl);
      if (isSmart && iosUrl) new URL(iosUrl);
      if (isSmart && androidUrl) new URL(androidUrl);
    } catch {
      alert("Please ensure all provided URLs are valid (e.g., https://...)");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create" || slug !== initialData?.slug) {
        const check = await getDoc(doc(db, "links", slug));
        if (check.exists()) {
          setSlugState("taken");
          setSubmitting(false);
          return;
        }
      }

      const linkId = initialData?.id || Date.now().toString() + "-" + Math.random().toString(36).substr(2, 5);
      
      const newLink: BioLink = {
        uid: profile?.uid || "",
        title: title.trim(),
        slug: slug.trim(),
        url: fallbackUrl.trim(),
        fallbackUrl: fallbackUrl.trim(),
        isSmart,
        iosUrl: isSmart ? iosUrl.trim() : "",
        androidUrl: isSmart ? androidUrl.trim() : "",
        icon,
        thumbnailUrl: thumbnailUrl || null,
        isVisible: initialData?.isVisible ?? true,
        isActive: initialData?.isActive ?? true,
        clicks: initialData?.clicks || 0,
        ...initialData,
      } as BioLink;

      const promises = [];
      promises.push(setDoc(doc(db, "links", slug.trim()), newLink, { merge: true }));

      if (profile?.username && addToBio) {
        promises.push(
          setDoc(doc(db, "biopages", profile.username, "links", linkId), newLink, { merge: true })
        );
      }

      await Promise.all(promises);
      onSuccess(newLink);
    } catch (err) {
      console.error("Failed to save link:", err);
      alert("Failed to save link.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title.trim() && slug.trim() && fallbackUrl.trim() && (slugState === "available" || slugState === "idle");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-[#1a1a2e]">Link title <span className="text-red-500">*</span></label>
        <input 
          placeholder="My awesome link"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-[8px] bg-white border border-[#e8e6e2] text-[14px] outline-none focus:border-[#e8b86d] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-[#1a1a2e]">Custom slug <span className="text-red-500">*</span></label>
        <div className="relative flex">
          <div className="flex items-center justify-center bg-[#f0eeea] border border-[#e8e6e2] border-r-0 rounded-l-[8px] px-3">
            <span className="text-[#8a8a9a] text-[14px]">tap-d.link/</span>
          </div>
          <input 
            placeholder="my-awesome-link"
            value={slug}
            onChange={e => handleSlugChange(e.target.value)}
            required
            className={cn(
               "flex-1 px-3 py-2 rounded-r-[8px] bg-white border border-[#e8e6e2] text-[14px] outline-none transition-colors",
               slugState === "invalid" || slugState === "taken" ? "border-red-500" : "focus:border-[#e8b86d]"
            )}
          />
          <div className="absolute right-3 top-[10px]">
            {slugState === "checking" && <Loader2 className="animate-spin text-[#8a8a9a]" size={16} />}
            {slugState === "available" && <Check className="text-green-500" size={16} />}
            {(slugState === "taken" || slugState === "invalid") && <X className="text-red-500" size={16} />}
          </div>
        </div>
        {slugState === "available" && <span className="text-[11px] text-green-600 font-medium ml-1">Available</span>}
        {slugState === "taken" && <span className="text-[11px] text-red-500 font-medium ml-1">This slug is taken</span>}
        {slugState === "invalid" && <span className="text-[11px] text-red-500 font-medium ml-1">Only lowercase letters, numbers, hyphens</span>}
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-[12px] bg-[#faf8fc] border border-[#e8e6e2]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-[#1a1a2e]">Smart link (device detection)</div>
            <p className="text-[12px] text-[#8a8a9a] leading-snug pr-4">Auto-detect iOS, Android, Desktop and redirect to the right URL</p>
          </div>
          <div 
            role="switch" 
            aria-checked={isSmart}
            onClick={() => setIsSmart(!isSmart)}
            className={cn(
              "w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors shrink-0", 
              isSmart ? "bg-green-500" : "bg-[#e8e6e2]"
            )}
          >
            <div className={cn("bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200", isSmart ? "translate-x-5" : "translate-x-0")} />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {isSmart && (
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
              <label className="text-[12px] font-semibold text-[#1a1a2e] flex items-center gap-1.5">
                <AppleIcon /> iOS
              </label>
              <input 
                placeholder={preset?.iosPlaceholder || "https://apps.apple.com/app/..."}
                value={iosUrl}
                onChange={e => setIosUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-white border border-[#e8e6e2] text-[13px] font-mono outline-none focus:border-[#e8b86d] transition-colors"
              />
            </div>
          )}

          {isSmart && (
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
              <label className="text-[12px] font-semibold text-[#1a1a2e] flex items-center gap-1.5">
                <AndroidIcon /> Android
              </label>
              <input 
                placeholder={preset?.androidPlaceholder || "https://play.google.com/store/apps/..."}
                value={androidUrl}
                onChange={e => setAndroidUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-white border border-[#e8e6e2] text-[13px] font-mono outline-none focus:border-[#e8b86d] transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-semibold text-[#1a1a2e] flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5"><Monitor size={14}/> Desktop / Fallback <span className="text-red-500">*</span></span>
             </label>
             <p className="text-[10px] text-[#8a8a9a] font-normal leading-none mt-[-2px]">Used when no platform-specific URL matches, or for desktop visitors</p>
             <input 
                placeholder={preset?.fallbackPlaceholder || "https://yourwebsite.com"}
                value={fallbackUrl}
                onChange={e => setFallbackUrl(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-[8px] bg-white border border-[#e8e6e2] text-[13px] font-mono outline-none focus:border-[#e8b86d] transition-colors mt-1"
             />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1">
         <label className="text-[12px] font-semibold text-[#1a1a2e] min-w-[32px]">Icon</label>
         <input 
            value={icon}
            onChange={e => setIcon(e.target.value)}
            className="w-[45px] h-[45px] text-center text-[20px] rounded-[10px] border border-[#e8e6e2] bg-white outline-none focus:border-[#e8b86d]"
            maxLength={2}
         />
         <div className="flex gap-2 p-2 bg-[#f0eeea] rounded-[10px] flex-1 overflow-x-auto no-scrollbar">
            {["🔗","🎵","📸","▶️","💼","🐦","💬","🌐"].map(emoji => (
               <button type="button" key={emoji} onClick={() => { setIcon(emoji); setThumbnailUrl(""); }} className="w-[30px] h-[30px] flex items-center justify-center bg-white rounded-[6px] shadow-sm hover:scale-110 transition-transform shrink-0">
                  {emoji}
               </button>
            ))}
         </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-semibold text-[#1a1a2e]">Or upload a custom icon</label>
        <div className="flex items-center gap-4">
          {thumbnailUrl ? (
            <div className="relative group">
              <img src={thumbnailUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-[#e8e6e2]" />
              <button 
                type="button" 
                onClick={() => setThumbnailUrl("")}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#f0eeea] border border-dashed border-[#d1cfca] flex items-center justify-center text-[#8a8a9a]">
              <Monitor size={20} className="opacity-40" />
            </div>
          )}
          
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              id="icon-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !profile?.uid) return;
                
                setUploading(true);
                try {
                  const storageRef = ref(storage, `thumbnails/${profile.uid}/${Date.now()}_${file.name}`);
                  const uploadTask = await uploadBytesResumable(storageRef, file);
                  const downloadUrl = await getDownloadURL(uploadTask.ref);
                  setThumbnailUrl(downloadUrl);
                  setIcon(""); // Clear emoji if using custom image
                } catch (err) {
                  console.error("Upload failed", err);
                  alert("Failed to upload image.");
                } finally {
                  setUploading(false);
                }
              }}
            />
            <label 
              htmlFor="icon-upload" 
              className={cn(
                "inline-flex items-center justify-center px-4 py-2 border border-[#e8e6e2] rounded-[8px] text-[12px] font-semibold cursor-pointer hover:bg-[#f0eeea] transition-colors",
                uploading && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={14} />
                  Uploading...
                </>
              ) : (
                "Choose image"
              )}
            </label>
            <p className="text-[10px] text-[#8a8a9a] mt-1">Recommended: 128x128px PNG/JPG</p>
          </div>
        </div>
      </div>

      {mode === "create" && (
         <div className="flex items-center justify-between mt-2">
            <div>
               <div className="text-[13px] font-semibold text-[#1a1a2e]">Add to bio page</div>
               <div className="text-[11px] text-[#8a8a9a]">Show this link on tap-d.link/@{profile?.username || "your-username"}</div>
            </div>
            <div 
              role="switch" 
              aria-checked={addToBio}
              onClick={() => setAddToBio(!addToBio)}
              className={cn(
                "w-10 h-5 rounded-full flex items-center p-[2px] cursor-pointer transition-colors shrink-0", 
                addToBio ? "bg-green-500" : "bg-[#e8e6e2]"
              )}
            >
              <div className={cn("bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200", addToBio ? "translate-x-5" : "translate-x-0")} />
            </div>
         </div>
      )}

      <div className="flex gap-3 pt-4 mt-2 border-t border-[#e8e6e2]">
         <button 
           type="button" 
           onClick={onCancel}
           className="px-4 py-2.5 rounded-full font-semibold text-[14px] text-[#1a1a2e] bg-[#f0eeea] hover:bg-[#e8e6e2] transition-colors"
         >
           Cancel
         </button>
         <button 
           type="submit" 
           disabled={!isFormValid || submitting}
           className="flex-1 px-4 py-2.5 rounded-full font-semibold text-[14px] text-white bg-[#1a1a2e] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
         >
           {submitting && <Loader2 size={16} className="animate-spin" />}
           {mode === "create" ? "Create smart link" : "Save changes"}
         </button>
      </div>
      
    </form>
  )
}

function AppleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
       <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 576 512" fill="currentColor">
      <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l48,83.08C62.09,198.53,6,277,3.12,367.65H572.88c-2.88-90.6-59-169.12-143.73-210.2Z"/>
    </svg>
  )
}
