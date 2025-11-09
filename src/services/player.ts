import Sound, {
  PlayBackType,
  PlaybackEndType,
} from 'react-native-nitro-sound';
import { Platform } from 'react-native';

export interface PlayerProgress {
  currentPosition: number;
  duration: number;
}

class PlayerService {
  private progressListener?: (data: PlayBackType) => void;
  private completionListener?: (data: PlaybackEndType) => void;

  async start(path: string): Promise<void> {
    await this.cleanup();

    this.progressListener = (data: PlayBackType) => {
      this.onProgress?.({
        currentPosition: data.currentPosition,
        duration: data.duration,
      });
    };

    Sound.addPlayBackListener(this.progressListener);

    this.completionListener = () => {
      this.onEnd?.();
    };
    Sound.addPlaybackEndListener(this.completionListener);

    await Sound.startPlayer(path);
  }

  async pause(): Promise<void> {
    await Sound.pausePlayer();
  }

  async resume(): Promise<void> {
    await Sound.resumePlayer();
  }

  async stop(): Promise<void> {
    await Sound.stopPlayer();
    await this.cleanup();
  }

  onProgress?: (progress: PlayerProgress) => void;
  onEnd?: () => void;

  async cleanup(): Promise<void> {
    if (this.progressListener) {
      try {
        Sound.removePlayBackListener();
      } catch (error) {
        // ignore
      }
      this.progressListener = undefined;
    }

    if (this.completionListener) {
      try {
        Sound.removePlaybackEndListener();
      } catch (error) {
        // ignore
      }
      this.completionListener = undefined;
    }

    if (Platform.OS !== 'web') {
      try {
        await Sound.stopPlayer();
      } catch (error) {
        // ignore if already stopped
      }
    }
  }
}

export const playerService = new PlayerService();
