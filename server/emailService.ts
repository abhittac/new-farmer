import nodemailer from "nodemailer";
import { Order, OrderItem, User } from "../shared/schema";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface OrderEmailData {
  order: Order;
  orderItems: (OrderItem & { product: any })[];
  customerEmail: string;
  customerName: string;
  totalAmount: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;
  private fromName: string;

  constructor() {
    // Use hardcoded Mailtrap credentials as fallback since env vars aren't loading properly
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "3e36ba31a3527d",
        pass: process.env.EMAIL_PASS || "6560b932d97631",
      },
    };

    this.from = process.env.EMAIL_FROM || "noreply@harvestdirect.com";
    this.fromName = process.env.EMAIL_FROM_NAME || "Harvest Direct";

    this.transporter = nodemailer.createTransport(config);
  }

  async sendOrderNotificationToAdmin(orderData: OrderEmailData): Promise<void> {
    const { order, orderItems, customerEmail, customerName, totalAmount } =
      orderData;

    const orderItemsHtml = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${
          item.product.name
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(
          2
        )}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.quantity * item.price
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Order Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .customer-info { background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background-color: #2d5016; color: white; padding: 12px; text-align: left; }
          .total-row { background-color: #f0f8f0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 New Order Received!</h1>
            <p>Harvest Direct - Fresh from Farm to Table</p>
          </div>
          <div class="content">
            <div class="order-info">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(
                order.createdAt
              ).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "full",
                timeStyle: "short",
              })}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>

            <div class="customer-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
              ${
                order.billingAddress
                  ? `<p><strong>Billing Address:</strong> ${order.billingAddress}</p>`
                  : ""
              }
            </div>

            <h3>Order Items</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right;">₹${totalAmount.toFixed(
                    2
                  )}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>This is an automated notification from your Harvest Direct admin panel.</p>
              <p>Please process this order promptly to maintain customer satisfaction.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.from}>`,
      to: process.env.ADMIN_EMAIL || "admin@harvestdirect.com",
      subject: `🌱 New Order #${order.id} - ₹${totalAmount.toFixed(2)}`,
      html,
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5000"
    }/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .reset-button { display: inline-block; background-color: #2d5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Harvest Direct - Fresh from Farm to Table</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>We received a request to reset your password for your Harvest Direct account.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour for your security</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If you're having trouble clicking the button, contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Harvest Direct Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.from}>`,
      to: user.email,
      subject: "🔐 Reset Your Harvest Direct Password",
      html,
    });
  }

  async sendPasswordResetConfirmation(user: User): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Successfully Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0; color: #155724; }
          .login-button { display: inline-block; background-color: #2d5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Harvest Direct - Fresh from Farm to Table</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            
            <div class="success">
              <strong>✅ Success!</strong> Your password has been successfully reset.
            </div>
            
            <p>Your Harvest Direct account password has been updated. You can now log in with your new password.</p>
            
            <div style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:5000"
              }/login" class="login-button">Login to Your Account</a>
            </div>
            
            <p><strong>Security tip:</strong> If you didn't make this change, please contact our support team immediately.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Harvest Direct Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.from}>`,
      to: user.email,
      subject: "✅ Your Harvest Direct Password Has Been Reset",
      html,
    });
  }
  async registerEmail(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5000"
    }/auth/verify?token=${resetToken}`;

    const html = `
    <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify Your Account</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
      .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .verify-button { display: inline-block; background-color: #2d5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
      .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404; }
      .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔐 Verify Your Account</h1>
        <p>Harvest Direct - Fresh from Farm to Table</p>
      </div>
      <div class="content">
        <h2>Welcome ${user.name}!</h2>
        <p>Thank you for creating an account with Harvest Direct. To complete your registration, please verify your email address.</p>

        <div style="text-align: center;">
          <a href="${resetUrl}" class="verify-button">Verify My Account</a>
        </div>

        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>

        <div class="warning">
          <strong>⚠️ Important Security Notice:</strong>
          <ul>
            <li>This link will expire in 24 hours for your security</li>
            <li>If you didn't create this account, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>

        <p>If you're having trouble clicking the button, contact our support team.</p>

        <p>After verification, you'll have full access to our platform to enjoy fresh farm products.</p>

        <div class="footer">
          <p>Best regards,<br>The Harvest Direct Team</p>
          <p><small>This is an automated email. Please do not reply to this message.</small></p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
    try {
      const mail = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.from}>`,
        to: user.email,
        subject: "🔐 Verify Your Account",
        html,
      });
      console.log("Registration email sent successfully:", mail);
    } catch (error) {
      console.log("Error sending registration email:", error);
    }
  }
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
