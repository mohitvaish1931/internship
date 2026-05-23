import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_NAME || 'dkhucufvu';
const apiKey = process.env.CLOUDINARY_API_KEY || '992911797584541';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

const isConfigured = apiSecret && apiSecret !== '<your_api_secret>';

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  console.log('☁️ Cloudinary SDK successfully configured with user credentials.');
} else {
  console.log('⚠️ Cloudinary API Secret is missing or unset. Seeding default local directory fallbacks.');
}

// Upload local disk files directly to Cloudinary
export const uploadToCloud = async (localFilePath, folder = 'learnkins') => {
  try {
    if (!isConfigured) {
      console.log('⚠️ [Cloudinary Fallback] Using local file path as static resource url.');
      return null; // Return null so uploader controller utilizes local directory path
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto'
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary Upload Failed:', error);
    throw error;
  }
};

export default cloudinary;
