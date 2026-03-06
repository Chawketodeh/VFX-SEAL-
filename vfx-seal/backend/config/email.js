const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "VFX Seal - Password Reset Request",
    html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background: #0E121A; padding: 40px; text-align: center;">
                    <h1 style="color: #F6E7C0; margin: 0;">VFX <span style="color: #C79E68;">Seal</span></h1>
                </div>
                
                <div style="padding: 40px; background: #ffffff;">
                    <h2 style="color: #0E121A; margin-bottom: 20px;">Password Reset Request</h2>
                    
                    <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                        You requested a password reset for your VFX Seal account. Click the button below to set a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="
                            display: inline-block;
                            background: linear-gradient(135deg, #F6E7C0, #C79E68);
                            color: #0E121A;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                            font-size: 16px;
                        ">Reset My Password</a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        This link will expire in 15 minutes. If you didn't request this reset, please ignore this email.
                    </p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        If the button doesn't work, copy and paste this URL into your browser:<br>
                        <span style="word-break: break-all;">${resetUrl}</span>
                    </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} VFX Seal. All rights reserved.</p>
                </div>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = {
  sendPasswordResetEmail,
};
