"use client";

import { DesignHeader } from "./DesignHeader";
import { DesignTheme } from "./DesignTheme";
import { DesignWallpaper } from "./DesignWallpaper";
import { DesignText } from "./DesignText";
import { DesignButtons } from "./DesignButtons";
import { DesignColors } from "./DesignColors";
import { DesignFooter } from "./DesignFooter";

export function BioDesignEditor({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "d-header": return <DesignHeader />;
    case "d-theme": return <DesignTheme />;
    case "d-wallpaper": return <DesignWallpaper />;
    case "d-text": return <DesignText />;
    case "d-buttons": return <DesignButtons />;
    case "d-colors": return <DesignColors />;
    case "d-footer": return <DesignFooter />;
    default: return null;
  }
}
