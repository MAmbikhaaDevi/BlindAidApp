import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyC2RCZFUMAMRl1hgXyW3Kar5fDwZ_QSknE'})],
  model: 'googleai/gemini-2.5-flash',
});
