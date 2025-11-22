import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const RECORDINGS_DIR = 'recordings';

/**
 * Get the base directory for storing recordings
 * Uses DocumentDirectoryPath which persists across app updates
 */
const getRecordingsDirectory = (): string => {
  const baseDir =
    Platform.OS === 'ios'
      ? RNFS.DocumentDirectoryPath
      : RNFS.DocumentDirectoryPath;
  return `${baseDir}/${RECORDINGS_DIR}`;
};

/**
 * Ensure the recordings directory exists
 */
const ensureRecordingsDirectory = async (): Promise<string> => {
  const dir = getRecordingsDirectory();
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
  return dir;
};

/**
 * Get the full file path for a recording
 */
export const getAudioFilePath = (recordingId: string): string => {
  const dir = getRecordingsDirectory();
  return `${dir}/${recordingId}.aac`;
};

/**
 * Save an audio file from source path to permanent storage
 * @param sourcePath - Path to the temporary audio file
 * @param recordingId - Unique ID for the recording
 * @returns Full path to the saved file
 */
export const saveAudioFile = async (
  sourcePath: string,
  recordingId: string
): Promise<string> => {
  try {
    // Ensure recordings directory exists
    await ensureRecordingsDirectory();

    // Get destination path
    const destPath = getAudioFilePath(recordingId);

    // Copy file from source to destination
    await RNFS.copyFile(sourcePath, destPath);

    return destPath;
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw new Error(`Failed to save audio file: ${error}`);
  }
};

/**
 * Check if an audio file exists
 */
export const fileExists = async (recordingId: string): Promise<boolean> => {
  try {
    const filePath = getAudioFilePath(recordingId);
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Delete an audio file
 */
export const deleteAudioFile = async (
  recordingId: string
): Promise<void> => {
  try {
    const filePath = getAudioFilePath(recordingId);
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting audio file:', error);
    throw new Error(`Failed to delete audio file: ${error}`);
  }
};

/**
 * Get all recording file IDs from the recordings directory
 * Useful for cleanup or verification
 */
export const getAllRecordingIds = async (): Promise<string[]> => {
  try {
    const dir = getRecordingsDirectory();
    const exists = await RNFS.exists(dir);
    if (!exists) {
      return [];
    }

    const files = await RNFS.readdir(dir);
    // Filter for .aac files and extract IDs
    return files
      .filter((file) => file.endsWith('.aac'))
      .map((file) => file.replace('.aac', ''));
  } catch (error) {
    console.error('Error reading recordings directory:', error);
    return [];
  }
};

