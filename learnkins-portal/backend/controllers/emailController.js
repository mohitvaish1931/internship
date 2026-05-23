import User from '../models/User.js';
import EmailLog from '../models/EmailLog.js';
import Batch from '../models/Batch.js';
import sendEmail from '../utils/sendEmail.js';

// Get Email Dispatch History Logs (Admin Only)
export const getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find()
      .populate('sentBy', 'name email')
      .sort({ sentAt: -1 });
    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ message: 'Server error retrieving mail dispatch history.' });
  }
};

// Dispatch Email Broadcast (Admin Only)
export const sendBroadcast = async (req, res) => {
  const { targetType, batchId, subject, message, templateName } = req.body;
  const adminId = req.user._id;

  try {
    if (!subject || !message || !templateName) {
      return res.status(400).json({ message: 'Subject, message content, and template structure are required.' });
    }

    // Determine recipients
    let recipientQuery = { role: 'student', active: true };
    let batchName = 'All Batches';

    if (targetType === 'batch') {
      if (!batchId) {
        return res.status(400).json({ message: 'Batch ID is required for cohort targeting.' });
      }
      recipientQuery.batch = batchId;
      const targetBatch = await Batch.findById(batchId);
      if (targetBatch) {
        batchName = targetBatch.name;
      }
    }

    const students = await User.find(recipientQuery);
    
    if (students.length === 0) {
      return res.status(400).json({
        message: `No active student recipients found for target: ${batchName}.`
      });
    }

    const recipientEmails = students.map(s => s.email);

    // Apply HTML Templates
    let emailHtml = '';
    
    if (templateName === 'Welcome') {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #6366f1; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Welcome to LearnKins!</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Internship Program Onboarding</p>
          </div>
          <div style="padding: 25px; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 16px;">Welcome aboard, Intern!</p>
            <p>${message}</p>
            
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; color: #4f46e5;">Accessing Your Student Desk:</h4>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Target Group:</strong> ${batchName}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Portal Desk:</strong> <a href="http://localhost:5173" style="color: #6366f1; text-decoration: underline;">http://localhost:5173</a></p>
            </div>
            
            <p>If you encounter any login or video playback issues, please contact your learning supervisor.</p>
          </div>
          <div style="background-color: #f1f5f9; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748b;">
            LearnKins • Gamified Learning for Young Minds • 2026
          </div>
        </div>
      `;
    } else if (templateName === 'Weekly Reminder') {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fed7aa; border-radius: 8px;">
          <div style="background-color: #f97316; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">📬 Weekly Learning Checklist</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Keep up the incredible momentum!</p>
          </div>
          <div style="padding: 25px; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 16px;">Hello Interns,</p>
            <p>${message}</p>

            <div style="background-color: #fffaf0; border-left: 4px solid #f97316; padding: 15px; margin: 25px 0;">
              <h4 style="margin: 0 0 8px 0; color: #c2410c;">📅 Action Items of the Week:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Watch all scheduled Day videos inside your Student dashboard.</li>
                <li>Verify your overall watched progress percentage.</li>
                <li>Browse curated resources pinned under your Batch section.</li>
              </ul>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Student Dashboard</a>
            </p>
          </div>
          <div style="background-color: #f1f5f9; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748b;">
            LearnKins • Gamified Learning for Young Minds • 2026
          </div>
        </div>
      `;
    } else {
      // Custom Announcement Template
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #4f46e5; color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">📢 New Notice Published</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Important Broadcast Update</p>
          </div>
          <div style="padding: 25px; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 16px;">Hello Team,</p>
            <p>${message}</p>
          </div>
          <div style="background-color: #f1f5f9; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #64748b;">
            LearnKins • Gamified Learning for Young Minds • 2026
          </div>
        </div>
      `;
    }

    let status = 'sent';
    try {
      await sendEmail({
        to: recipientEmails,
        subject: `[LearnKins] ${subject}`,
        html: emailHtml
      });
    } catch (mailError) {
      console.error('Nodemailer failed, marking log as failed:', mailError);
      status = 'failed';
    }

    // Save history log
    const newLog = new EmailLog({
      sentBy: adminId,
      recipients: recipientEmails,
      subject,
      template: templateName,
      status
    });

    await newLog.save();

    if (status === 'failed') {
      return res.status(500).json({
        message: 'Broadcasting completed with local errors. Email transmission failed.',
        log: newLog
      });
    }

    return res.status(200).json({
      message: `Broadcast successfully completed for ${recipientEmails.length} active students.`,
      log: newLog
    });
  } catch (error) {
    console.error('Broadcasting fatal error:', error);
    return res.status(500).json({ message: 'Server error processing broadcast mailing list.' });
  }
};
