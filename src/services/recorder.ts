import Sound, {
  RecordBackType,
  PlayBackType,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption, 
  AudioSet,
  OutputFormatAndroidType,
} from 'react-native-nitro-sound';
import { Platform } from 'react-native';

export interface RecorderStartOptions {
  /** Optional explicit file path */
  path?: string;
  meteringEnabled?: boolean;
}

export interface RecorderProgress {
  currentPosition: number;
  currentMetering?: number;
}

const DEFAULT_AUDIO_SET: AudioSet = {
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVNumberOfChannelsKeyIOS: 2,
  AVFormatIDKeyIOS: 'aac' as AVEncodingOption, 
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  OutputFormatAndroid: OutputFormatAndroidType.AAC_ADIF, 
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
};

class RecorderService {
  private progressListener?: (data: RecordBackType) => void;

  async start(options: RecorderStartOptions = {}): Promise<string> {
    this.cleanupProgressListener();

    this.progressListener = (data: RecordBackType) => {
      this.onProgress?.({
        currentPosition: data.currentPosition,
        currentMetering: data.currentMetering,
      });
    };

    Sound.addRecordBackListener(this.progressListener);

    const path = await Sound.startRecorder(
      options.path,
      DEFAULT_AUDIO_SET,
      options.meteringEnabled ?? true
    );

    return path;
  }

  async pause(): Promise<void> {
    await Sound.pauseRecorder();
  }

  async resume(): Promise<void> {
    await Sound.resumeRecorder();
  }

  async stop(): Promise<string> {
    const path = await Sound.stopRecorder();
    this.cleanupProgressListener();
    return path;
  }

  async dispose(): Promise<void> {
    if (Platform.OS !== 'web') {
      this.cleanupProgressListener();
      try {
        await Sound.stopRecorder();
      } catch (e) {
        // ignore if already stopped
      }
    }
  }

  onProgress?: (progress: RecorderProgress) => void;

  setSubscriptionDuration(durationMs: number) {
    Sound.setSubscriptionDuration(durationMs);
  }

  private cleanupProgressListener() {
    if (this.progressListener) {
      try {
        Sound.removeRecordBackListener();
      } catch (e) {
        // ignore
      }
      this.progressListener = undefined;
    }
  }
}

export const recorderService = new RecorderService();
