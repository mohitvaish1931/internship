import Batch from '../models/Batch.js';

// Get All Batches
export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    return res.status(200).json({ batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return res.status(500).json({ message: 'Server error fetching batches.' });
  }
};

// Create a Batch (Admin Only)
export const createBatch = async (req, res) => {
  const { name, startDate, endDate } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Batch name is required.' });
    }

    const newBatch = new Batch({
      name,
      startDate: startDate || null,
      endDate: endDate || null
    });

    await newBatch.save();
    return res.status(201).json({ message: 'Batch created successfully', batch: newBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    return res.status(500).json({ message: 'Server error creating batch.' });
  }
};

// Update a Batch (Admin Only)
export const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, active } = req.body;

  try {
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }

    if (name !== undefined) batch.name = name;
    if (startDate !== undefined) batch.startDate = startDate;
    if (endDate !== undefined) batch.endDate = endDate;
    if (active !== undefined) batch.active = active;

    await batch.save();
    return res.status(200).json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    console.error('Error updating batch:', error);
    return res.status(500).json({ message: 'Server error updating batch.' });
  }
};

// Delete a Batch (Admin Only)
export const deleteBatch = async (req, res) => {
  const { id } = req.params;

  try {
    const batch = await Batch.findByIdAndDelete(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }
    return res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return res.status(500).json({ message: 'Server error deleting batch.' });
  }
};
