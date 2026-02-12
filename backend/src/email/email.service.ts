import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {
        const nodeEnv = this.configService.get<string>('NODE_ENV');
        const smtpHost = this.configService.get<string>('SMTP_HOST');
        const smtpPort = this.configService.get<number>('SMTP_PORT');
        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPass = this.configService.get<string>('SMTP_PASS');
        const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

        // If SMTP credentials are provided, use real SMTP
        if (smtpHost && smtpPort && smtpUser && smtpPass) {
            this.logger.log('Configuring SMTP transport for real email sending');
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure, // true for 465, false for other ports
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
        } else {
            // Development mode: log to console only
            this.logger.warn('No SMTP credentials found. Emails will be logged to console only.');
            this.transporter = nodemailer.createTransport({
                jsonTransport: true
            });
        }
    }

    async sendOnboardingEmail(to: string, name: string, password: string, link: string) {
        this.logger.log(`Preparing to send onboarding email to ${to}`);

        const subject = 'Welcome to Technnext HRMS - Your Account Details';
        const text = `
            Dear ${name},

            Welcome to the team! Your account has been created.

            Login Details:
            Email: ${to}
            Temporary Password: ${password}
            
            Please login at: ${link}
            
            After logging in, please update your profile and upload necessary documents.

            Best regards,
            HR Team
        `;

        const html = `
            <h3>Welcome to Technnext HRMS!</h3>
            <p>Dear ${name},</p>
            <p>Welcome to the team! Your account has been created.</p>
            <p><strong>Login Details:</strong></p>
            <ul>
                <li>Email: ${to}</li>
                <li>Temporary Password: <strong>${password}</strong></li>
            </ul>
            <p>Please login at: <a href="${link}">${link}</a></p>
            <p>After logging in, please update your profile and upload necessary documents.</p>
            <br/>
            <p>Best regards,<br/>HR Team</p>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: '"Technnext HR" <noreply@technnexthrms.com>',
                to,
                subject,
                text,
                html,
            });

            this.logger.log(`Email sent (mock): ${info.messageId}`);
            this.logger.log(`PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`); // Only works with Ethereal

            // CRITICAL: LOG CREDENTIALS TO CONSOLE SO USER CAN SEE THEM
            console.log('---------------------------------------------------');
            console.log(`[EMAIL SENT TO ${to}]`);
            console.log(`Subject: ${subject}`);
            console.log(`Password: ${password}`);
            console.log(`Link: ${link}`);
            console.log('---------------------------------------------------');

            return info;
        } catch (error) {
            this.logger.error('Failed to send email', error);
            // Fallback log
            console.log('---------------------------------------------------');
            console.log(`[EMAIL FAILED - FALLBACK LOG]`);
            console.log(`To: ${to}`);
            console.log(`Password: ${password}`);
            console.log('---------------------------------------------------');
        }
    }

    async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
        this.logger.log(`Preparing to send password reset email to ${to}`);

        const subject = 'Reset Your Technnext HRMS Password';
        const text = `
            Hi ${name},

            We received a request to reset your password for your Technnext HRMS account.

            Click the link below to reset your password:
            ${resetLink}

            This link will expire in 1 hour.

            If you didn't request this, please ignore this email.

            Best regards,
            HR Team
        `;

        const html = `
            <h3>Reset Your Password</h3>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password for your Technnext HRMS account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="margin: 20px 0;">
                <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <br/>
            <p>Best regards,<br/>HR Team</p>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: '"Technnext HR" <noreply@technnexthrms.com>',
                to,
                subject,
                text,
                html,
            });

            this.logger.log(`Password reset email sent: ${info.messageId}`);

            // Log for development
            console.log('---------------------------------------------------');
            console.log(`[PASSWORD RESET EMAIL SENT TO ${to}]`);
            console.log(`Reset Link: ${resetLink}`);
            console.log('---------------------------------------------------');

            return info;
        } catch (error) {
            this.logger.error('Failed to send password reset email', error);
            console.log('---------------------------------------------------');
            console.log(`[EMAIL FAILED - FALLBACK LOG]`);
            console.log(`To: ${to}`);
            console.log(`Reset Link: ${resetLink}`);
            console.log('---------------------------------------------------');
        }
    }
}
