"use client";

import { motion } from "framer-motion";

interface AnalysisProgressProps {
    iteration: number;
    maxIterations: number;
    currentScore: number;
    status: 'analyzing' | 'optimizing' | 'complete';
}

export function AnalysisProgress({ iteration, maxIterations, currentScore, status }: AnalysisProgressProps) {
    const progress = (iteration / maxIterations) * 100;

    const statusMessages = {
        analyzing: 'Analyzing your resume...',
        optimizing: `Optimizing for higher ATS score (Pass ${iteration}/${maxIterations})`,
        complete: 'Optimization complete!'
    };

    return (
        <div className="glass-panel flex-col flex-center" style={{ padding: '3rem', gap: '2rem' }}>
            {/* Animated Circle */}
            <div style={{ position: 'relative', width: 150, height: 150 }}>
                <svg width={150} height={150} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                        cx={75}
                        cy={75}
                        r={65}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={8}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={75}
                        cy={75}
                        r={65}
                        stroke="var(--accent-primary)"
                        strokeWidth={8}
                        fill="none"
                        strokeDasharray={408}
                        strokeDashoffset={408 - (progress / 100) * 408}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 408 }}
                        animate={{ strokeDashoffset: 408 - (progress / 100) * 408 }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>

                {/* Center content */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <motion.div
                        animate={{ rotate: status !== 'complete' ? 360 : 0 }}
                        transition={{ duration: 2, repeat: status !== 'complete' ? Infinity : 0, ease: "linear" }}
                        style={{ marginBottom: '0.5rem' }}
                    >
                        {status !== 'complete' ? (
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth={2}>
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                        ) : (
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </motion.div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {currentScore > 0 ? `${currentScore}%` : '...'}
                    </span>
                </div>
            </div>

            {/* Status text */}
            <div className="flex-col flex-center" style={{ gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {statusMessages[status]}
                </h3>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {status === 'optimizing' && currentScore < 90 && (
                        <>Current ATS Score: {currentScore}% — Target: 90%+</>
                    )}
                    {status === 'analyzing' && (
                        <>Extracting keywords and comparing with job requirements...</>
                    )}
                    {status === 'complete' && (
                        <>Your resume has been optimized for maximum ATS compatibility!</>
                    )}
                </p>
            </div>

            {/* Progress steps */}
            <div className="flex-row gap-2" style={{ marginTop: '1rem' }}>
                {Array.from({ length: maxIterations }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: i < iteration ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
