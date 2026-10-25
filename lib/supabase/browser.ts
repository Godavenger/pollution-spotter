"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Reporting is not connected yet.");
  browserClient ??= createClient(url, key);
  return browserClient;
}

export async function getSessionToken(): Promise<string> {
  const client = getClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error("Your private session could not be restored. Please try again.");
  if (data.session) return data.session.access_token;
  const result = await client.auth.signInAnonymously();
  if (result.error || !result.data.session) throw new Error("A private session could not be started. Please try again shortly.");
  return result.data.session.access_token;
}
