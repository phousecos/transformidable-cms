"use client";
import { useEffect } from "react";
import { captureInbound } from "./inbound";

// Mounted in the site shell so campaign tags are saved on whichever page an
// inbound link lands on.
export function InboundCapture() {
  useEffect(() => {
    captureInbound();
  }, []);
  return null;
}
