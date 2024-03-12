// utils/resizeImage.js
import sharp from 'sharp';

export async function resizeImage(file, width, height) {
 try {
    const resizedImageBuffer = await sharp(file)
      .resize(width, height)
      .toBuffer();
    return resizedImageBuffer;
 } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
 }
}
