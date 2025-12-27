"use client";

import { Modification } from "@/app/lib/types";
import { ArrowRight, Check, RotateCcw } from "lucide-react";

interface SuggestionCardProps {
    modification: Modification;
    onAccept: (id: string) => void;
    onReject?: (id: string) => void; // Optional if we just want to accept/ignore
}

export function SuggestionCard({ modification, onAccept }: SuggestionCardProps) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div className="flex-row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
                <div className="w-full">
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Reason: {modification.reason}
                    </h4>

                    <div className="grid-2" style={{ gap: '2rem', marginTop: '1rem' }}>
                        {/* Original */}
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--error)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Original</p>
                            <p>{modification.originalText}</p>
                        </div>

                        {/* Suggested */}
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Suggested</p>
                            <p>{modification.suggestedText}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-col" style={{ gap: '0.5rem', minWidth: '120px' }}>
                    <button
                        className="btn-primary flex-center gap-2"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--success)', boxShadow: 'none' }}
                        onClick={() => onAccept(modification.id)}
                    >
                        <Check size={16} /> Accept
                    </button>
                    {/* A regenerate button could go here if we implemented individual regeneration */}
                </div>
            </div>
        </div>
    );
}
