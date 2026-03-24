"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LinkRedirectClient() {
  const { slug } = useParams();
  const router = useRouter();

  useEffect(() => {
    const s = Array.isArray(slug) ? slug[0] : slug;
    if (s) {
      router.replace(`/d/links/${s}`);
    }
  }, [slug, router]);

  return null;
}
