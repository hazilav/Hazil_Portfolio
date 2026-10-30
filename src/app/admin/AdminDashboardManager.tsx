"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  updateBookingStatusAction,
} from "./actions";
import type { ProjectRecord, BookingRecord } from "./page";

interface Props {
  initialProjects: ProjectRecord[];
  initialBookings: BookingRecord[];
}

export default function AdminDashboardManager({
  initialProjects,
  initialBookings,
}: Props) {
  const [activeTab, setActiveTab] = useState<"projects" | "bookings">("projects");
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);
  const [isPending, startTransition] = useTransition();

  // Project Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  // Project Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Design & WordPress");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [tools, setTools] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [accentIcon, setAccentIcon] = useState("💻");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Open Create Project Modal
  const handleOpenCreate = () => {
    setEditingProject(null);
    setTitle("");
    setCategory("Web Design & WordPress");
    setDescription("");
    setLongDescription("");
    setTools("");
    setStatus("published");
    setAccentIcon("💻");
    setSelectedFile(null);
    setPreviewUrl(null);
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Open Edit Project Modal
  const handleOpenEdit = (project: ProjectRecord) => {
    setEditingProject(project);
    setTitle(project.title);
    setCategory(project.category);
    setDescription(project.description);
    setLongDescription(project.long_description || "");
    setTools(project.tools?.join(", ") || "");
    setStatus(project.status || "published");
    setAccentIcon(project.accent_icon || "💻");
    setSelectedFile(null);
    setPreviewUrl(project.image_url || null);
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFeedback({ type: "error", message: "Selected file must be an image." });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit Project Form
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ type: "error", message: "Project title is required." });
      return;
    }
    if (!description.trim()) {
      setFeedback({ type: "error", message: "Short description is required." });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("long_description", longDescription);
    formData.append("tools", tools);
    formData.append("status", status);
    formData.append("accent_icon", accentIcon);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    if (editingProject?.image_url) {
      formData.append("existing_image_url", editingProject.image_url);
    }

    startTransition(async () => {
      try {
        if (editingProject) {
          const res = await updateProjectAction(editingProject.id, formData);
          setProjects((prev) =>
            prev.map((p) => (p.id === editingProject.id ? (res.project as ProjectRecord) : p))
          );
          setFeedback({ type: "success", message: `Updated "${title}" successfully!` });
        } else {
          const res = await createProjectAction(formData);
          setProjects((prev) => [res.project as ProjectRecord, ...prev]);
          setFeedback({ type: "success", message: `Created "${title}" successfully!` });
        }
        setIsModalOpen(false);
      } catch (err: unknown) {
        const error = err as Error;
        setFeedback({ type: "error", message: error.message || "Operation failed." });
      }
    });
  };

  // Delete Project with Confirmation
  const handleDeleteProject = async (id: string, projectTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${projectTitle}" from Supabase?`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteProjectAction(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setFeedback({ type: "success", message: `Deleted "${projectTitle}".` });
      } catch (err: unknown) {
        const error = err as Error;
        setFeedback({ type: "error", message: error.message || "Failed to delete project." });
      }
    });
  };

  // Update Booking Status & Handle Customer Confirmation Email Feedback
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    startTransition(async () => {
      try {
        const res = await updateBookingStatusAction(id, newStatus);

        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );

        if (newStatus === "confirmed") {
          if (res.alreadyConfirmed) {
            setFeedback({
              type: "warning",
              message: "Booking was already confirmed. No duplicate email sent.",
            });
          } else if (res.emailDispatched) {
            setFeedback({
              type: "success",
              message: `Booking confirmed successfully! Confirmation email dispatched to ${res.customerEmail}.`,
            });
          } else {
            setFeedback({
              type: "error",
              message: `Booking confirmed in database, but customer email could not be sent: ${res.emailError}`,
            });
          }
        } else {
          setFeedback({
            type: "success",
            message: `Updated booking status to "${newStatus}".`,
          });
        }
      } catch (err: unknown) {
        const error = err as Error;
        setFeedback({
          type: "error",
          message: error.message || "Failed to update booking status.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`pb-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "projects"
                ? "border-b-2 border-emerald-400 text-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Projects ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`pb-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "bookings"
                ? "border-b-2 border-emerald-400 text-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Meeting Bookings ({bookings.length})</span>
          </button>
        </div>

        {activeTab === "projects" && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>+ Add New Project</span>
          </button>
        )}
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : feedback.type === "warning"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold px-2 py-0.5 rounded hover:bg-black/20 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: PROJECTS
         ========================================================================= */}
      {activeTab === "projects" && (
        <>
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-12 text-center space-y-4 shadow-xl">
              <span className="text-4xl">📁</span>
              <h3 className="text-lg font-bold text-white">No projects found in Supabase</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click &ldquo;+ Add New Project&rdquo; to add your first project case study with image upload and published/draft toggle.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111d3d] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1736] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Image / Icon</th>
                    <th className="px-6 py-4">Title & Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 w-28">
                        {p.image_url ? (
                          <div className="relative h-14 w-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                            <Image
                              src={p.image_url}
                              alt={p.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-20 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-2xl">
                            {p.accent_icon || "💻"}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-sm">
                        <p className="font-bold text-white text-sm">{p.title}</p>
                        <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">{p.description}</p>
                        {p.tools && p.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {p.tools.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        <span className="font-medium">{p.category}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            p.status === "published"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.status === "published" ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                          />
                          {p.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: BOOKINGS
         ========================================================================= */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Meeting Inquiries ({bookings.length})</h3>
            <p className="text-xs text-slate-400">
              When you select &ldquo;Confirmed&rdquo;, an official confirmation email is automatically sent to the customer with meeting details.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-12 text-center space-y-3 shadow-xl">
              <span className="text-4xl">📅</span>
              <h4 className="text-base font-bold text-white">No bookings yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When a visitor fills in the Meeting Booking section on your portfolio, their request will be securely recorded here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#111d3d] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1736] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Topic / Service</th>
                    <th className="px-6 py-4">Requested Slot</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{b.name}</p>
                        <a
                          href={`mailto:${b.email}`}
                          className="text-emerald-400 hover:underline text-[11px]"
                        >
                          {b.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-200 font-medium">{b.topic}</p>
                        {b.notes && (
                          <p className="text-slate-400 text-[11px] mt-0.5 max-w-xs italic line-clamp-2">
                            &ldquo;{b.notes}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-200">{b.date}</p>
                        <p className="text-[11px] text-slate-400">{b.time}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            b.status === "confirmed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : b.status === "cancelled"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          disabled={isPending}
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed (Dispatches Email)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT PROJECT
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0d1633] shadow-2xl p-6 sm:p-8 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4" noValidate>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Project Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern WordPress Business Site"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Web Design & WordPress">Web Design & WordPress</option>
                    <option value="Organic SEO & Strategy">Organic SEO & Strategy</option>
                    <option value="Content Strategy">Content Strategy</option>
                    <option value="Paid Social & Funnel">Paid Social & Funnel</option>
                    <option value="General Digital Marketing">General Digital Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Publication Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Hidden from site)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Accent Emoji Icon
                </label>
                <input
                  type="text"
                  value={accentIcon}
                  onChange={(e) => setAccentIcon(e.target.value)}
                  placeholder="💻"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Short Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="1-2 sentences summarizing the project for the portfolio card..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Detailed Case Breakdown (Optional)
                </label>
                <textarea
                  rows={3}
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Full background, client challenge, and technical approach..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tools Used (Comma separated)
                </label>
                <input
                  type="text"
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="WordPress, Elementor, Custom CSS, Yoast SEO"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  Project Photo / Mockup (Uploads to Supabase Storage: &lsquo;project-images&rsquo;)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                />
                {previewUrl && (
                  <div className="mt-3 flex items-center gap-3 p-2 rounded-xl border border-slate-800 bg-slate-900">
                    <div className="relative h-12 w-16 rounded overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {selectedFile ? "New file ready for upload" : "Current image from storage"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Saving to Supabase..." : editingProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
