"use client";

import { useStore } from "./lib/store";
import { MyOperations } from "./MyOperations";
import { ComplianceTable } from "./ComplianceTable";

/**
 * The root is the work, not a signpost: whoever captures walks in and sees what
 * they have to load; whoever coordinates walks in and sees how the week is
 * going.
 */
export function CaptureHome() {
  const { profile } = useStore();
  return profile === "capture" ? <MyOperations /> : <ComplianceTable />;
}
