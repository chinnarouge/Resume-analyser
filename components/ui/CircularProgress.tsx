"use client";

import { motion } from "framer-motion";

interface CircularProgressProps {
    value: number;
    label: string;
    color?: string;
    size?: number;
}

export function CircularProgress({ value, label, color = "#6366f1", size = 120 }: CircularProgressProps) {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex-col flex-center" style={{ gap: '1rem' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                {/* Background Circle */}
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference} // Start empty
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)'
                }}>
                    {Math.round(value)}%
                </div>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        </div>
    );
}
