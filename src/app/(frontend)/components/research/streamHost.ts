// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";

// The Cloudflare Stream address saved in Podcast Settings, or null.
export async function getStreamHost(): Promise<string | null> {
  const payload = await getPayload({ config });
  try {
    const settings: any = await payload.findGlobal({ slug: "podcast-settings", depth: 0 });
    return settings?.streamHost || null;
  } catch {
    return null;
  }
}
