import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  template: React.ReactElement;
}) {
  const resend = getResend();
  const html = await render(opts.template);
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: opts.to,
    subject: opts.subject,
    html,
  });
}
