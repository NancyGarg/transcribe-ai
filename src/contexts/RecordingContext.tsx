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
} from '../types/recording';
import { transcribeAudio, DeepgramError } from '../services/deepgram';
import { showErrorToast, showSuccessToast } from '../services/toast';

interface RecordingContextValue {
  recordings: RecordingEntry[];
  activeRecording?: ActiveRecording;
  isSavingRecording: boolean;
  startRecording: () => Promise<void>;
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

  const startRecording = useCallback(async () => {
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

      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === entry.id
            ? { ...rec, status: 'processing', updatedAt: Date.now() }
            : rec
        )
      );

      try {
        const { transcript, segments } = await transcribeAudio(entry.filePath);
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === entry.id
              ? {
                  ...rec,
                  status: 'completed',
                  transcript,
                  transcriptSegments: segments,
                  updatedAt: Date.now(),
                }
              : rec
          )
        );
        showSuccessToast('Transcription ready');
      } catch (error) {
        const errorMessage =
          error instanceof DeepgramError
            ? error.message
            : 'Transcription failed. Please try again later.';
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === entry.id
              ? {
                  ...rec,
                  status: 'failed',
                  errorMessage,
                  transcriptSegments: undefined,
                  updatedAt: Date.now(),
                }
              : rec
          )
        );
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
      const filePath = await recorderService.stop();
      const finishedAt = Date.now();
      let completedRecording: RecordingEntry | undefined;
  

      setActiveRecording((prev) => {
        if (!prev) {
          return undefined;
        }
        completedRecording = {
          id: prev.id,
          title: `Recording ${recordings.length + 1}`,
          filePath: filePath || prev.filePath || '',
          durationMs: prev.durationMs,
          createdAt: prev.startedAt,
          updatedAt: finishedAt,
          status: 'pending',
        };
        return undefined;
      });

      if (completedRecording) {
        setRecordings((prev) => [completedRecording!, ...prev]);
        transcribeRecordingAsync(completedRecording);
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

  const clearRecordings = useCallback(() => {
    setRecordings([]);
  }, []);

  const deleteRecording = useCallback(async (recordingId: string) => {
    setRecordings((prev) => prev.filter((rec) => rec.id !== recordingId));

    if (activeRecording?.id === recordingId) {
      try {
        await recorderService.stop();
      } catch (error) {
        // ignore stop errors
      }
      recordingStateRef.current = 'idle';
      setActiveRecording(undefined);
    }
  }, [activeRecording]);

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
