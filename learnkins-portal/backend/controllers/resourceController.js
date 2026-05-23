import Resource from '../models/Resource.js';

// Get Resources List (Admin gets all, Student gets batch-targeted)
export const getResources = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === 'admin') {
      const resources = await Resource.find().populate('batch').sort({ pinned: -1, createdAt: -1 });
      return res.status(200).json({ resources });
    } else {
      const studentBatchId = req.user.batch?._id || req.user.batch;

      if (!studentBatchId) {
        return res.status(200).json({ resources: [], message: 'No batch assigned yet.' });
      }

      // Query resources targeted to this student's cohort. Sort by pinned first.
      const resources = await Resource.find({ batch: studentBatchId })
        .sort({ pinned: -1, createdAt: -1 });

      return res.status(200).json({ resources });
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ message: 'Server error fetching resource links.' });
  }
};

// Create Curated Resource (Admin Only)
export const createResource = async (req, res) => {
  const { title, url, type, category, pinned, batchIds } = req.body;

  try {
    if (!title || !url || !type || !batchIds || batchIds.length === 0) {
      return res.status(400).json({ message: 'Title, URL, Type, and target batches are required.' });
    }

    const newResource = new Resource({
      title,
      url,
      type,
      category: category || 'General',
      pinned: pinned === true || pinned === 'true',
      batch: Array.isArray(batchIds) ? batchIds : [batchIds]
    });

    await newResource.save();
    return res.status(201).json({ message: 'Curated resource added successfully', resource: newResource });
  } catch (error) {
    console.error('Error creating resource:', error);
    return res.status(500).json({ message: 'Server error creating resource.' });
  }
};

// Update Resource (Admin Only)
export const updateResource = async (req, res) => {
  const { id } = req.params;
  const { title, url, type, category, pinned, batchIds } = req.body;

  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (title !== undefined) resource.title = title;
    if (url !== undefined) resource.url = url;
    if (type !== undefined) resource.type = type;
    if (category !== undefined) resource.category = category;
    if (pinned !== undefined) resource.pinned = pinned === true || pinned === 'true';
    if (batchIds !== undefined) resource.batch = Array.isArray(batchIds) ? batchIds : [batchIds];

    await resource.save();
    return res.status(200).json({ message: 'Resource details updated successfully', resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ message: 'Server error updating resource.' });
  }
};

// Delete Resource (Admin Only)
export const deleteResource = async (req, res) => {
  const { id } = req.params;

  try {
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    return res.status(200).json({ message: 'Curated resource deleted successfully.' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ message: 'Server error deleting resource.' });
  }
};
