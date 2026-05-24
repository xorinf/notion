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
