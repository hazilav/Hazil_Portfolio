"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export interface ProjectDisplay {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  tools: string[];
  imageUrl?: string | null;
  accentIcon: string;
  badgeColor?: string;
  previewGradient?: string;
}

// Fallback initial projects if DB is empty
const FALLBACK_PROJECTS: ProjectDisplay[] = [
  {
    id: "wordpress-business-site",
    title: "Modern Business Website",
    category: "Web Design & WordPress",
    description:
      "A fully responsive corporate website crafted with WordPress and Elementor, structured for high user engagement and rapid load times.",
    longDescription:
      "Designed from wireframe to deployment using WordPress and Elementor Pro. Focused on mobile responsiveness, clean layout hierarchy, intuitive navigation, and strategic call-to-action placement to help visitors easily discover services and get in touch.",
    tools: ["WordPress", "Elementor", "Responsive UI", "Custom CSS"],
    accentIcon: "💻",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    previewGradient: "from-slate-900 via-indigo-950 to-emerald-950",
  },
  {
    id: "seo-site-optimization",
    title: "Search Engine Optimization Audit",
    category: "Organic SEO & Strategy",
    description:
      "In-depth on-page and technical SEO restructuring to enhance search visibility, correct indexing issues, and establish keyword topical authority.",
    longDescription:
      "Conducted a comprehensive website SEO evaluation covering meta hierarchy, semantic heading structure, URL structure, keyword alignment, image alt tags, and internal linking paths. Structured the content to align with search intent and best SEO practices.",
    tools: ["SEO Audit", "Keyword Research", "On-Page SEO", "Search Console"],
    accentIcon: "📈",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    previewGradient: "from-slate-900 via-slate-800 to-teal-950",
  },
  {
    id: "content-strategy-writing",
    title: "Content Creation & Brand Messaging",
    category: "Content Strategy",
    description:
      "Search-optimized copywriting and content strategy aimed at clearly communicating brand value and educating target audiences.",
    longDescription:
      "Developed an audience-focused content plan featuring high-intent website copy, service breakdown pages, and informative articles. Centered around concise messaging, reader-friendly formatting, and natural integration of primary search phrases.",
    tools: ["Content Writing", "Keyword Strategy", "Brand Voice", "Copywriting"],
    accentIcon: "✍️",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    previewGradient: "from-slate-900 via-slate-850 to-cyan-950",
  },
  {
    id: "meta-ads-local-campaign",
    title: "Meta Ads Starter Campaign & Funnel",
    category: "Paid Social & Funnel",
    description:
      "Structured advertising campaign setup for Facebook and Instagram with targeted audiences, engaging creatives, and lead-focused landing flows.",
    longDescription:
      "Configured campaign architecture for Meta Ads (Facebook/Instagram), focusing on specific demographic and interest targeting. Designed ad creative copy variants paired with a dedicated web landing section to track and convert inbound interest.",
    tools: ["Meta Ads", "Audience Targeting", "Ad Creative", "Conversion Flow"],
    accentIcon: "🎯",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    previewGradient: "from-slate-900 via-emerald-950 to-slate-900",
  },
];

interface Props {
  initialProjects?: ProjectDisplay[];
}

export default function ProjectsSection({ initialProjects }: Props) {
  const [projects, setProjects] = useState<ProjectDisplay[]>(initialProjects || []);
  const [loading, setLoading] = useState(!initialProjects || initialProjects.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectDisplay | null>(null);

  // Fetch published projects dynamically from Supabase
  useEffect(() => {
    async function loadPublishedProjects() {
      try {
        const supabase = createClient();
        const { data, error: fetchErr } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (fetchErr) {
          throw new Error(fetchErr.message);
        }

        if (data && data.length > 0) {
          const mapped: ProjectDisplay[] = data.map((item, index) => {
            const gradients = [
              "from-slate-900 via-indigo-950 to-emerald-950",
              "from-slate-900 via-slate-800 to-teal-950",
              "from-slate-900 via-slate-850 to-cyan-950",
              "from-slate-900 via-emerald-950 to-slate-900",
            ];
            const badges = [
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              "bg-teal-500/10 text-teal-400 border-teal-500/20",
              "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            ];

            return {
              id: item.id,
              title: item.title,
              category: item.category,
              description: item.description,
              longDescription: item.long_description || item.description,
              tools: item.tools || [],
              imageUrl: item.image_url,
              accentIcon: item.accent_icon || "💻",
              badgeColor: badges[index % badges.length],
              previewGradient: gradients[index % gradients.length],
            };
          });
          setProjects(mapped);
        } else {
          // If no projects in Supabase yet, show default showcase
          setProjects(FALLBACK_PROJECTS);
        }
      } catch (err: unknown) {
        const e = err as Error;
        console.error("Error loading projects from Supabase:", e.message);
        setError("Unable to sync live projects from database. Showing default showcase.");
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setLoading(false);
      }
    }

    loadPublishedProjects();
  }, []);

  return (
    <section id="projects" className="py-20 px-6 border-b border-slate-800/60 bg-[#090f24]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Portfolio Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Featured Work & Case Highlights
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Click on any project card or preview thumbnail to inspect the full project details, design approach, and tools used.
          </p>
          {error && (
            <p className="text-xs text-amber-400/80 bg-amber-500/10 py-1 px-3 rounded-full inline-block">
              {error}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-xs text-slate-400">Loading published projects from Supabase...</p>
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-slate-800 bg-[#111d3d] overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg"
              >
                {/* Clickable Mockup Preview Area */}
                <div
                  onClick={() => setActiveProject(project)}
                  className={`h-56 w-full ${
                    project.imageUrl
                      ? "bg-slate-900"
                      : `bg-gradient-to-br ${project.previewGradient || "from-slate-900 via-indigo-950 to-emerald-950"}`
                  } p-6 flex flex-col justify-between cursor-pointer relative overflow-hidden group-hover:opacity-95 transition-opacity border-b border-slate-800/80`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveProject(project);
                    }
                  }}
                  aria-label={`Open preview modal for ${project.title}`}
                >
                  {/* If custom image uploaded to Supabase Storage, render image with gradient overlay */}
                  {project.imageUrl ? (
                    <>
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b]/95 via-black/40 to-black/60 pointer-events-none" />
                    </>
                  ) : null}

                  {/* Decorative browser mockup bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[11px] text-slate-300 font-mono bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* Mockup center artwork */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                    {!project.imageUrl && (
                      <span className="text-4xl mb-2 filter drop-shadow">{project.accentIcon}</span>
                    )}
                    <h4 className="text-lg font-bold text-white tracking-wide drop-shadow-md">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-200 mt-1 max-w-xs line-clamp-1 drop-shadow-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Click prompt overlay */}
                  <div className="relative z-10 flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span className="inline-flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      🔍 Click thumbnail to preview
                    </span>
                    <span className="text-slate-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Case details →
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          project.badgeColor || "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {project.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tools badges & action button */}
                  <div className="pt-4 border-t border-slate-800/60 space-y-4">
                    {project.tools && project.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tools.map((tool) => (
                          <span
                            key={tool}
                            className="text-xs font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveProject(project)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all border border-slate-700/60 cursor-pointer"
                    >
                      <span>View Project Breakdown & Preview</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          PROJECT IMAGE PREVIEW MODAL / LIGHTBOX
         ========================================================================= */}
      {activeProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0d1633] shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#111d3d]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeProject.accentIcon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeProject.title}</h3>
                  <p className="text-xs text-emerald-400 font-medium">{activeProject.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Visual Mockup Area / Actual Uploaded Photo */}
            <div
              className={`w-full h-72 ${
                activeProject.imageUrl
                  ? "bg-slate-900"
                  : `bg-gradient-to-br ${activeProject.previewGradient || "from-slate-900 via-indigo-950 to-emerald-950"}`
              } p-6 flex flex-col justify-between border-b border-slate-800 relative overflow-hidden`}
            >
              {activeProject.imageUrl ? (
                <>
                  <Image
                    src={activeProject.imageUrl}
                    alt={activeProject.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1633] via-transparent to-black/60 pointer-events-none" />
                </>
              ) : null}

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-200 bg-black/60 px-3 py-1 rounded-md border border-white/10 backdrop-blur-sm">
                  {activeProject.imageUrl ? "Uploaded Case Photo" : "Detailed Preview"}
                </span>
              </div>

              {!activeProject.imageUrl && (
                <div className="relative z-10 text-center my-auto">
                  <span className="text-5xl">{activeProject.accentIcon}</span>
                  <h4 className="text-xl font-extrabold text-white mt-2">{activeProject.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">{activeProject.category}</p>
                </div>
              )}

              {activeProject.tools && activeProject.tools.length > 0 && (
                <div className="relative z-10 flex flex-wrap gap-2 justify-center">
                  {activeProject.tools.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-md bg-black/60 text-emerald-300 font-medium backdrop-blur-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body Info */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Project Overview
                </h4>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  {activeProject.longDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
