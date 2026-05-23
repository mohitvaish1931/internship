import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Get Students Directory (Admin Only, Paginated + Filtered)
export const getStudents = async (req, res) => {
  try {
    const { search, batch, page = 1, limit = 10 } = req.query;
    const query = { role: 'student' };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Batch filter
    if (batch) {
      query.batch = batch;
    }

    const skipIndex = (Number(page) - 1) * Number(limit);
    
    const students = await User.find(query)
      .populate('batch')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skipIndex);

    const totalStudents = await User.countDocuments(query);

    return res.status(200).json({
      students,
      currentPage: Number(page),
      totalPages: Math.ceil(totalStudents / Number(limit)),
      totalStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Server error fetching student directory.' });
  }
};

// Create Student Account (Admin Only - Auto generates password & triggers welcome email)
export const createStudent = async (req, res) => {
  const { name, email, batchId } = req.body;

  try {
    if (!name || !email || !batchId) {
      return res.status(400).json({ message: 'Name, email, and target batch are required.' });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Auto-generate a simple, clean random password
    const generatedPassword = 'kins' + Math.floor(100000 + Math.random() * 900000);

    const newStudent = new User({
      name,
      email,
      password: generatedPassword,
      role: 'student',
      batch: batchId,
      active: true
    });

    await newStudent.save();

    // Trigger Welcome Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
          <h2 style="margin: 0;">Welcome to LearnKins Portal!</h2>
        </div>
        <div style="padding: 20px; color: #333333;">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your student account has been created by your program administrator. You can now access daily learning modules, submit video progress, and view batch resources.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace;">
            <p style="margin: 5px 0;"><strong>Portal URL:</strong> http://localhost:5173</p>
            <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${generatedPassword}</p>
          </div>

          <p style="color: #ef4444; font-size: 13px;"><em>Note: Please keep this password secure. You will use this credentials block to log into the main student landing page.</em></p>
        </div>
        <div style="background-color: #f9fafb; text-align: center; padding: 15px; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280;">
          LearnKins © Gamified Learning for Young Minds
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to LearnKins - Your Account is Ready!',
        html: emailHtml
      });
    } catch (mailError) {
      console.error('Welcome email failed to dispatch, but student was created successfully:', mailError);
    }

    return res.status(201).json({
      message: 'Student account created successfully and welcome credentials dispatched.',
      student: newStudent,
      generatedPassword // Return password so admin can view or copy it directly if SMTP fallback is active
    });
  } catch (error) {
    console.error('Error creating student account:', error);
    return res.status(500).json({ message: 'Server error creating student account.' });
  }
};

// Update Student Profile / Active status (Admin Only)
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, batchId, active } = req.body;

  try {
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    if (name !== undefined) student.name = name;
    if (email !== undefined) {
      // Check duplicate if email is being changed
      if (email.toLowerCase() !== student.email.toLowerCase()) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email address is already in use.' });
        }
      }
      student.email = email;
    }
    if (batchId !== undefined) student.batch = batchId;
    if (active !== undefined) student.active = active;

    await student.save();
    
    const updatedStudent = await User.findById(id).populate('batch');
    return res.status(200).json({ message: 'Student profile updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({ message: 'Server error updating student profile.' });
  }
};

// Delete Student Profile (Admin Only)
export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Student account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student account:', error);
    return res.status(500).json({ message: 'Server error deleting student account.' });
  }
};
