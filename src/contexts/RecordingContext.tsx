import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { recorderService } from '../services/recorder';
import {
  ActiveRecording,
  RecordingEntry,
  RecordingState,
  RecordingMode,
} from '../types/recording';
import { transcribeAudio, DeepgramError } from '../services/deepgram';
import { showErrorToast, showSuccessToast } from '../services/toast';
import {
  saveAudioFile,
  deleteAudioFile,
  fileExists,
  getAudioFilePath,
} from '../services/fileStorage';
import {
  loadRecordings,
  saveRecordings,
  saveRecording,
  deleteRecording as deleteRecordingMetadata,
  clearRecordings as clearRecordingsStorage,
} from '../services/metadataStorage';

interface RecordingContextValue {
  recordings: RecordingEntry[];
  activeRecording?: ActiveRecording;
  isSavingRecording: boolean;
  startRecording: (mode: RecordingMode) => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingEntry | undefined>;
  cancelRecording: () => Promise<void>;
  clearRecordings: () => void;
  deleteRecording: (recordingId: string) => Promise<void>;
}

const RecordingContext = createContext<RecordingContextValue | undefined>(
  undefined
);

const createRecordingId = () => `rec-${Date.now()}`;

export const RecordingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
  const [activeRecording, setActiveRecording] = useState<ActiveRecording>();
  const [isSavingRecording, setIsSavingRecording] = useState(false);
  const recordingStateRef = useRef<RecordingState>('idle');

  // Load recordings from storage on mount
  useEffect(() => {
    const loadStoredRecordings = async () => {
      try {
        const storedRecordings = await loadRecordings();
        // Verify files exist and filter out missing ones
        const validRecordings: RecordingEntry[] = [];
        for (const recording of storedRecordings) {
          const exists = await fileExists(recording.id);
          if (exists) {
            // Update filePath to full path
            validRecordings.push({
              ...recording,
              filePath: getAudioFilePath(recording.id),
            });
          } else {
            // File missing - mark as failed
            validRecordings.push({
              ...recording,
              status: 'failed',
              errorMessage: 'Audio file not found',
            });
          }
        }
        setRecordings(validRecordings);
        // Save back in case we filtered any
        if (validRecordings.length !== storedRecordings.length) {
          await saveRecordings(validRecordings);
        }
      } catch (error) {
        console.error('Error loading recordings from storage:', error);
      }
    };

    loadStoredRecordings();
  }, []);

  useEffect(() => {
    recorderService.setSubscriptionDuration(1000);
    recorderService.onProgress = ({ currentPosition }) => {
      setActiveRecording((prev) => {
        if (!prev) {
          return prev;
        }
        const positionSeconds = Number.isFinite(currentPosition)
          ? currentPosition
          : 0;
        const segmentMs = Math.max(0, Math.floor(positionSeconds));
        const durationMs = Math.max(prev.durationMs, segmentMs);
        return {
          ...prev,
          updatedAt: Date.now(),
          durationMs,
        };
      });
    };

    return () => {
      recorderService.dispose();
    };
  }, []);

  const startRecording = useCallback(async (mode: RecordingMode) => {
    if (recordingStateRef.current !== 'idle') {
      return;
    }
    try {
      const id = createRecordingId();
      const startedAt = Date.now();
      const path = await recorderService.start();
      recordingStateRef.current = 'recording';
      setActiveRecording({
        id,
        filePath: path,
        startedAt,
        updatedAt: startedAt,
        durationMs: 0,
        state: 'recording',
        mode,
      });
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Recording Error', 'Unable to start recording.');
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    if (recordingStateRef.current !== 'recording') {
      return;
    }
    try {
      await recorderService.pause();
      recordingStateRef.current = 'paused';
      setActiveRecording((prev) =>
        prev ? { ...prev, state: 'paused', updatedAt: Date.now() } : prev
      );
    } catch (error) {
      console.error('Failed to pause recording', error);
      Alert.alert('Recording Error', 'Unable to pause recording.');
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    if (recordingStateRef.current !== 'paused') {
      return;
    }
    try {
      await recorderService.resume();
      recordingStateRef.current = 'recording';
      setActiveRecording((prev) =>
        prev ? { ...prev, state: 'recording', updatedAt: Date.now() } : prev
      );
    } catch (error) {
      console.error('Failed to resume recording', error);
      Alert.alert('Recording Error', 'Unable to resume recording.');
    }
  }, []);

  const transcribeRecordingAsync = useCallback(
    async (entry: RecordingEntry) => {
      if (!entry.filePath) {
        return;
      }

      setRecordings((prev) => {
        const updated = prev.map((rec) =>
          rec.id === entry.id
            ? { ...rec, status: 'processing', updatedAt: Date.now() }
            : rec
        );
        // Save to storage
        saveRecordings(updated).catch(console.error);
        return updated;
      });

      try {
        const { transcript, segments } = await transcribeAudio(entry.filePath, {
          diarize: entry.mode === 'INTERVIEW',
        });
        setRecordings((prev) => {
          const updated = prev.map((rec) =>
            rec.id === entry.id
              ? {
                  ...rec,
                  status: 'completed',
                  transcript,
                  transcriptSegments: segments,
                  updatedAt: Date.now(),
                }
              : rec
          );
          // Save to storage
          saveRecordings(updated).catch(console.error);
          return updated;
        });
        showSuccessToast('Transcription ready');
      } catch (error) {
        const errorMessage =
          error instanceof DeepgramError
            ? error.message
            : 'Transcription failed. Please try again later.';
        setRecordings((prev) => {
          const updated = prev.map((rec) =>
            rec.id === entry.id
              ? {
                  ...rec,
                  status: 'failed',
                  errorMessage,
                  transcriptSegments: undefined,
                  updatedAt: Date.now(),
                }
              : rec
          );
          // Save to storage
          saveRecordings(updated).catch(console.error);
          return updated;
        });
        showErrorToast('Transcription failed', errorMessage);
      }
    },
    []
  );

  const stopRecording = useCallback(async () => {
    if (recordingStateRef.current === 'idle') {
      return undefined;
    }
    setIsSavingRecording(true);
    try {
      const tempFilePath = await recorderService.stop();
      const finishedAt = Date.now();
      let completedRecording: RecordingEntry | undefined;

      setActiveRecording((prev) => {
        if (!prev) {
          return undefined;
        }
        completedRecording = {
          id: prev.id,
          title: `Recording ${recordings.length + 1}`,
          filePath: '', // Will be set after saving to device
          durationMs: prev.durationMs,
          createdAt: prev.startedAt,
          updatedAt: finishedAt,
          mode: prev.mode,
          status: 'processing', // Set to processing initially
          transcript: undefined,
          transcriptSegments: undefined,
        };
        return undefined;
      });

      if (completedRecording && tempFilePath) {
        try {
          // Save audio file to permanent storage
          const savedFilePath = await saveAudioFile(
            tempFilePath,
            completedRecording.id
          );
          completedRecording.filePath = savedFilePath;

          // Add to recordings array
          setRecordings((prev) => {
            const updated = [completedRecording!, ...prev];
            // Save metadata to AsyncStorage
            saveRecordings(updated).catch(console.error);
            return updated;
          });

          // Start transcription
          transcribeRecordingAsync(completedRecording);
        } catch (fileError) {
          console.error('Error saving audio file:', fileError);
          Alert.alert(
            'Save Error',
            'Recording stopped but failed to save. The file may be lost.'
          );
        }
      }

      recordingStateRef.current = 'idle';
      setIsSavingRecording(false);
      return completedRecording;
    } catch (error) {
      setIsSavingRecording(false);
      console.error('Failed to stop recording', error);
      Alert.alert('Recording Error', 'Unable to stop recording.');
      return undefined;
    }
  }, [recordings.length, transcribeRecordingAsync]);

  const cancelRecording = useCallback(async () => {
    if (recordingStateRef.current === 'idle') {
      return;
    }
    try {
      await recorderService.stop();
    } catch (error) {
      // ignore stop errors when cancelling
    } finally {
      recordingStateRef.current = 'idle';
      setActiveRecording(undefined);
    }
  }, []);

  const clearRecordings = useCallback(async () => {
    setRecordings([]);
    // Clear from AsyncStorage
    try {
      await clearRecordingsStorage();
    } catch (error) {
      console.error('Error clearing recordings from storage:', error);
    }
  }, []);

  const deleteRecording = useCallback(
    async (recordingId: string) => {
      // Remove from state
      setRecordings((prev) => {
        const updated = prev.filter((rec) => rec.id !== recordingId);
        // Save to storage
        saveRecordings(updated).catch(console.error);
        return updated;
      });

      // Delete audio file
      try {
        await deleteAudioFile(recordingId);
      } catch (error) {
        console.error('Error deleting audio file:', error);
      }

      // Delete metadata from storage
      try {
        await deleteRecordingMetadata(recordingId);
      } catch (error) {
        console.error('Error deleting recording metadata:', error);
      }

      // If it's the active recording, stop it
      if (activeRecording?.id === recordingId) {
        try {
          await recorderService.stop();
        } catch (error) {
          // ignore stop errors
        }
        recordingStateRef.current = 'idle';
        setActiveRecording(undefined);
      }
    },
    [activeRecording]
  );

  const value = useMemo<RecordingContextValue>(() => ({
    recordings,
    activeRecording,
    isSavingRecording,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    clearRecordings,
    deleteRecording,
  }), [
    recordings,
    activeRecording,
    isSavingRecording,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    clearRecordings,
    deleteRecording,
  ]);

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecordingContext = () => {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error(
      'useRecordingContext must be used within a RecordingProvider'
    );
  }
  return context;
};
