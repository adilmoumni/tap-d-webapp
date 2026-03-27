"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { AvatarUpload } from "@/components/dashboard/bio/AvatarUpload";
import { uploadAvatar } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";

function HeaderToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative w-9 h-5 rounded-[10px] cursor-pointer transition-colors duration-200 flex-shrink-0",
        on ? "bg-[#22c55e]" : "bg-[#e8e6e2]"
      )}
    >
      <div
        className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </div>
  );
}

export function DesignHeader() {
  const { data, updateField, updateTheme } = useBioEditor();
  const { profile } = useAuth();
  const bioId = profile?.activeBioId ?? null;
  const layout = data.theme.headerLayout;

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Header</h2>

      {/* Profile Image */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Profile image</label>
        <AvatarUpload
          currentUrl={data.avatarUrl}
          displayName={data.displayName}
          onUpload={(url) => updateField("avatarUrl", url)}
          onRemove={() => updateField("avatarUrl", null)}
          uploadFn={(file) => uploadAvatar(bioId ?? "anon", file)}
        />
      </div>

      {/* Layout */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Layout</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateTheme("headerLayout", "classic")}
            className={cn(
              "relative p-4 rounded-[12px] border text-left transition-all",
              layout === "classic" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-[#f5f3f0] mb-3" />
            <div className="text-[13px] font-semibold text-[#1a1a2e]">Classic</div>
            <div className="text-[11px] text-[#8a8a9a]">Avatar above text</div>
          </button>

          <button
            onClick={() => updateTheme("headerLayout", "hero")}
            className={cn(
              "relative p-4 rounded-[12px] border text-left transition-all",
              layout === "hero" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[8px] font-bold uppercase tracking-wide">
              Pro
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-[#f5f3f0] mb-3" />
            <div className="text-[13px] font-semibold text-[#1a1a2e]">Hero</div>
            <div className="text-[11px] text-[#8a8a9a]">Avatar on the left</div>
          </button>
        </div>
      </div>

      {/* Title Size */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Title size</label>
        <div className="grid grid-cols-2 gap-3">
          {(["small", "large"] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateTheme("titleSize", size)}
              className={cn(
                "p-3 rounded-[10px] border text-center transition-all",
                data.theme.titleSize === size ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
              )}
            >
              <div className="text-[11px] font-medium text-[#8a8a9a] capitalize">{size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Info */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-2">Title</label>
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => updateField("displayName", e.target.value)}
          className="w-full px-[14px] py-[10px] border border-[#e8e6e2] rounded-[10px] text-[13px] text-[#1a1a2e] focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] outline-none transition-all mb-4"
        />

        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-2">Bio</label>
        <textarea
          value={data.bio}
          onChange={(e) => updateField("bio", e.target.value)}
          rows={3}
          className="w-full px-[14px] py-[10px] border border-[#e8e6e2] rounded-[10px] text-[13px] text-[#1a1a2e] focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] outline-none transition-all resize-none"
        />
      </div>

      {/* Username visibility */}
      <div className="rounded-[16px] border border-[#e8e6e2] bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-[13px] font-semibold text-[#1a1a2e] mb-0.5">Show username</div>
            <div className="text-[11px] text-[#8a8a9a]">Display the @slug under your name</div>
          </div>
          <HeaderToggle
            on={data.theme.showUsername !== false}
            onToggle={() => updateTheme("showUsername", !(data.theme.showUsername !== false))}
          />
        </div>
      </div>
    </div>
  );
}
