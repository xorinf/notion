/**
 * @file cloudinaryUpload.js
 * @description Helper functions to upload buffers to Cloudinary and delete existing assets.
 */
import cloudinary from "./cloudinary.js";

// Utility to extract public_id from secure URL
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const folderIndex = parts.indexOf('notion-data');
  if (folderIndex !== -1) {
    const filenameWithExtension = parts.slice(folderIndex).join('/');
    return filenameWithExtension.split('.')[0]; // remove file extension
  }
  return null;
};

/**
 * Deletes a file from Cloudinary based on its secure URL.
 * @param {string} url - The full Cloudinary URL of the asset to delete.
 */
export const deleteFromCloudinary = async (url) => {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
  }
};

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * @param {Buffer} buffer - The file buffer in memory to upload.
 * @returns {Promise<Object>} Resolves with the Cloudinary upload result object.
 */
export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "notion-data" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
