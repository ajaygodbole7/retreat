import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

// Create a transporter
let transporter: nodemailer.Transporter;

// Initialize the transporter based on environment
if (process.env.NODE_ENV === "production") {
    // Production email configuration
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number.parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
} else {
    // Development email configuration - logs to console
    transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
    });
}

/**
 * Sends a verification email to a user
 * @param to Recipient email address
 * @param name Recipient name
 * @param verificationUrl Verification URL
 */
export async function sendVerificationEmail(to: string, name: string, verificationUrl: string): Promise<void> {
    const subject = "Verify Your Email Address";
    const text = `Hello ${ name },\n\nPlease verify your email address by clicking the following link:\n${ verificationUrl }\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Hello ${ name },</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${ verificationUrl }" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${ verificationUrl }</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    </div>
  `;

    await sendEmail({ to, subject, text, html });
}

/**
 * Sends a password reset email to a user
 * @param to Recipient email address
 * @param name Recipient name
 * @param resetUrl Password reset URL
 */
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    const subject = "Reset Your Password";
    const text = `Hello ${ name },\n\nYou requested to reset your password. Please click the following link to reset it:\n${ resetUrl }\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${ name },</p>
      <p>You requested to reset your password. Please click the button below to reset it:</p>
      <p style="text-align: center;">
        <a href="${ resetUrl }" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${ resetUrl }</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

    await sendEmail({ to, subject, text, html });
}

/**
 * Send an email
 * @param options Email options (to, subject, text, html)
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    try {
        const { to, subject, text, html } = options;

        // Set up email data
        const mailOptions = {
            from: process.env.EMAIL_FROM || "noreply@example.com",
            to,
            subject,
            text,
            html,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        // In development, log the email to console
        if (process.env.NODE_ENV !== "production") {
            console.log("Email not sent in development mode. Would have sent:");
            console.log(`To: ${ to }`);
            console.log(`Subject: ${ subject }`);
            console.log(`Text: ${ text }`);

            // If using stream transport, log the message
            if ("message" in info) {
                console.log("Email content:", info.message.toString());
            }
        }
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}