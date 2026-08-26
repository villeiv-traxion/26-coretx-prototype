"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InlineLoader } from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { CaptureWorkspace } from "./CaptureWorkspace";

/**
 * The app root, which sends you to the screen your profile actually works on.
 *
 * Capture lives here: the root is the work, not a signpost. Coordination has a
 * route of its own so a narrowed table can be linked to, and landing here under
 * that profile is a redirect rather than a second copy of the same screen — two
 * URLs for one destination drift apart sooner or later.
 *
 * The profile is read from `localStorage`, so the decision can only be made in
 * the browser. That is the one frame of loader below.
 */

const COMPLIANCE = "/intelligence/capture/compliance";

const styles = {
  waiting: "py-16",
};

export function CaptureHome() {
  const { profile } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (profile === "coordination") router.replace(COMPLIANCE);
  }, [profile, router]);

  if (profile === "coordination") {
    return (
      <div className={styles.waiting}>
        <InlineLoader />
      </div>
    );
  }

  return <CaptureWorkspace />;
}
