import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AI_CONFIG_NAME, AiConfig } from '@config/ai.config';
import { Gstr1Data, Gstr3BData } from '../interfaces/gst-return.interface';
import { GstReturnType } from '../schema/gst-filing.schema';

export interface AiGstSuggestion {
  summary: string;
  insights: string[];
  warnings: string[];
  suggestedAdjustments: Record<string, any>;
  confidenceScore: number;
}

@Injectable()
export class AiGstService {
  private readonly logger = new Logger(AiGstService.name);

  constructor(private readonly configService: ConfigService) {}

  async analyzeAndSuggest(
    returnType: GstReturnType,
    returnData: Gstr1Data | Gstr3BData,
    returnPeriod: string,
    gstin: string,
  ): Promise<AiGstSuggestion> {
    const config = this.configService.get<AiConfig>(AI_CONFIG_NAME);

    if (!config?.openAiApiKey) {
      this.logger.warn('OpenAI API key not configured; skipping AI analysis');
      return this.buildDefaultSuggestion(returnType, returnData);
    }

    try {
      return await this.callOpenAi(config, returnType, returnData, returnPeriod, gstin);
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`);
      return this.buildDefaultSuggestion(returnType, returnData);
    }
  }

  private async callOpenAi(
    config: AiConfig,
    returnType: GstReturnType,
    returnData: Gstr1Data | Gstr3BData,
    returnPeriod: string,
    gstin: string,
  ): Promise<AiGstSuggestion> {
    const prompt = this.buildPrompt(returnType, returnData, returnPeriod, gstin);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Indian GST compliance consultant. Analyze GST return data and provide actionable insights, potential issues, and suggestions for optimization. Respond with a valid JSON object only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${config.openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: config.timeout,
      },
    );

    const content = response.data.choices?.[0]?.message?.content ?? '{}';
    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      this.logger.warn('OpenAI returned non-JSON content; using defaults');
    }

    return {
      summary: parsed.summary ?? 'AI analysis complete.',
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      suggestedAdjustments: parsed.suggestedAdjustments ?? {},
      confidenceScore:
        typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.8,
    };
  }

  private buildPrompt(
    returnType: GstReturnType,
    returnData: Gstr1Data | Gstr3BData,
    returnPeriod: string,
    gstin: string,
  ): string {
    return `Analyze the following ${returnType} GST return data for GSTIN ${gstin}, period ${returnPeriod}.
Return a JSON object with fields:
- summary (string): brief summary
- insights (array of strings): key observations
- warnings (array of strings): potential compliance issues
- suggestedAdjustments (object): suggested data corrections or additions
- confidenceScore (number 0-1): confidence in the data accuracy

Data: ${JSON.stringify(returnData)}`;
  }

  private buildDefaultSuggestion(
    returnType: GstReturnType,
    returnData: Gstr1Data | Gstr3BData,
  ): AiGstSuggestion {
    const warnings: string[] = [];

    if (returnType === GstReturnType.GSTR1) {
      const data = returnData as Gstr1Data;
      if (!data.b2bInvoices?.length && !data.b2csInvoices?.length && !data.b2clInvoices?.length) {
        warnings.push('No invoices found for the period. Verify that orders are correctly recorded.');
      }
    }

    if (returnType === GstReturnType.GSTR3B) {
      const data = returnData as Gstr3BData;
      if (data.outwardSupplies?.taxableValue === 0) {
        warnings.push('Outward taxable value is zero. Verify sales data for this period.');
      }
    }

    return {
      summary: `${returnType} data prepared from recorded transactions. Manual review recommended.`,
      insights: ['Return data aggregated from shop orders for the specified period.'],
      warnings,
      suggestedAdjustments: {},
      confidenceScore: 0.75,
    };
  }
}
