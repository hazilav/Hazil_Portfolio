"use server";

import { revalidatePath } from "next/cache";
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

export async function createBookingAction(data: BookingInput) {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const topic = data.topic?.trim();
  const date = data.date?.trim();
  const time = data.time?.trim();
  const notes = data.notes?.trim() || "";

  // 1. Server-side validation
  if (!name || name.length < 2) {
    throw new Error("Full name must be at least 2 characters.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error("Please provide a valid email address.");
  }

  if (!topic) {
    throw new Error("Please select a meeting topic or agenda.");
  }

  if (!date) {
    throw new Error("Please select a preferred meeting date.");
  }

  // 2. Prevent selecting past dates (server validation)
  const selectedDate = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  if (selectedDate < today) {
    throw new Error("Selected meeting date cannot be in the past. Please select an upcoming date.");
  }

  if (!time) {
    throw new Error("Please select a preferred time slot.");
  }

  // 3. Save to Supabase securely using server-side admin client
  // (Guarantees insertion succeeds on the server while bookings remain private from public visitors)
  const adminSupabase = createAdminClient();

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
    throw new Error(`Database error: ${insertError.message}`);
  }

  // 4. Send email notifications via Resend (confirmation to visitor & notification to admin)
  await sendBookingEmails({
    name,
    email,
    topic,
    date,
    time,
    notes,
  });

  revalidatePath("/admin");

  return {
    success: true,
    bookingId: booking.id,
    message: "Meeting request received and confirmed! An email notification has been dispatched.",
  };
}
