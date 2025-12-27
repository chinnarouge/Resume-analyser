import { AzureOpenAI } from "openai";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { AIConfig } from "./types";

export interface AIClient {
    generateJSON(prompt: string): Promise<any>;
    generateText(prompt: string): Promise<string>;
}

class AzureClient implements AIClient {
    private client: AzureOpenAI;
    private deployment: string;

    constructor(config: AIConfig) {
        if (!config.endpoint || !config.apiKey || !config.deployment) {
            throw new Error("Azure config requires endpoint, apiKey, and deployment");
        }
        this.client = new AzureOpenAI({
            endpoint: config.endpoint,
            apiKey: config.apiKey,
            apiVersion: "2024-05-01-preview",
            deployment: config.deployment
        });
        this.deployment = config.deployment;
    }

    async generateJSON(prompt: string): Promise<any> {
        const result = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful AI assistant that responds in JSON format." },
                { role: "user", content: prompt }
            ],
            model: this.deployment,
            response_format: { type: "json_object" }
        });
        const content = result.choices[0].message?.content;
        if (!content) throw new Error("No content");
        return JSON.parse(content);
    }

    async generateText(prompt: string): Promise<string> {
        const result = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful AI assistant." },
                { role: "user", content: prompt }
            ],
            model: this.deployment
        });
        return result.choices[0].message?.content || "";
    }
}

class OpenAIClient implements AIClient {
    private client: OpenAI;
    private model: string;

    constructor(config: AIConfig) {
        this.client = new OpenAI({ apiKey: config.apiKey });
        this.model = config.model || "gpt-4o";
    }

    async generateJSON(prompt: string): Promise<any> {
        const result = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful AI assistant that responds in JSON format." },
                { role: "user", content: prompt }
            ],
            model: this.model,
            response_format: { type: "json_object" }
        });
        const content = result.choices[0].message?.content;
        if (!content) throw new Error("No content");
        return JSON.parse(content);
    }

    async generateText(prompt: string): Promise<string> {
        const result = await this.client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful AI assistant." },
                { role: "user", content: prompt }
            ],
            model: this.model
        });
        return result.choices[0].message?.content || "";
    }
}

class GeminiClient implements AIClient {
    private client: GoogleGenerativeAI;
    private model: string;

    constructor(config: AIConfig) {
        this.client = new GoogleGenerativeAI(config.apiKey);
        this.model = config.model || "gemini-1.5-pro";
    }

    async generateJSON(prompt: string): Promise<any> {
        const model = this.client.getGenerativeModel({
            model: this.model,
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text);
    }

    async generateText(prompt: string): Promise<string> {
        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

class ClaudeClient implements AIClient {
    private client: Anthropic;
    private model: string;

    constructor(config: AIConfig) {
        this.client = new Anthropic({ apiKey: config.apiKey });
        this.model = config.model || "claude-3-5-sonnet-20241022";
    }

    async generateJSON(prompt: string): Promise<any> {
        // Claude doesn't have native JSON mode like OpenAI, but works well with prompt engineering
        // ensuring prompt asks for JSON
        const result = await this.client.messages.create({
            model: this.model,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt + "\n\nReturn ONLY valid JSON." }]
        });

        const text = (result.content[0] as any).text;
        // Simple cleanup if markdown block is used
        const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanText);
    }

    async generateText(prompt: string): Promise<string> {
        const result = await this.client.messages.create({
            model: this.model,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        });
        return (result.content[0] as any).text;
    }
}

export function createAIClient(config?: AIConfig): AIClient {
    // Default to ENV variables if no config passed
    if (!config) {
        if (process.env.AZURE_OPENAI_API_KEY) {
            return new AzureClient({
                provider: 'azure',
                apiKey: process.env.AZURE_OPENAI_API_KEY,
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME
            });
        }
        // Fallback or other env checks could go here
        throw new Error("No AI credentials provided");
    }

    switch (config.provider) {
        case 'azure': return new AzureClient(config);
        case 'openai': return new OpenAIClient(config);
        case 'gemini': return new GeminiClient(config);
        case 'claude': return new ClaudeClient(config);
        default: throw new Error(`Unknown provider: ${config.provider}`);
    }
}
