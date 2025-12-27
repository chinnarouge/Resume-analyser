import { RestructuringSuggestion } from "@/app/lib/types";
import { Layout } from "lucide-react";

interface RestructuringCardProps {
    suggestion: RestructuringSuggestion;
}

export function RestructuringCard({ suggestion }: RestructuringCardProps) {
    const getBorderColor = () => {
        switch (suggestion.type) {
            case 'add': return 'var(--success)';
            case 'remove': return 'var(--error)';
            case 'reorder': return 'var(--warning)';
            default: return 'var(--accent-primary)';
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', borderLeft: `4px solid ${getBorderColor()}` }}>
            <div className="flex-row flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-card)' }}>
                    <Layout size={24} color={getBorderColor()} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{suggestion.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{suggestion.description}</p>
                </div>
            </div>
        </div>
    );
}
