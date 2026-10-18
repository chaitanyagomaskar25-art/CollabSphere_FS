import { transporter } from "../config/email.js";

export const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return info;
};
