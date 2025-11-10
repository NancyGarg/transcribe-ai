export type RecordingState = 'idle' | 'recording' | 'paused';

export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface RecordingEntry {
  id: string;
  title: string;
  filePath: string;
  durationMs: number;
  createdAt: number;
  updatedAt: number;
  transcript?: string;
  transcriptSegments?: TranscriptSegment[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface ActiveRecording {
  id: string;
  filePath?: string;
  startedAt: number;
  updatedAt: number;
  durationMs: number;
  state: RecordingState;
}
