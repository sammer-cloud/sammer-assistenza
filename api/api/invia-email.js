import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sammer Assistenza <noreply@sammersrl.com>',
      to,
      subject,
      html,
    });

    if (error) return res.status(400).json({ error });
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}