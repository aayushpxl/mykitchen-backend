const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"My Kitchen" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Code",
        html: `
            <div style="font-family: sans-serif; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 12px;">
                <h3 style="color: #333;">Password Reset Request</h3>
                <p>Your verification code for <strong>My Kitchen</strong> is:</p>
                <h1 style="color: #f97316; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
                <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
            </div>
        `,
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
