"use client";

import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";

interface ResumePreviewProps {
    content: string;
    keywords?: string[];
}

export function ResumePreview({ content, keywords = [] }: ResumePreviewProps) {
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

        // Setup dimensions
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 14;
        const contentWidth = pageWidth - (margin * 2);

        // Border
        doc.setDrawColor(80, 80, 80);
        doc.setLineWidth(0.4);
        doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);

        // Sanitize content
        let cleanContent = content.replace(/FORMAT:?\s*/i, '').trim();
        const lines = cleanContent.split('\n');

        // Settings
        const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
        let y = margin + 2;

        // Helper to check for page break
        const checkPageBreak = (neededSpace: number) => {
            if (y + neededSpace > pageHeight - margin) {
                doc.addPage();
                doc.setDrawColor(80, 80, 80);
                doc.setLineWidth(0.4);
                doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);
                y = margin + 4;
                return true;
            }
            return false;
        };

        // Render line with highlights
        const renderTextWithHighlights = (text: string, x: number, fontSize: number, isBold: boolean = false, maxWidth: number = contentWidth) => {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");

            // 1. Split text into words to wrap
            // Basic text wrapping manual implementation to support highlights
            const words = text.split(/\s+/);
            let currentLine: string[] = [];
            let currentLineWords: string[] = []; // for keeping track of original words

            words.forEach((word) => {
                const testLine = [...currentLine, word].join(' ');
                const testWidth = doc.getTextWidth(testLine);

                if (testWidth > maxWidth && currentLine.length > 0) {
                    // Render current line
                    renderLineSegments(currentLine, x, y, fontSize, isBold);
                    y += (fontSize / 72 * 25.4) * 1.3; // Line height
                    checkPageBreak(5);
                    currentLine = [word];
                } else {
                    currentLine.push(word);
                }
            });

            if (currentLine.length > 0) {
                renderLineSegments(currentLine, x, y, fontSize, isBold);
                y += (fontSize / 72 * 25.4) * 1.3;
            }
        };

        const renderLineSegments = (words: string[], x: number, lineY: number, fontSize: number, isBold: boolean) => {
            let currentX = x;
            words.forEach((word, i) => {
                const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const isKeyword = keywordSet.has(cleanWord) && cleanWord.length > 2;

                doc.setFont("helvetica", isBold ? "bold" : "normal");
                const wordWidth = doc.getTextWidth(word);

                if (isKeyword && !isBold) { // Don't highlight headers
                    doc.setFillColor(224, 231, 255); // Light indigo
                    doc.rect(currentX, lineY - (fontSize / 72 * 25.4) + 1, wordWidth + 1, (fontSize / 72 * 25.4), 'F');
                    doc.setTextColor(79, 70, 229); // Indigo 600
                    doc.setFont("helvetica", "bold");
                } else {
                    doc.setTextColor(isBold ? 0 : 30);
                }

                doc.text(word, currentX, lineY);
                currentX += wordWidth + doc.getTextWidth(' ');

                // Reset color
                doc.setTextColor(30);
            });
        };

        // Process Content
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                y += 2;
                return;
            }

            const isHeader = /^[A-Z][A-Z\s]+$/.test(trimmedLine) && trimmedLine.length > 2 && trimmedLine.length < 40;
            const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');
            const isContactLine = (trimmedLine.includes('@') || trimmedLine.includes('|')) && index < 3;
            const isName = index === 0 && !isHeader && !isContactLine;

            checkPageBreak(10);

            if (isName) {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0);
                const textWidth = doc.getTextWidth(trimmedLine);
                doc.text(trimmedLine, (pageWidth - textWidth) / 2, y);
                y += 6;
            } else if (isContactLine) {
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(60, 60, 60);
                const textWidth = doc.getTextWidth(trimmedLine);
                doc.text(trimmedLine, (pageWidth - textWidth) / 2, y);
                y += 6;
            } else if (isHeader) {
                y += 3;
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text(trimmedLine, margin, y);
                // Underline
                doc.setDrawColor(100, 100, 100);
                doc.setLineWidth(0.2);
                doc.line(margin, y + 1, pageWidth - margin, y + 1);
                y += 6;
            } else if (isBullet) {
                // Handle bullets
                const bulletContent = trimmedLine.replace(/^[•-]\s*/, '');
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text('•', margin, y);
                renderTextWithHighlights(bulletContent, margin + 4, 9, false, contentWidth - 4);
            } else {
                renderTextWithHighlights(trimmedLine, margin, 9, false, contentWidth);
            }
        });

        doc.save('optimized_resume.pdf');
    };

    // Highlight keywords for Preview (HTML)
    const highlightText = (text: string) => {
        if (!keywords || keywords.length === 0) return text;
        const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
        const words = text.split(/(\s+)/);
        return words.map((word, i) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (keywordSet.has(cleanWord) && cleanWord.length > 2) {
                return (
                    <span key={i} style={{
                        background: 'rgba(99, 102, 241, 0.3)',
                        padding: '0 2px',
                        borderRadius: '2px',
                        fontWeight: 600,
                        color: '#a5b4fc'
                    }}>
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    const cleanContent = content.replace(/FORMAT:?\s*/i, '').trim();
    const lines = cleanContent.split('\n');

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

            {/* Resume Preview */}
            <div style={{
                border: '2px solid #444',
                borderRadius: '6px',
                background: '#0d0d12',
                padding: '1.25rem',
                maxHeight: '550px',
                overflowY: 'auto',
                fontFamily: 'Arial, sans-serif'
            }}>
                {lines.map((line, index) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <div key={index} style={{ height: '6px' }} />;

                    const isHeader = /^[A-Z][A-Z\s]+$/.test(trimmedLine) && trimmedLine.length > 2 && trimmedLine.length < 40;
                    const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-');
                    const isContactLine = (trimmedLine.includes('@') || trimmedLine.includes('|')) && index < 3;
                    const isName = index === 0 && !isHeader && !isContactLine;

                    if (isName) {
                        return (
                            <h1 key={index} style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0 0 2px 0' }}>
                                {trimmedLine}
                            </h1>
                        );
                    }
                    if (isContactLine) {
                        return (
                            <p key={index} style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', margin: '0 0 8px 0', paddingBottom: '6px', borderBottom: '1px solid #333' }}>
                                {trimmedLine}
                            </p>
                        );
                    }
                    if (isHeader) {
                        return (
                            <h2 key={index} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '10px 0 4px 0', paddingBottom: '2px', borderBottom: '1px solid #333' }}>
                                {trimmedLine}
                            </h2>
                        );
                    }
                    if (isBullet) {
                        return (
                            <p key={index} style={{ fontSize: '0.75rem', color: '#e5e7eb', margin: '2px 0', paddingLeft: '8px', lineHeight: 1.35 }}>
                                {highlightText(trimmedLine)}
                            </p>
                        );
                    }
                    return (
                        <p key={index} style={{ fontSize: '0.75rem', color: '#e5e7eb', margin: '2px 0', lineHeight: 1.35 }}>
                            {highlightText(trimmedLine)}
                        </p>
                    );
                })}
            </div>

            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Check size={16} color="#10b981" />
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#10b981' }}>Single-page ATS format</strong> — Impactful, keyword-optimized
                </span>
            </div>
        </div>
    );
}
