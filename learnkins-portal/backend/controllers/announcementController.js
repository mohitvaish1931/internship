import Announcement from '../models/Announcement.js';

// Get Announcements (Notice Board)
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ pinned: -1, createdAt: -1 });
    return res.status(200).json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ message: 'Server error retrieving notice board announcements.' });
  }
};

// Create Announcement (Admin Only)
export const createAnnouncement = async (req, res) => {
  const { title, content, pinned } = req.body;
  const adminId = req.user._id;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      pinned: pinned === true || pinned === 'true',
      createdBy: adminId
    });

    await newAnnouncement.save();
    
    const announcementWithAuthor = await Announcement.findById(newAnnouncement._id)
      .populate('createdBy', 'name email');

    return res.status(201).json({
      message: 'Notice posted successfully',
      announcement: announcementWithAuthor
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ message: 'Server error publishing announcement notice.' });
  }
};
