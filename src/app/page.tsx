"use client";

import React, { useState } from "react";
import ProjectsSection from "./ProjectsSection";
import MeetingBookingSection from "./MeetingBookingSection";

export default function HomePage() {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state & validation
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Contact form validation handler
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!contactData.name.trim()) {
      errors.name = "Please enter your full name.";
    }
    if (!contactData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      errors.email = "Please provide a valid email format (e.g. name@domain.com).";
    }
    if (!contactData.subject.trim()) {
      errors.subject = "Please enter a subject.";
    }
    if (!contactData.message.trim()) {
      errors.message = "Please write a message.";
    } else if (contactData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long.";
    }

    setContactErrors(errors);

    if (Object.keys(errors).length === 0) {
      setContactSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* =========================================================================
          NAVIGATION BAR
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b132b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#hero" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              H
            </span>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Hazil
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Digital Marketer & Web Designer
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-emerald-400 transition-colors">
              About
            </a>
            <a href="#skills" className="hover:text-emerald-400 transition-colors">
              Skills
            </a>
            <a href="#projects" className="hover:text-emerald-400 transition-colors">
              Projects
            </a>
            <a href="#booking" className="hover:text-emerald-400 transition-colors">
              Book Meeting
            </a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Call to action & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <a
              href="#booking"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              Schedule Call
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0d1633] px-6 py-4 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 hover:text-emerald-400 py-1"
            >
              About
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 hover:text-emerald-400 py-1"
            >
              Skills
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 hover:text-emerald-400 py-1"
            >
              Projects
            </a>
            <a
              href="#booking"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 hover:text-emerald-400 py-1"
            >
              Book Meeting
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-200 hover:text-emerald-400 py-1"
            >
              Contact
            </a>
            <a
              href="#booking"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center mt-2 rounded-lg bg-emerald-500 py-2 font-medium text-slate-950"
            >
              Schedule Call
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* =========================================================================
            HERO SECTION
           ========================================================================= */}
        <section
          id="hero"
          className="relative overflow-hidden py-20 lg:py-28 px-6 border-b border-slate-800/60"
        >
          {/* Subtle background glow effect */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline and Overview */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Available for Projects & Collaboration
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Hi, I’m <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Hazil</span>.
                  <br />
                  Digital Marketer & Web Designer.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  I craft clean, responsive WordPress and modern web designs paired with solid SEO foundations, engaging content creation, and targeted Meta Ads to help businesses establish a credible digital presence.
                </p>

                {/* Key Skills Badges */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
                  {[
                    "WordPress & Elementor",
                    "Modern Web Design",
                    "On-Page SEO",
                    "Content Strategy",
                    "Basic Meta Ads",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Call-to-actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <a
                    href="#projects"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <span>View Projects</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                  <a
                    href="#booking"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700/80 hover:border-slate-600 transition-all active:scale-95"
                  >
                    <span>Book a Meeting</span>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Profile Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-gradient-to-b from-[#132047] to-[#0d1633] p-6 shadow-2xl relative">
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 flex items-center justify-center text-2xl font-bold text-slate-950 shadow-md">
                      H
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Hazil</h2>
                      <p className="text-xs text-emerald-400 font-medium">Digital Marketing & Web Design</p>
                      <p className="text-xs text-slate-400 mt-0.5">Kerala, India • Remote Ready</p>
                    </div>
                  </div>

                  <div className="py-5 space-y-4 text-sm text-slate-300">
                    <div className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Focused on functional, clean web design that loads fast and looks professional on all devices.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Structured on-page SEO so search engines clearly index your content and offerings.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Tailored WordPress & Elementor builds with easy-to-manage client editing workflows.</span>
                    </div>
                  </div>

                  <div className="mt-2 rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Response turnaround:</span>
                    <span className="font-semibold text-emerald-400">Within 24 Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            ABOUT & SKILLS SECTION
           ========================================================================= */}
        <section id="about" className="py-20 px-6 border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Background & Expertise
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Crafting Websites With Strategic Purpose
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                As a digital marketer and web designer, I bridge the gap between aesthetics and function. I ensure websites not only look attractive, but are also structured for organic search visibility and clear user navigation.
              </p>
            </div>

            <div id="skills" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl border border-slate-800 bg-[#101b3b]/60 p-6 hover:border-emerald-500/40 transition-colors space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
                  🌐
                </div>
                <h3 className="text-lg font-semibold text-white">Website Design</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Mobile-responsive website design using modern UI principles, clean layout hierarchy, and user-centric styling.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Responsive UI</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Wireframing</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">HTML/CSS</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#101b3b]/60 p-6 hover:border-emerald-500/40 transition-colors space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
                  ⚡
                </div>
                <h3 className="text-lg font-semibold text-white">WordPress / Elementor</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Building flexible, easily editable WordPress sites using Elementor, customized themes, and reliable plugin ecosystems.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Elementor Pro</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Custom Layouts</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Site Setup</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#101b3b]/60 p-6 hover:border-emerald-500/40 transition-colors space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
                  🔍
                </div>
                <h3 className="text-lg font-semibold text-white">Search Engine Optimization</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Implementing foundational on-page SEO, keyword targeting, metadata standards, and website technical hygiene.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">On-Page SEO</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Keyword Research</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Metadata</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#101b3b]/60 p-6 hover:border-emerald-500/40 transition-colors space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
                  📣
                </div>
                <h3 className="text-lg font-semibold text-white">Content & Basic Meta Ads</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Writing purposeful marketing copy and setting up fundamental paid social campaigns across Facebook and Instagram.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Web Copywriting</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Meta Ads</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">Audience Targeting</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROJECTS SECTION (DYNAMICALLY SYNCED WITH SUPABASE)
           ========================================================================= */}
        <ProjectsSection />

        {/* =========================================================================
            MEETING BOOKING SECTION (CONNECTED TO DATABASE & EMAILS)
           ========================================================================= */}
        <MeetingBookingSection />

        {/* =========================================================================
            CONTACT SECTION
           ========================================================================= */}
        <section id="contact" className="py-20 px-6 border-b border-slate-800/60 bg-[#090f24]">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Let&rsquo;s Connect & Discuss Your Goals
              </h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Have a project question, an internship opportunity, or an idea to discuss? Send a direct message below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl">
                      ✉️
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Direct Email</h4>
                      <p className="text-xs text-slate-400">Feel free to email directly</p>
                      <a
                        href="mailto:muhammedhazilav@gmail.com"
                        className="text-sm text-emerald-400 hover:underline mt-1 inline-block"
                      >
                        muhammedhazilav@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl">
                      📍
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Location & Availability</h4>
                      <p className="text-xs text-slate-400">Kerala, India</p>
                      <p className="text-sm text-slate-300 mt-1">Available for Remote Opportunities & Freelance</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-6 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Core Focus Areas
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">●</span>
                      <span>WordPress & Elementor Site Design</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">●</span>
                      <span>On-Page Search Engine Optimization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">●</span>
                      <span>Web Copywriting & Content Creation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">●</span>
                      <span>Meta Ads Setup & Basic Lead Funnels</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-6 sm:p-8 shadow-xl">
                  {contactSubmitted ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto">
                        ✓
                      </div>
                      <h3 className="text-xl font-bold text-white">Message Form Validated!</h3>
                      <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                        Thank you, <span className="font-semibold text-white">{contactData.name}</span>. Your message has passed client-side validation.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactData({ name: "", email: "", subject: "", message: "" });
                        }}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} noValidate className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            id="contact-name"
                            value={contactData.name}
                            onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                            placeholder="Your Name"
                            className={`w-full rounded-xl border ${
                              contactErrors.name ? "border-rose-500" : "border-slate-700"
                            } bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                          />
                          {contactErrors.name && (
                            <p className="mt-1 text-xs text-rose-400">{contactErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Email <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="email"
                            id="contact-email"
                            value={contactData.email}
                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                            placeholder="your.email@example.com"
                            className={`w-full rounded-xl border ${
                              contactErrors.email ? "border-rose-500" : "border-slate-700"
                            } bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                          />
                          {contactErrors.email && (
                            <p className="mt-1 text-xs text-rose-400">{contactErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Subject <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="contact-subject"
                          value={contactData.subject}
                          onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                          placeholder="Website Redesign Inquiry / Internship Project"
                          className={`w-full rounded-xl border ${
                            contactErrors.subject ? "border-rose-500" : "border-slate-700"
                          } bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                        />
                        {contactErrors.subject && (
                          <p className="mt-1 text-xs text-rose-400">{contactErrors.subject}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Message <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          rows={4}
                          value={contactData.message}
                          onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                          placeholder="Write your message here..."
                          className={`w-full rounded-xl border ${
                            contactErrors.message ? "border-rose-500" : "border-slate-700"
                          } bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                        />
                        {contactErrors.message && (
                          <p className="mt-1 text-xs text-rose-400">{contactErrors.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
                      >
                        <span>Send Message</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          FOOTER
         ========================================================================= */}
      <footer className="border-t border-slate-800 bg-[#080d1f] py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-slate-950">
              H
            </span>
            <span className="font-semibold text-slate-200">Hazil</span>
            <span>• Digital Marketer & Web Designer</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-emerald-400 transition-colors">
              Back to Top ↑
            </a>
            <span className="text-slate-600">|</span>
            <a href="/admin" className="text-slate-400 hover:text-emerald-400 transition-colors">
              Admin Portal →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
