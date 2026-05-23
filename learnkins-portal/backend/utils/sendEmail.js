import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Check if credentials are set
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.log('\n======================================================');
      console.log('📬 [EMAIL SYSTEM FALLBACK] Email details logged below:');
      console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`Subject: ${subject}`);
      console.log('------------------ Content ---------------------------');
      // Strip some tags to make console logging cleaner
      const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(cleanText);
      console.log('======================================================\n');
      return { status: 'sent', fallback: true };
    }

    // Configure SMTP transport
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: `"LearnKins Portal" <${user}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully dispatched. Message ID: ${info.messageId}`);
    return { status: 'sent', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to dispatch email:', error);
    throw error;
  }
};

export default sendEmail;
