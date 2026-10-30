import { createClient } from "@supabase/supabase-js";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase public credentials");
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
