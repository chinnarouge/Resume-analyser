export interface AnalysisResult {
    matchPercentage: number;
    atsScore: number;
    keywords: {
        present: string[];
        missing: string[];
    };
    suggestions: {
        modifications: Modification[];
        restructuring: RestructuringSuggestion[];
    };
    optimizedResume?: string;
    coverLetter?: string;
}

export interface Modification {
    id: string;
    originalText: string;
    suggestedText: string;
    reason: string;
}

export interface RestructuringSuggestion {
    id: string;
    title: string;
    description: string;
    type: 'add' | 'remove' | 'reorder' | 'move';
}

export interface AnalyzeRequest {
    jobDescription: string;
    resumeText?: string;
}

export type AIProvider = 'azure' | 'openai' | 'gemini' | 'claude';

export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    endpoint?: string; // For Azure
    deployment?: string; // For Azure
    model?: string; // For OpenAI/Claude/Gemini
}
