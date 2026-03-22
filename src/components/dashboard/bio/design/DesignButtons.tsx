"use client";

import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";

export function DesignButtons() {
  const { data, updateTheme } = useBioEditor();
  const activeShape = data.theme.buttonStyle;
  const activeFill = data.theme.buttonFill;

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Buttons</h2>

      {/* Shape */}
      <div className="mb-8">
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Shape</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => updateTheme("buttonStyle", "rounded")}
            className={cn(
              "p-3 rounded-[12px] border transition-all flex flex-col items-center",
              activeShape === "rounded" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-full h-8 bg-[#1a1a2e] rounded-[8px] mb-3" />
            <div className="text-[11px] font-medium text-[#8a8a9a]">Rounded</div>
          </button>

          <button
            onClick={() => updateTheme("buttonStyle", "pill")}
            className={cn(
              "p-3 rounded-[12px] border transition-all flex flex-col items-center",
              activeShape === "pill" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-full h-8 bg-[#1a1a2e] rounded-full mb-3" />
            <div className="text-[11px] font-medium text-[#8a8a9a]">Pill</div>
          </button>

          <button
            onClick={() => updateTheme("buttonStyle", "square")}
            className={cn(
              "p-3 rounded-[12px] border transition-all flex flex-col items-center",
              activeShape === "square" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-full h-8 bg-[#1a1a2e] rounded-none mb-3" />
            <div className="text-[11px] font-medium text-[#8a8a9a]">Square</div>
          </button>
        </div>
      </div>

      {/* Fill */}
      <div>
        <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">Fill</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => updateTheme("buttonFill", "filled")}
            className={cn(
              "p-3 rounded-[12px] border transition-all flex flex-col items-center",
              activeFill === "filled" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-full h-8 bg-[#1a1a2e] rounded-[8px] mb-3" />
            <div className="text-[11px] font-medium text-[#8a8a9a]">Filled</div>
          </button>

          <button
            onClick={() => updateTheme("buttonFill", "outline")}
            className={cn(
              "p-3 rounded-[12px] border transition-all flex flex-col items-center",
              activeFill === "outline" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-full h-8 bg-transparent border-[1.5px] border-[#1a1a2e] rounded-[8px] mb-3" />
            <div className="text-[11px] font-medium text-[#8a8a9a]">Outline</div>
          </button>

          <button
            onClick={() => updateTheme("buttonFill", "shadow")}
            className={cn(
              "p-3 rounded-[12px] border transition-all flex flex-col items-center",
              activeFill === "shadow" ? "border-[#0a0a0f] bg-white ring-1 ring-[#0a0a0f]" : "border-[#e8e6e2] bg-white hover:border-[#8a8a9a]"
            )}
          >
            <div className="w-full h-8 bg-white border-[1.5px] border-[#1a1a2e] rounded-[8px] mb-3" style={{ boxShadow: "4px 4px 0 #1a1a2e" }} />
            <div className="text-[11px] font-medium text-[#8a8a9a]">Shadow</div>
          </button>
        </div>
      </div>
    </div>
  );
}
