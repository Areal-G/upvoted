"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetDemoOnReload } from "@/server/actions/demo";

// Mounted once per document in the root layout. Only a real browser reload
// (not client-side navigation or a new tab) resets the guest demo workspace.
export function DemoResetOnReload() {
  const router = useRouter();

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type !== "reload") return;

    resetDemoOnReload()
      .then((r) => {
        if (r.reset) router.refresh();
      })
      .catch(() => {});
  }, [router]);

  return null;
}
