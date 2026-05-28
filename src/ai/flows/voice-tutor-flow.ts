'use server';
/**
 * @fileOverview AI Voice Tutor flow (TTS).
 *
 * Converts text explanations into high-quality audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const VoiceTutorInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  voice: z.enum(['Algenib', 'Achernar']).default('Algenib').describe('The voice to use.'),
});
export type VoiceTutorInput = z.infer<typeof VoiceTutorInputSchema>;

const VoiceTutorOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data as a base64 encoded WAV data URI.'),
});
export type VoiceTutorOutput = z.infer<typeof VoiceTutorOutputSchema>;

export async function generateVoiceExplanation(input: VoiceTutorInput): Promise<VoiceTutorOutput> {
  return voiceTutorFlow(input);
}

const voiceTutorFlow = ai.defineFlow(
  {
    name: 'voiceTutorFlow',
    inputSchema: VoiceTutorInputSchema,
    outputSchema: VoiceTutorOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: input.voice },
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No audio media returned from the model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}