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
    case "header": return <DesignHeader />;
    case "theme": return <DesignTheme />;
    case "wallpaper": return <DesignWallpaper />;
    case "text": return <DesignText />;
    case "buttons": return <DesignButtons />;
    case "colors": return <DesignColors />;
    case "footer": return <DesignFooter />;
    default: return null;
  }
}
