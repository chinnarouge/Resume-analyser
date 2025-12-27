"use client";

import { useState, useEffect } from "react";
import { Settings, ChevronDown, ChevronUp, Save, Eye, EyeOff } from "lucide-react";
import { AIConfig, AIProvider } from "@/app/lib/types";

interface APIConfigPanelProps {
    onConfigChange: (config: AIConfig | undefined) => void;
}

export function APIConfigPanel({ onConfigChange }: APIConfigPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [provider, setProvider] = useState<AIProvider>('azure');
    const [apiKey, setApiKey] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [deployment, setDeployment] = useState('');
    const [model, setModel] = useState('');
    const [showKey, setShowKey] = useState(false);

    // Load saved config on mount
    useEffect(() => {
        const saved = localStorage.getItem('res_web_ai_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                setProvider(config.provider);
                setApiKey(config.apiKey);
                setEndpoint(config.endpoint || '');
                setDeployment(config.deployment || '');
                setModel(config.model || '');
                onConfigChange(config);
            } catch (e) {
                console.error("Failed to parse saved config", e);
            }
        }
    }, []);

    const handleSave = () => {
        const config: AIConfig = {
            provider,
            apiKey,
            endpoint: provider === 'azure' ? endpoint : undefined,
            deployment: provider === 'azure' ? deployment : undefined,
            model: provider !== 'azure' ? model : undefined
        };

        // Validate
        if (!apiKey) {
            alert("API Key is required");
            return;
        }
        if (provider === 'azure' && (!endpoint || !deployment)) {
            alert("Azure requires Endpoint and Deployment Name");
            return;
        }

        localStorage.setItem('res_web_ai_config', JSON.stringify(config));
        onConfigChange(config);
        setIsOpen(false);
    };

    const handleClear = () => {
        localStorage.removeItem('res_web_ai_config');
        setApiKey('');
        setEndpoint('');
        setDeployment('');
        setModel('');
        onConfigChange(undefined);
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem', width: '100%' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex-row items-center gap-2 w-full"
                style={{ justifyContent: 'space-between', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
                <div className="flex-row items-center gap-2">
                    <Settings size={18} />
                    <span style={{ fontWeight: 600 }}>AI Provider Settings</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOpen && (
                <div className="flex-col gap-3 animate-fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>

                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider</label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as AIProvider)}
                            style={{
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        >
                            <option value="azure">Azure OpenAI (Default)</option>
                            <option value="openai">OpenAI (GPT-4/3.5)</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="claude">Anthropic Claude</option>
                        </select>
                    </div>

                    <div className="flex-col gap-1">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>API Key</label>
                        <div className="flex-row gap-2">
                            <input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter API Key"
                                style={{
                                    flex: 1,
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {provider === 'azure' && (
                        <>
                            <div className="flex-col gap-1">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Endpoint URL</label>
                                <input
                                    type="text"
                                    value={endpoint}
                                    onChange={(e) => setEndpoint(e.target.value)}
                                    placeholder="https://your-resource.openai.azure.com/"
                                    style={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div className="flex-col gap-1">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deployment Name</label>
                                <input
                                    type="text"
                                    value={deployment}
                                    onChange={(e) => setDeployment(e.target.value)}
                                    placeholder="e.g. gpt-4"
                                    style={{
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {provider !== 'azure' && (
                        <div className="flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model Name (Optional)</label>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder={
                                    provider === 'openai' ? "gpt-4o" :
                                        provider === 'gemini' ? "gemini-1.5-pro" :
                                            "claude-3-5-sonnet-20241022"
                                }
                                style={{
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    <div className="flex-row gap-2" style={{ marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleClear}
                            className="btn-secondary"
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary flex-row items-center gap-2"
                            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                        >
                            <Save size={14} /> Save Settings
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}
