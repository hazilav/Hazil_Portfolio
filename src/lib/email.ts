import { Resend } from "resend";

interface BookingEmailParams {
  name: string;
  email: string;
  topic: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CustomerConfirmationEmailParams {
  name: string;
  email: string;
  topic: string;
  date: string;
  time: string;
  notes?: string;
  meetingLink?: string;
}

// 1. Initial Booking Emails (Notification to Admin + Acknowledgment)
export async function sendBookingEmails({
  name,
  email,
  topic,
  date,
  time,
  notes,
}: BookingEmailParams) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "muhammedhazilav@gmail.com";

  if (!apiKey) {
    console.warn("[Resend] Notice: RESEND_API_KEY is not configured.");
    return { success: false, reason: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const results: {
    adminEmail?: { id?: string; error?: string };
    visitorEmail?: { id?: string; error?: string };
  } = {};

  // Admin Notification Email
  try {
    const adminRes = await resend.emails.send({
      from: "Portfolio Bookings <onboarding@resend.dev>",
      to: adminEmail,
      subject: `🔔 New Meeting Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Meeting Request Logged</h2>
          <p>A new visitor has submitted a consultation request on your portfolio website:</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Visitor Name:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Visitor Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0 0 8px;"><strong>Topic / Service:</strong> ${topic}</p>
            <p style="margin: 0 0 8px;"><strong>Requested Date:</strong> ${date}</p>
            <p style="margin: 0 0 8px;"><strong>Requested Time:</strong> ${time}</p>
            ${notes ? `<p style="margin: 0;"><strong>Project Notes:</strong> ${notes}</p>` : ""}
          </div>

          <p><a href="http://localhost:3000/admin" style="background-color: #0f172a; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; display: inline-block;">Open Admin Dashboard</a></p>
        </div>
      `,
    });

    if (adminRes.error) {
      results.adminEmail = { error: adminRes.error.message };
    } else {
      results.adminEmail = { id: adminRes.data?.id };
    }
  } catch (err: unknown) {
    const error = err as Error;
    results.adminEmail = { error: error.message };
  }

  // Visitor Acknowledgment Email
  try {
    const visitorRes = await resend.emails.send({
      from: "Hazil Portfolio <onboarding@resend.dev>",
      to: email,
      subject: `Meeting Request Received: ${topic}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #0f172a; margin-top: 0;">Meeting Consultation Request Received</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for reaching out! I have received your request to schedule a 1-on-1 consultation session.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Topic / Agenda:</strong> ${topic}</p>
            <p style="margin: 0 0 8px;"><strong>Requested Date:</strong> ${date}</p>
            <p style="margin: 0 0 8px;"><strong>Requested Time:</strong> ${time}</p>
            ${notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>

          <p>I will review my schedule and email you an official confirmation along with the meeting link shortly.</p>
          
          <p style="margin-top: 24px;">Best regards,<br/><strong>Hazil</strong><br/>Digital Marketer & Web Designer</p>
        </div>
      `,
    });

    if (visitorRes.error) {
      results.visitorEmail = { error: visitorRes.error.message };
    } else {
      results.visitorEmail = { id: visitorRes.data?.id };
    }
  } catch (err: unknown) {
    const error = err as Error;
    results.visitorEmail = { error: error.message };
  }

  return { success: Boolean(results.adminEmail?.id), results };
}

// 2. Official Customer Confirmation Email (Dispatched when Admin confirms a booking)
export async function sendCustomerMeetingConfirmedEmail({
  name,
  email,
  topic,
  date,
  time,
  notes,
  meetingLink,
}: CustomerConfirmationEmailParams) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.error("[Resend Error] Cannot send customer confirmation: RESEND_API_KEY is not set.");
    return { success: false, error: "Missing RESEND_API_KEY environment variable." };
  }

  const resend = new Resend(apiKey);

  try {
    const res = await resend.emails.send({
      from: "Hazil Portfolio <onboarding@resend.dev>",
      to: email,
      subject: "Your Meeting Has Been Confirmed!",
      html: `
        <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #10b981; color: #0b132b; font-weight: bold; font-size: 20px; width: 44px; height: 44px; line-height: 44px; border-radius: 12px;">H</div>
            <h1 style="color: #0f172a; font-size: 22px; margin: 12px 0 4px; font-weight: 800;">Your Meeting Has Been Confirmed!</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">We are scheduled to connect.</p>
          </div>

          <p style="font-size: 15px;">Hi <strong>${name}</strong>,</p>
          
          <p style="font-size: 15px; color: #334155;">
            I have reviewed your consultation request and confirmed our meeting on my calendar. I look forward to discussing your project goals!
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">Confirmed Meeting Details</h3>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Agenda / Topic:</strong> ${topic}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>Time:</strong> ${time}</p>
            ${notes ? `<p style="margin: 0; font-size: 14px;"><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>

          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; color: #475569;">
            <p style="margin: 0 0 6px;"><strong>Video Call Access:</strong></p>
            ${
              meetingLink
                ? `<p style="margin: 0;"><a href="${meetingLink}" style="color: #059669; font-weight: bold; text-decoration: underline;">Click here to join meeting</a></p>`
                : `<p style="margin: 0;">A Google Meet / Zoom link will be sent to this email address 15 minutes before our scheduled time.</p>`
            }
          </div>

          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
            If you need to reschedule or have questions before our session, feel free to reply directly to this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <p style="font-size: 14px; color: #0f172a; margin: 0;">
            Best regards,<br/>
            <strong>Hazil</strong><br/>
            <span style="color: #64748b; font-size: 12px;">Digital Marketer & Web Designer</span>
          </p>
        </div>
      `,
    });

    if (res.error) {
      console.error("[Resend Error] Failed to send customer confirmation:", res.error);
      return { success: false, error: res.error.message };
    }

    return { success: true, id: res.data?.id };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Resend Exception] Error sending customer confirmation:", error.message);
    return { success: false, error: error.message };
  }
}
