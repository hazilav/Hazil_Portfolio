import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/client";

export interface DatabaseProject {
  id: string;
  title: string;
  category: string;
  description: string;
  long_description?: string;
  tools?: string[];
  image_url?: string | null;
  accent_icon?: string;
  status: string;
  created_at: string;
}

export async function getPublishedProjects(): Promise<DatabaseProject[]> {
  const { url, anonKey } = getSupabasePublicConfig();

  if (!url || !anonKey) {
    console.error("Missing Supabase public credentials");
    return [];
  }

  const supabase = createClient(url, anonKey);

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch published projects:", error.message);
    return [];
  }

  return (data as DatabaseProject[]) || [];
}
