"use client";

import React, { useState, useTransition } from "react";
import { createBookingAction } from "./bookingActions";

export default function MeetingBookingSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "Custom Website Design (WordPress/Elementor)",
    date: "",
    time: "10:00 AM",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Compute minimum date string (YYYY-MM-DD) so browsers prevent past date selection
  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setServerError(null);

    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email format (e.g. name@domain.com).";
    }

    if (!formData.date) {
      errors.date = "Please select a preferred meeting date.";
    } else if (formData.date < todayStr) {
      errors.date = "Meeting date cannot be in the past.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        await createBookingAction(formData);
        setIsSuccess(true);
      } catch (err: unknown) {
        const error = err as Error;
        setServerError(error.message || "Failed to submit booking request. Please try again.");
      }
    });
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFormData({
      name: "",
      email: "",
      topic: "Custom Website Design (WordPress/Elementor)",
      date: "",
      time: "10:00 AM",
      notes: "",
    });
    setFormErrors({});
    setServerError(null);
  };

  return (
    <section id="booking" className="py-20 px-6 border-b border-slate-800/60">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            1-on-1 Consultation
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Schedule a Project Meeting
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Need a new WordPress site, an SEO audit, or a marketing strategy discussion? Pick a convenient time and submit your details.
          </p>

          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 font-medium">
            <span>🔒 Connected to Live Database • Server-Side Validated</span>
          </div>
        </div>

        {/* Booking Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#111d3d] p-6 sm:p-10 shadow-xl">
          {serverError && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5">
              <span className="font-bold text-sm">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/10">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-white">Meeting Request Confirmed!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-white">{formData.name}</span>! Your meeting request regarding &ldquo;<span className="text-slate-200">{formData.topic}</span>&rdquo; for <span className="text-emerald-400 font-medium">{formData.date}</span> at <span className="text-emerald-400 font-medium">{formData.time}</span> has been saved to the database.
              </p>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 max-w-md mx-auto text-xs text-slate-300 text-left space-y-1">
                <p>
                  <strong>Confirmation email:</strong> Dispatched to <span className="text-emerald-400">{formData.email}</span>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Note: A meeting invitation with the Google Meet / Zoom link will follow shortly after schedule confirmation.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-colors mt-4 cursor-pointer"
              >
                Book Another Slot
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="booking-name"
                    disabled={isPending}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Muhammed Hazil"
                    className={`w-full rounded-xl border ${
                      formErrors.name ? "border-rose-500" : "border-slate-700"
                    } bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50`}
                  />
                  {formErrors.name && (
                    <p className="mt-1.5 text-xs text-rose-400">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="booking-email"
                    disabled={isPending}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl border ${
                      formErrors.email ? "border-rose-500" : "border-slate-700"
                    } bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50`}
                  />
                  {formErrors.email && (
                    <p className="mt-1.5 text-xs text-rose-400">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Topic / Meeting Agenda */}
              <div>
                <label
                  htmlFor="booking-topic"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                >
                  Meeting Topic / Service <span className="text-rose-400">*</span>
                </label>
                <select
                  id="booking-topic"
                  disabled={isPending}
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="Custom Website Design (WordPress/Elementor)">Custom Website Design (WordPress/Elementor)</option>
                  <option value="SEO Audit & Content Architecture">SEO Audit & Content Architecture</option>
                  <option value="Content Creation & Copywriting Plan">Content Creation & Copywriting Plan</option>
                  <option value="Basic Meta Ads Campaign Setup">Basic Meta Ads Campaign Setup</option>
                  <option value="General Consultation & Inquiries">General Consultation & Inquiries</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Preferred Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    id="booking-date"
                    min={todayStr}
                    disabled={isPending}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full rounded-xl border ${
                      formErrors.date ? "border-rose-500" : "border-slate-700"
                    } bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50`}
                  />
                  {formErrors.date && (
                    <p className="mt-1.5 text-xs text-rose-400">{formErrors.date}</p>
                  )}
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label
                    htmlFor="booking-time"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Preferred Time Slot <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="booking-time"
                    disabled={isPending}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    <option value="10:00 AM">10:00 AM (IST)</option>
                    <option value="11:30 AM">11:30 AM (IST)</option>
                    <option value="02:00 PM">02:00 PM (IST)</option>
                    <option value="04:30 PM">04:30 PM (IST)</option>
                    <option value="06:00 PM">06:00 PM (IST)</option>
                  </select>
                </div>
              </div>

              {/* Notes / Agenda Details */}
              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                >
                  Brief Project Summary / Meeting Agenda (Optional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={3}
                  disabled={isPending}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Share a short note on what you would like to discuss during our session..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving Booking Request...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Schedule Meeting</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
