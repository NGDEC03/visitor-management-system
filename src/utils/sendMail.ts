import transporter from "./transporter";

interface MailProp {
  text: string;
  subject: string;
  recipient: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

export async function sendMail({ text, subject, recipient, html, attachments }: MailProp) {
  await transporter.sendMail({
    from: process.env.email,
    to: recipient,
    subject,
    text,
    html,
    attachments,
  });
}
