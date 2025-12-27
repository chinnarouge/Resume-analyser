"use client";

import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";

interface CoverLetterPreviewProps {
    content: string;
}

export function CoverLetterPreview({ content }: CoverLetterPreviewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        doc.setFont("times", "normal");

        const lines = content.split('\n');
        let y = 25;

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                y += 4;
                return;
            }

            // Check for headers/special lines
            const isSubject = trimmedLine.toLowerCase().startsWith('subject:') || trimmedLine.toLowerCase().startsWith('application for');
            const isGreeting = trimmedLine.toLowerCase().startsWith('dear ');
            const isSignOff = trimmedLine.toLowerCase().includes('regards') || trimmedLine.toLowerCase().includes('sincerely');

            if (isSubject) {
                doc.setFontSize(11);
                doc.setFont("times", "bold");
                y += 4;
            } else if (isGreeting || isSignOff) {
                doc.setFontSize(11);
                doc.setFont("times", "normal");
                y += 2;
            } else {
                doc.setFontSize(11);
                doc.setFont("times", "normal");
            }

            doc.setTextColor(30, 30, 30);
            const wrappedLines = doc.splitTextToSize(trimmedLine, contentWidth);
            wrappedLines.forEach((wl: string) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(wl, margin, y);
                y += 5;
            });
        });

        doc.save('cover_letter.pdf');
    };

    const paragraphs = content.split('\n\n').filter(p => p.trim());

    return (
        <div className="flex-col gap-3">
            {/* Buttons */}
            <div className="flex-row gap-2" style={{ justifyContent: 'flex-end' }}>
                <button className="btn-secondary flex-center gap-2" onClick={handleCopy} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <button className="btn-primary flex-center gap-2" onClick={handleDownloadPDF} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    <Download size={14} /> Download PDF
                </button>
            </div>

            {/* Cover Letter Preview */}
            <div style={{
                border: '1px solid #333',
                borderRadius: '8px',
                background: '#fafafa',
                padding: '2rem',
                maxHeight: '550px',
                overflowY: 'auto',
                fontFamily: 'Georgia, Times, serif',
                color: '#1a1a1a'
            }}>
                {paragraphs.map((para, index) => {
                    const lines = para.split('\n');
                    const isHeader = index === 0;
                    const isSubject = para.toLowerCase().includes('subject:') || para.toLowerCase().includes('application for');

                    return (
                        <div key={index} style={{ marginBottom: '1rem' }}>
                            {lines.map((line, i) => {
                                const isGreeting = line.toLowerCase().startsWith('dear ');
                                const isSignOff = line.toLowerCase().includes('regards') || line.toLowerCase().includes('sincerely');

                                return (
                                    <p key={i} style={{
                                        margin: isHeader ? '0.25rem 0' : '0.5rem 0',
                                        fontSize: isHeader ? '0.9rem' : '1rem',
                                        fontWeight: isSubject || isGreeting ? 600 : 400,
                                        lineHeight: isHeader ? 1.4 : 1.7,
                                        textAlign: isSignOff ? 'left' : 'left'
                                    }}>
                                        {line}
                                    </p>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
                <Check size={16} color="#6366f1" />
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#6366f1' }}>Tailored Cover Letter</strong> — Professional tone, no clichés, ready to send
                </span>
            </div>
        </div>
    );
}
