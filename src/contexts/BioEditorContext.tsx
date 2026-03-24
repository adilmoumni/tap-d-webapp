"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getBioPage,
  getBioLinks,
  updateBioPage,
  updateBioTheme as updateBioThemeDB,
  addBioLink as addBioLinkDB,
  updateBioLink as updateBioLinkDB,
  deleteBioLink as deleteBioLinkDB,
  reorderBioLinks as reorderBioLinksDB,
  updateSocialLinks as updateSocialLinksDB,
} from "@/lib/db/bio";
import { cleanData } from "@/lib/utils";
import type {
  BioPageData,
  BioTheme,
  BioLink,
  BioSocialLink,
} from "@/types/bio";
import { DEFAULT_THEME } from "@/types/bio";

/* ─────────────────────────────────────────────
   BioEditorContext — live editor state for the
   bio page. All editors read/write through this.
   PhonePreview reads from it for live updates.
───────────────────────────────────────────── */

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BioEditorContextValue {
  data: BioPageData;
  isDirty: boolean;
  saveStatus: SaveStatus;
  loading: boolean;

  // Field updates
  updateField: <K extends keyof BioPageData>(field: K, value: BioPageData[K]) => void;
  updateTheme: <K extends keyof BioTheme>(field: K, value: BioTheme[K]) => void;

  // Link actions
  addLink: (link: Partial<BioLink>) => void;
  removeLink: (linkId: string) => void;
  updateLink: (linkId: string, data: Partial<BioLink>) => void;
  reorderLinks: (fromIndex: number, toIndex: number) => void;
  toggleLinkVisibility: (linkId: string) => void;

  // Social links
  updateSocialLinks: (links: BioSocialLink[]) => void;

  // Persistence
  save: () => Promise<void>;
  reset: () => void;
  retrySave: () => void;
}

const BioEditorContext = createContext<BioEditorContextValue | null>(null);

/* ── Default data (used before Firestore load / for new users) ── */

const EMPTY_PAGE: BioPageData = {
  ownerId: "",
  slug: "",
  displayName: "",
  bio: "",
  avatarUrl: null,
  socialLinks: [],
  links: [],
  theme: { ...DEFAULT_THEME },
  isPublic: true,
  updatedAt: null as unknown as BioPageData["updatedAt"],
  createdAt: null as unknown as BioPageData["createdAt"],
};

/* ── Demo data (shown while loading / no Firestore doc) ── */

const DEMO_PAGE: BioPageData = {
  ...EMPTY_PAGE,
  ownerId: "demo",
  slug: "emma",
  displayName: "Emma Creates",
  bio: "Digital creator & UI designer. Building the future of smart links.",
  socialLinks: [
    { platform: "instagram", url: "https://instagram.com/emma", icon: "", order: 0 },
    { platform: "twitter", url: "https://twitter.com/emma", icon: "", order: 1 },
    { platform: "youtube", url: "https://youtube.com/@emma", icon: "", order: 2 },
    { platform: "tiktok", url: "https://tiktok.com/@emma", icon: "", order: 3 },
  ],
  links: [
    { id: "1", title: "Spotify playlist", url: "", slug: "spotify", icon: "", isSmart: true, fallbackUrl: "", isVisible: true, isActive: true, clicks: 2340, order: 0, createdAt: null as unknown as BioLink["createdAt"] },
    { id: "2", title: "ColorPal app", url: "", slug: "colorpal", icon: "", isSmart: true, fallbackUrl: "", isVisible: true, isActive: true, clicks: 1102, order: 1, createdAt: null as unknown as BioLink["createdAt"] },
    { id: "3", title: "Instagram", url: "", slug: "instagram", icon: "", isSmart: false, fallbackUrl: "", isVisible: true, isActive: true, clicks: 0, order: 2, createdAt: null as unknown as BioLink["createdAt"] },
    { id: "4", title: "Newsletter", url: "", slug: "newsletter", icon: "", isSmart: false, fallbackUrl: "", isVisible: false, isActive: true, clicks: 312, order: 3, createdAt: null as unknown as BioLink["createdAt"] },
  ],
};

/* ── Provider ── */

export function BioEditorProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const activeBioId = profile?.activeBioId ?? null;

  const [data, setData] = useState<BioPageData>(EMPTY_PAGE);
  const [savedData, setSavedData] = useState<BioPageData>(EMPTY_PAGE);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load from Firestore on mount / activeBioId change ── */
  useEffect(() => {
    if (!activeBioId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [page, links] = await Promise.all([
          getBioPage(activeBioId!),
          getBioLinks(activeBioId!),
        ]);

        if (cancelled) return;

        if (page) {
          const fullData: BioPageData = {
            ...page,
            links,
            theme: { ...DEFAULT_THEME, ...page.theme },
          };
          setData(fullData);
          setSavedData(fullData);
        }
      } catch (err) {
        console.error("[BioEditor] Failed to load bio page:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeBioId]);

  /* ── Auto-save: debounce 2s after last change ── */
  useEffect(() => {
    if (!isDirty || !activeBioId) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      save();
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, data]);

  /* ── Mark dirty helper ── */
  const markDirty = useCallback(() => {
    setIsDirty(true);
    if (saveStatus === "saved" || saveStatus === "error") {
      setSaveStatus("idle");
    }
  }, [saveStatus]);

  /* ── Update field ── */
  const updateField = useCallback(<K extends keyof BioPageData>(field: K, value: BioPageData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    markDirty();
  }, [markDirty]);

  /* ── Update theme ── */
  const updateTheme = useCallback(<K extends keyof BioTheme>(field: K, value: BioTheme[K]) => {
    setData((prev) => ({
      ...prev,
      theme: { ...prev.theme, [field]: value },
    }));
    markDirty();
  }, [markDirty]);

  /* ── Link actions ── */
  const addLink = useCallback((link: Partial<BioLink>) => {
    const newLink: BioLink = {
      id: Date.now().toString(),
      title: link.title ?? "New link",
      url: link.url ?? "",
      slug: link.slug ?? "",
      icon: link.icon ?? "",
      isSmart: link.isSmart ?? false,
      fallbackUrl: link.fallbackUrl ?? "",
      isVisible: link.isVisible ?? true,
      isActive: link.isActive ?? true,
      clicks: 0,
      order: 0,
      createdAt: null as unknown as BioLink["createdAt"],
      ...link,
    };

    setData((prev) => {
      // Put new link at order 0 and bump others
      const reordered = prev.links.map((l) => ({ ...l, order: l.order + 1 }));
      return { ...prev, links: [{ ...newLink, order: 0 }, ...reordered] };
    });
    markDirty();
  }, [markDirty]);

  const removeLink = useCallback((linkId: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links
        .filter((l) => l.id !== linkId)
        .map((l, i) => ({ ...l, order: i })),
    }));
    markDirty();
  }, [markDirty]);

  const updateLink = useCallback((linkId: string, updates: Partial<BioLink>) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === linkId ? { ...l, ...updates } : l)),
    }));
    markDirty();
  }, [markDirty]);

  const reorderLinks = useCallback((fromIndex: number, toIndex: number) => {
    setData((prev) => {
      const sorted = [...prev.links].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return {
        ...prev,
        links: sorted.map((l, i) => ({ ...l, order: i })),
      };
    });
    markDirty();
  }, [markDirty]);

  const toggleLinkVisibility = useCallback((linkId: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) =>
        l.id === linkId ? { ...l, isVisible: !l.isVisible } : l
      ),
    }));
    markDirty();
  }, [markDirty]);

  /* ── Social links ── */
  const updateSocialLinksAction = useCallback((links: BioSocialLink[]) => {
    setData((prev) => ({ ...prev, socialLinks: links }));
    markDirty();
  }, [markDirty]);

  /* ── Save to Firestore ── */
  const save = useCallback(async () => {
    if (!activeBioId) return;

    setSaveStatus("saving");

    try {
      // Save page fields (excluding links — those go to subcollection)
      const { links: _links, ...pageFields } = data;
      await updateBioPage(activeBioId, cleanData({
        displayName: pageFields.displayName,
        bio: pageFields.bio,
        avatarUrl: pageFields.avatarUrl,
        isPublic: pageFields.isPublic,
      }));

      // Save theme
      await updateBioThemeDB(activeBioId, cleanData(data.theme));

      // Save social links
      await updateSocialLinksDB(activeBioId, data.socialLinks.map(l => cleanData(l)));

      // Diff links: find new, deleted, and existing
      const savedIds = new Set(savedData.links.map((l) => l.id));
      const currentIds = new Set(data.links.map((l) => l.id));

      // Create new links (exist in current but not in saved)
      const newLinks = data.links.filter((l) => !savedIds.has(l.id));
      for (const link of newLinks) {
        const { id: _id, createdAt: _ca, clicks: _cl, ...linkData } = link;
        const cleaned = cleanData(linkData);
        const newId = await addBioLinkDB(activeBioId, cleaned);
        // Update local id to match Firestore-generated id
        link.id = newId;
      }

      // Delete removed links (exist in saved but not in current)
      const deletedLinks = savedData.links.filter((l) => !currentIds.has(l.id));
      for (const link of deletedLinks) {
        await deleteBioLinkDB(activeBioId, link.id);
      }

      // Update existing links that changed
      const existingLinks = data.links.filter((l) => savedIds.has(l.id));
      for (const link of existingLinks) {
        const saved = savedData.links.find((s) => s.id === link.id);
        if (!saved) continue;
        const changed =
          link.title !== saved.title ||
          link.url !== saved.url ||
          link.slug !== saved.slug ||
          link.icon !== saved.icon ||
          link.layout !== saved.layout ||
          link.thumbnailUrl !== saved.thumbnailUrl ||
          link.lockType !== saved.lockType ||
          link.lockCode !== saved.lockCode ||
          link.lockPassword !== saved.lockPassword ||
          link.scheduleStart !== saved.scheduleStart ||
          link.scheduleEnd !== saved.scheduleEnd ||
          link.prioritize !== saved.prioritize ||
          link.animationType !== saved.animationType ||
          link.redirectUntil !== saved.redirectUntil ||
          link.isVisible !== saved.isVisible ||
          link.order !== saved.order ||
          link.isSmart !== saved.isSmart ||
          link.fallbackUrl !== saved.fallbackUrl;
        if (changed) {
          const updates = cleanData({
            title: link.title,
            url: link.url,
            slug: link.slug,
            icon: link.icon,
            isVisible: link.isVisible,
            order: link.order,
            isSmart: link.isSmart,
            fallbackUrl: link.fallbackUrl,
            layout: link.layout ?? "classic",
            lockType: link.lockType ?? "none",
            thumbnailUrl: link.thumbnailUrl ?? null,
            lockCode: link.lockCode ?? null,
            lockPassword: link.lockPassword ?? null,
            scheduleStart: link.scheduleStart ?? null,
            scheduleEnd: link.scheduleEnd ?? null,
            prioritize: link.prioritize ?? "none",
            animationType: link.animationType ?? "buzz",
            redirectUntil: link.redirectUntil ?? null,
          });
          await updateBioLinkDB(activeBioId, link.id, updates);
        }
      }

      // Reorder all links
      const linkIds = data.links
        .sort((a, b) => a.order - b.order)
        .map((l) => l.id);
      if (linkIds.length > 0) {
        await reorderBioLinksDB(activeBioId, linkIds);
      }

      setSavedData({ ...data, links: data.links.map((l) => ({ ...l })) });
      setIsDirty(false);
      setSaveStatus("saved");

      // Clear "saved" indicator after 2s
      if (savedIndicatorRef.current) clearTimeout(savedIndicatorRef.current);
      savedIndicatorRef.current = setTimeout(() => {
        setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 2000);
    } catch (err) {
      console.error("[BioEditor] Save failed:", err);
      setSaveStatus("error");
    }
  }, [activeBioId, data, savedData]);

  /* ── Reset to last saved ── */
  const reset = useCallback(() => {
    setData(savedData);
    setIsDirty(false);
    setSaveStatus("idle");
  }, [savedData]);

  /* ── Retry save ── */
  const retrySave = useCallback(() => {
    save();
  }, [save]);

  /* ── Cleanup timers ── */
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedIndicatorRef.current) clearTimeout(savedIndicatorRef.current);
    };
  }, []);

  return (
    <BioEditorContext.Provider
      value={{
        data,
        isDirty,
        saveStatus,
        loading,
        updateField,
        updateTheme,
        addLink,
        removeLink,
        updateLink,
        reorderLinks,
        toggleLinkVisibility,
        updateSocialLinks: updateSocialLinksAction,
        save,
        reset,
        retrySave,
      }}
    >
      {children}
    </BioEditorContext.Provider>
  );
}

export function useBioEditor() {
  const context = useContext(BioEditorContext);
  if (!context) {
    throw new Error("useBioEditor must be used within BioEditorProvider");
  }
  return context;
}
