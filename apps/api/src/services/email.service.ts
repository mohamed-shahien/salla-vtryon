import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html: string
}

export async function sendEmail(options: EmailOptions) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('[email] SMTP credentials missing. Email not sent:', options.subject)
    return
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
}

export async function sendWelcomeEmail(to: string, setPasswordUrl: string) {
  await sendEmail({
    to,
    subject: 'مرحباً بك في منصة القياس الافتراضي',
    html: `
      <div dir="rtl" style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>مرحباً بك في منصة القياس الافتراضي!</h2>
        <p>لقد قمت بتثبيت التطبيق بنجاح عبر متجر سلة. لتتمكن من العودة وتسجيل الدخول عبر بريدك الإلكتروني لاحقاً، يرجى تعيين كلمة مرور لحسابك.</p>
        <p>
          <a href="${setPasswordUrl}" style="display: inline-block; padding: 12px 24px; background-color: #004d5a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            تعيين كلمة المرور
          </a>
        </p>
        <p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: 'إعادة تعيين كلمة المرور - منصة القياس الافتراضي',
    html: `
      <div dir="rtl" style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>طلب إعادة تعيين كلمة المرور</h2>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. يمكنك القيام بذلك عبر الرابط التالي:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #004d5a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            إعادة تعيين كلمة المرور
          </a>
        </p>
        <p>هذا الرابط صالح لفترة محدودة فقط.</p>
        <p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد.</p>
      </div>
    `,
  })
}

export async function sendPasswordChangedNotification(to: string) {
  await sendEmail({
    to,
    subject: 'تنبيه: تم تغيير كلمة المرور',
    html: `
      <div dir="rtl" style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>تم تغيير كلمة المرور بنجاح</h2>
        <p>نحيطك علماً بأنه تم تغيير كلمة المرور الخاصة بحسابك مؤخراً.</p>
        <p>إذا لم تقم بهذا الإجراء، يرجى التواصل مع الدعم الفني فوراً.</p>
      </div>
    `,
  })
}
