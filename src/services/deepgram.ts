import { DEEPGRAM_API_KEY } from '../config/env';

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

export async function transcribeAudio(filePath: string): Promise<string> {
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

  const transcript =
    payload?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ??
    payload?.results?.channels?.[0]?.alternatives?.[0]?.transcript ??
    '';

  if (!transcript) {
    throw new DeepgramError('No transcript returned from Deepgram.');
  }

  return transcript.trim();
}
