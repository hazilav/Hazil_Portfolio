import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "./actions";
import AdminDashboardManager from "./AdminDashboardManager";

export const metadata = {
  title: "Admin Dashboard | Hazil Portfolio",
  description: "Secure Admin Panel with Project Management & Meeting Bookings",
};

export interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  long_description?: string;
  tools?: string[];
  status: "published" | "draft";
  image_url?: string | null;
  accent_icon?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRecord {
  id: string;
  name: string;
  email: string;
  topic: string;
  date: string;
  time: string;
  notes?: string;
  status: string;
  created_at: string;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  // Strict server-side authorization check
  if (!user || (adminEmail && user.email?.toLowerCase() !== adminEmail)) {
    redirect("/admin/login?error=unauthorized");
  }

  // Fetch all projects and bookings in parallel
  const [projectsRes, bookingsRes] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
  ]);

  const initialProjects: ProjectRecord[] = (projectsRes.data || []).map((p) => ({
    ...p,
    status: p.status || "published",
  }));

  const initialBookings: BookingRecord[] = (bookingsRes.data || []).map((b) => ({
    ...b,
    status: b.status || "pending",
  }));

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#0d1633]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-slate-950 shadow-md">
              H
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Hazil Admin Dashboard</h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Authorized Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Signed in: {user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span>View Portfolio</span>
              <span>↗</span>
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-6 sm:p-8 space-y-8">
        <AdminDashboardManager
          initialProjects={initialProjects}
          initialBookings={initialBookings}
        />
      </main>
    </div>
  );
}
