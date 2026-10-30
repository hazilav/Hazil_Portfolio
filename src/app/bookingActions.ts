"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendBookingEmails } from "@/lib/email";

interface BookingInput {
  name: string;
  email: string;
  topic: string;
  date: string;
  time: string;
  notes?: string;
}

export interface BookingActionResult {
  success: boolean;
  bookingId?: string;
  message?: string;
  error?: string;
}

export async function createBookingAction(data: BookingInput): Promise<BookingActionResult> {
  try {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const topic = data.topic?.trim();
    const date = data.date?.trim();
    const time = data.time?.trim();
    const notes = data.notes?.trim() || "";

    // 1. Server-side validation (return friendly errors, never throw raw unhandled exceptions)
    if (!name || name.length < 2) {
      return { success: false, error: "Full name must be at least 2 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!topic) {
      return { success: false, error: "Please select a meeting topic or agenda." };
    }

    if (!date) {
      return { success: false, error: "Please select a preferred meeting date." };
    }

    // 2. Prevent selecting past dates (server validation using YYYY-MM-DD comparison)
    const todayUTC = new Date().toISOString().split("T")[0];
    if (date < todayUTC) {
      return {
        success: false,
        error: "Selected meeting date cannot be in the past. Please select an upcoming date.",
      };
    }

    if (!time) {
      return { success: false, error: "Please select a preferred time slot." };
    }

    // 3. Save to Supabase securely using server-side admin client
    let adminSupabase;
    try {
      adminSupabase = createAdminClient();
    } catch (clientErr: unknown) {
      const err = clientErr as Error;
      console.error("[Booking Action] Failed to initialize Supabase admin client:", err.message);
      return {
        success: false,
        error: "Server configuration issue connecting to database. Please try again shortly.",
      };
    }

    const { data: booking, error: insertError } = await adminSupabase
      .from("bookings")
      .insert({
        name,
        email,
        topic,
        date,
        time,
        notes,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Booking Action] Database insert error:", insertError.message);
      return {
        success: false,
        error: `Database error saving booking: ${insertError.message}`,
      };
    }

    // 4. Send email notifications via Resend (confirmation to visitor & notification to admin)
    // Wrapped defensively so email issues never block or crash a successful database booking
    try {
      await sendBookingEmails({
        name,
        email,
        topic,
        date,
        time,
        notes,
      });
    } catch (emailErr: unknown) {
      const err = emailErr as Error;
      console.warn("[Booking Action] Email dispatch notice:", err.message);
    }

    return {
      success: true,
      bookingId: booking.id,
      message: "Meeting request received and confirmed! An email notification has been dispatched.",
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Booking Action] Unexpected exception:", error.message);
    return {
      success: false,
      error: error.message || "An unexpected error occurred while processing your booking.",
    };
  }
}
