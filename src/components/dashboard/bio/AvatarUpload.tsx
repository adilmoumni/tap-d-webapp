"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/* ─────────────────────────────────────────────
   AvatarUpload — circular avatar with upload
   and remove actions. Parent handles the actual
   upload/delete calls via onUpload / onRemove.
───────────────────────────────────────────── */

interface AvatarUploadProps {
  currentUrl: string | null;
  displayName: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  /** Called with the File when user selects one. Returns the download URL. */
  uploadFn: (file: File) => Promise<string>;
}

export function AvatarUpload({
  currentUrl,
  displayName,
  onUpload,
  onRemove,
  uploadFn,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = displayName?.[0]?.toUpperCase() ?? "U";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    setError(null);
    setLoading(true);

    try {
      const url = await uploadFn(file);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setError(null);
    onRemove();
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        {/* Avatar circle */}
        <div className="relative w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#e8b86d] flex items-center justify-center text-white text-xl font-bold">
              {initial}
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-[#0a0a0f] text-white text-[12px] font-semibold hover:bg-[#1a1a2e] transition-colors disabled:opacity-50"
          >
            {loading ? "Uploading..." : "+ Upload"}
          </button>

          {currentUrl && !loading && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] text-[#8a8a9a] hover:text-[#ef4444] transition-colors text-left"
            >
              Remove
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-[11px] text-[#ef4444]">{error}</p>
      )}
    </div>
  );
}
