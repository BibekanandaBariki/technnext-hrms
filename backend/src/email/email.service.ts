import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found. Email functionality will be disabled.',
      );
    } else {
      this.resend = new Resend(resendApiKey);
      this.logger.log('Resend API initialized successfully');
    }

    // Use configured from email or default
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'Technnext HR <onboarding@resend.dev>';
  }

  async sendOnboardingEmail(
    to: string,
    name: string,
    password: string,
    link: string,
  ) {
    this.logger.log(`Preparing to send onboarding email to ${to}`);

    if (!this.resend) {
      this.logger.error('Resend not initialized. Cannot send email.');
      throw new Error('Email service not configured');
    }

    const subject = 'Welcome to Technnext HRMS - Your Account Details';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Technnext HRMS!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
            
            <p>Welcome to the team! Your account has been successfully created.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">Login Details</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${to}</p>
              <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${password}</code></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Login to Your Account</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">After logging in, please:</p>
            <ul style="color: #666; font-size: 14px;">
              <li>Change your temporary password</li>
              <li>Complete your profile</li>
              <li>Upload necessary documents</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message. Please do not reply to this email.<br>
              If you have any questions, contact your HR department.
            </p>
          </div>
        </body>
      </html>
    `;

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

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Onboarding email sent successfully. ID: ${data?.id}`);
      return { messageId: data?.id, success: true };
    } catch (error) {
      this.logger.error('Failed to send onboarding email', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
    this.logger.log(`Preparing to send password reset email to ${to}`);

    if (!this.resend) {
      this.logger.error('Resend not initialized. Cannot send email.');
      throw new Error('Email service not configured');
    }

    const subject = 'Reset Your Technnext HRMS Password';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
            
            <p>We received a request to reset your password for your Technnext HRMS account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
              <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
            </p>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message. Please do not reply to this email.<br>
              If you have any questions, contact your HR department.
            </p>
          </div>
        </body>
      </html>
    `;

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

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(
        `Password reset email sent successfully. ID: ${data?.id}`,
      );
      return { messageId: data?.id, success: true };
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      throw error;
    }
  }
}
