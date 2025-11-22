import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordingEntry } from '../types/recording';

const STORAGE_KEY = '@transcribeAi:recordings';

/**
 * Save all recordings metadata to AsyncStorage
 */
export const saveRecordings = async (
  recordings: RecordingEntry[]
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(recordings);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving recordings to AsyncStorage:', error);
    throw new Error(`Failed to save recordings: ${error}`);
  }
};

/**
 * Load all recordings metadata from AsyncStorage
 */
export const loadRecordings = async (): Promise<RecordingEntry[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue == null) {
      return [];
    }
    const recordings = JSON.parse(jsonValue) as RecordingEntry[];
    return recordings;
  } catch (error) {
    console.error('Error loading recordings from AsyncStorage:', error);
    // Return empty array on error to prevent app crash
    return [];
  }
};

/**
 * Add or update a single recording in storage
 */
export const saveRecording = async (
  recording: RecordingEntry
): Promise<void> => {
  try {
    const recordings = await loadRecordings();
    const existingIndex = recordings.findIndex((r) => r.id === recording.id);

    if (existingIndex >= 0) {
      // Update existing recording
      recordings[existingIndex] = recording;
    } else {
      // Add new recording
      recordings.push(recording);
    }

    await saveRecordings(recordings);
  } catch (error) {
    console.error('Error saving single recording:', error);
    throw new Error(`Failed to save recording: ${error}`);
  }
};

/**
 * Delete a recording from storage
 */
export const deleteRecording = async (recordingId: string): Promise<void> => {
  try {
    const recordings = await loadRecordings();
    const filtered = recordings.filter((r) => r.id !== recordingId);
    await saveRecordings(filtered);
  } catch (error) {
    console.error('Error deleting recording from AsyncStorage:', error);
    throw new Error(`Failed to delete recording: ${error}`);
  }
};

/**
 * Clear all recordings from storage
 */
export const clearRecordings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recordings from AsyncStorage:', error);
    throw new Error(`Failed to clear recordings: ${error}`);
  }
};

