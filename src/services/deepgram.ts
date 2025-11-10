import { DEEPGRAM_API_KEY } from '../config/env';
import { TranscriptSegment } from '../types/recording';

const DEEPGRAM_URL =
  'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true';

export class DeepgramError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeepgramError';
  }
}

const normalizeFileUri = (filePath: string) =>
  filePath.startsWith('file://') ? filePath : `file://${filePath}`;

export interface TranscriptResult {
  transcript: string;
  segments: TranscriptSegment[];
}

export async function transcribeAudio(filePath: string): Promise<TranscriptResult> {
  if (!DEEPGRAM_API_KEY) {
    throw new DeepgramError('Deepgram API key is not configured.');
  }

  const formData = new FormData();
  formData.append('file', {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore React Native FormData types
    uri: normalizeFileUri(filePath),
    type: 'audio/aac',
    name: 'recording.aac',
  });

  const response = await fetch(DEEPGRAM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      Accept: 'application/json',
    },
    body: formData,
  });




  if (!response.ok) {
    const errorBody = await response.text();
    throw new DeepgramError(
      `Deepgram request failed (${response.status}): ${errorBody}`
    );
  }

  const payload = await response.json();

  console.log('response*****', payload);

  const alternative =
    payload?.results?.channels?.[0]?.alternatives?.[0] ?? undefined;
  const paragraphs = alternative?.paragraphs?.paragraphs ?? [];

  const segments: TranscriptSegment[] = paragraphs.flatMap(
    (paragraph: any, idx: number) => {
      const sentences = paragraph?.sentences ?? [];
      if (sentences.length === 0) {
        return [
          {
            id: `segment-${idx}`,
            startMs: Math.floor((paragraph?.start ?? 0) * 1000),
            endMs: Math.floor((paragraph?.end ?? 0) * 1000),
            text: (paragraph?.text ?? '').trim(),
          },
        ];
      }

      return sentences.map((sentence: any, sentenceIdx: number) => ({
        id: `segment-${idx}-${sentenceIdx}`,
        startMs: Math.floor((sentence?.start ?? paragraph?.start ?? 0) * 1000),
        endMs: Math.floor((sentence?.end ?? paragraph?.end ?? 0) * 1000),
        text: (sentence?.text ?? '').trim(),
      }));
    }
  );

  const fallbackTranscript = alternative?.transcript ?? '';
  const transcriptText = segments.length
    ? segments.map((segment) => segment.text).join(' ')
    : fallbackTranscript;

  if (!transcriptText) {
    throw new DeepgramError('No transcript returned from Deepgram.');
  }

  return {
    transcript: transcriptText.trim(),
    segments,
  };
}
