import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface AiConfig {
  openAiApiKey: string;
  model: string;
  timeout: number;
}

export const AI_CONFIG_NAME = 'ai-config';

export const aiConfig = registerAs(AI_CONFIG_NAME, (): AiConfig => {
  const openAiApiKey = Joi.string()
    .optional()
    .allow('')
    .description('OpenAI API key for AI-enabled GST filing')
    .validate(process.env.OPENAI_API_KEY).value ?? '';

  const model = Joi.string()
    .default('gpt-4o-mini')
    .description('OpenAI model to use for AI analysis')
    .validate(process.env.OPENAI_MODEL).value;

  const timeout = Joi.number()
    .default(30000)
    .min(5000)
    .max(120000)
    .description('Timeout in milliseconds for OpenAI API requests')
    .validate(process.env.OPENAI_TIMEOUT).value;

  return { openAiApiKey, model, timeout };
});
