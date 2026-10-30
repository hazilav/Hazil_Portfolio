"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendCustomerMeetingConfirmedEmail } from "@/lib/email";

// Server-side admin authorization verification helper
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user || (adminEmail && user.email?.toLowerCase() !== adminEmail)) {
    throw new Error("Unauthorized: Access restricted to authorized administrator.");
  }

  return { user, supabase };
}

// 1. Sign out
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// 2. Fetch all projects
export async function getProjectsAction() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data || [];
}

// 3. Fetch all bookings (Admin only)
export async function getBookingsAction() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data || [];
}

// 4. Update booking status & send Customer Confirmation Email on "confirmed"
export async function updateBookingStatusAction(id: string, newStatus: string) {
  const { supabase } = await requireAdmin();

  if (!id) throw new Error("Booking ID is required.");
  if (!["pending", "confirmed", "cancelled"].includes(newStatus)) {
    throw new Error("Invalid booking status.");
  }

  // 1. Fetch current booking to check current status and customer email
  const { data: currentBooking, error: fetchErr } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !currentBooking) {
    throw new Error(`Booking not found: ${fetchErr?.message || "Unknown error"}`);
  }

  const wasAlreadyConfirmed = currentBooking.status === "confirmed";

  // 2. Update status in database
  const { error: updateErr } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", id);

  if (updateErr) {
    throw new Error(`Failed to update booking status in database: ${updateErr.message}`);
  }

  revalidatePath("/admin");

  // 3. If confirming and it was NOT already confirmed, dispatch confirmation email to customer
  let emailDispatched = false;
  let emailError: string | null = null;

  if (newStatus === "confirmed") {
    if (wasAlreadyConfirmed) {
      // Do not send duplicate confirmation emails
      return {
        success: true,
        alreadyConfirmed: true,
        message: "Booking was already confirmed. No duplicate email sent.",
      };
    }

    // Send customer confirmation email to customer's actual email stored in booking
    const emailResult = await sendCustomerMeetingConfirmedEmail({
      name: currentBooking.name,
      email: currentBooking.email,
      topic: currentBooking.topic,
      date: currentBooking.date,
      time: currentBooking.time,
      notes: currentBooking.notes || undefined,
    });

    if (emailResult.success) {
      emailDispatched = true;
    } else {
      emailError = emailResult.error || "Email delivery failed via Resend.";
    }
  }

  return {
    success: true,
    newStatus,
    emailDispatched,
    emailError,
    customerEmail: currentBooking.email,
  };
}

// 5. Create Project with Image Upload
export async function createProjectAction(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const longDescription = (formData.get("long_description") as string)?.trim();
  const toolsRaw = (formData.get("tools") as string)?.trim();
  const status = ((formData.get("status") as string)?.trim() || "published").toLowerCase();
  const accentIcon = (formData.get("accent_icon") as string)?.trim() || "💻";
  const imageFile = formData.get("image") as File | null;

  if (!title) throw new Error("Project title is required.");
  if (!category) throw new Error("Project category is required.");
  if (!description) throw new Error("Short description is required.");
  if (!["published", "draft"].includes(status)) {
    throw new Error("Invalid status. Must be 'published' or 'draft'.");
  }

  const tools = toolsRaw
    ? toolsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    if (!imageFile.type.startsWith("image/")) {
      throw new Error("Uploaded file must be a valid image (JPEG, PNG, WebP, etc.).");
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("Image file size exceeds the 5MB limit.");
    }

    const adminClient = createAdminClient();
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const sanitizedExt = fileExt.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;
    const filePath = `projects/${fileName}`;

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from("project-images")
      .upload(filePath, buffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = adminClient.storage
      .from("project-images")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { data, error: insertError } = await supabase
    .from("projects")
    .insert({
      title,
      category,
      description,
      long_description: longDescription || description,
      tools,
      status,
      accent_icon: accentIcon,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Database insert failed: ${insertError.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, project: data };
}

// 6. Update Project with Optional New Image Upload
export async function updateProjectAction(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  if (!id) throw new Error("Project ID is required.");

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const longDescription = (formData.get("long_description") as string)?.trim();
  const toolsRaw = (formData.get("tools") as string)?.trim();
  const status = ((formData.get("status") as string)?.trim() || "published").toLowerCase();
  const accentIcon = (formData.get("accent_icon") as string)?.trim() || "💻";
  const imageFile = formData.get("image") as File | null;
  const existingImageUrl = (formData.get("existing_image_url") as string)?.trim() || null;

  if (!title) throw new Error("Project title is required.");
  if (!category) throw new Error("Project category is required.");
  if (!description) throw new Error("Short description is required.");
  if (!["published", "draft"].includes(status)) {
    throw new Error("Invalid status. Must be 'published' or 'draft'.");
  }

  const tools = toolsRaw
    ? toolsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  let imageUrl = existingImageUrl;

  if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
    if (!imageFile.type.startsWith("image/")) {
      throw new Error("Uploaded file must be a valid image.");
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("Image file size exceeds the 5MB limit.");
    }

    const adminClient = createAdminClient();
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const sanitizedExt = fileExt.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;
    const filePath = `projects/${fileName}`;

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from("project-images")
      .upload(filePath, buffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = adminClient.storage
      .from("project-images")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { data, error: updateError } = await supabase
    .from("projects")
    .update({
      title,
      category,
      description,
      long_description: longDescription || description,
      tools,
      status,
      accent_icon: accentIcon,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Database update failed: ${updateError.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, project: data };
}

// 7. Delete Project
export async function deleteProjectAction(id: string) {
  const { supabase } = await requireAdmin();

  if (!id) throw new Error("Project ID is required.");

  const { data: project } = await supabase
    .from("projects")
    .select("image_url")
    .eq("id", id)
    .single();

  if (project?.image_url && project.image_url.includes("project-images")) {
    try {
      const adminClient = createAdminClient();
      const parts = project.image_url.split("project-images/");
      if (parts[1]) {
        await adminClient.storage.from("project-images").remove([parts[1]]);
      }
    } catch {
      // Ignore cleanup error to proceed
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(`Database delete failed: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
