"use client";
import { useEffect, useId, useRef } from "react";

// Client half of the spam checks in lib/apiRequestGuards.ts (checkSpam).
// Render `trap` inside the form, and add `spamFields()` to what you send:
//   company_website  a text field hidden off-screen and from assistive tech.
//                    People never fill it; form-filling bots usually do.
//   form_elapsed_ms  how long the form has been on screen. The server turns
//                    away posts sent too quickly, and drops posts without it
//                    (those didn't come from our page at all).
const HIDDEN = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
} as const;

export function useSpamTrap() {
  const id = useId();
  const mountedAt = useRef(0);
  const trapRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const trap = (
    <div style={HIDDEN} aria-hidden="true">
      <label htmlFor={`${id}-website`}>Company website</label>
      <input ref={trapRef} id={`${id}-website`} name="company_website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );

  const spamFields = () => ({
    company_website: trapRef.current?.value ?? "",
    form_elapsed_ms: mountedAt.current ? Date.now() - mountedAt.current : 0,
  });

  return { trap, spamFields };
}
