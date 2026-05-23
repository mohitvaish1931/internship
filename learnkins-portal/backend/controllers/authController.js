import User from '../models/User.js';

// Login User (No JWT session setup)
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    // Simple robust password comparison (Plain text as per simple Login guidelines)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Convert to object and delete password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// Check Profile (Me)
export const getMe = async (req, res) => {
  try {
    // req.user is already populated by requireAuth middleware
    const userResponse = req.user.toObject();
    delete userResponse.password;
    
    return res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error('Profile fetching error:', error);
    return res.status(500).json({ message: 'Server error fetching profile details.' });
  }
};
