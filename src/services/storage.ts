import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // Create a reference to the file location
    const storageRef = ref(storage, path);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const generateImagePath = (fileName: string, folder: string = 'product-images'): string => {
  const timestamp = new Date().getTime();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  return `${folder}/${timestamp}-${randomId}.${extension}`;
};
