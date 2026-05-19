import nodemailer from 'nodemailer'
import { config } from '../config'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
})

export async function sendEmail(to: string, subject: string, html: string) {
  if (!config.smtp.user) return
  await transporter.sendMail({ from: config.smtp.from, to, subject, html })
}

export function orderStatusEmail(businessName: string, orderId: string, recipient: string, status: string, trackingRef?: string) {
  return {
    subject: `Order update — ${status}`,
    html: `<p>Hi ${businessName},</p>
<p>Order <strong>${orderId.slice(0, 8).toUpperCase()}</strong> for <strong>${recipient}</strong> is now <strong>${status}</strong>.</p>
${trackingRef ? `<p>Tracking ref: <strong>${trackingRef}</strong></p>` : ''}
<p>DeliveryAgg</p>`,
  }
}
