interface KeywordBadgeProps {
    label: string;
    type: 'present' | 'missing';
}

export function KeywordBadge({ label, type }: KeywordBadgeProps) {
    return (
        <span className={`badge ${type === 'present' ? 'success' : 'error'}`}>
            {type === 'present' ? '✓' : '×'} {label}
        </span>
    );
}
