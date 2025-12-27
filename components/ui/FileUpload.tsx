"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    acceptedFormats?: string; // ".pdf,.docx"
}

export function FileUpload({ onFileSelect, acceptedFormats = ".pdf,.docx" }: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragOver(true);
        } else if (e.type === "dragleave") {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setFileName(file.name);
        onFileSelect(file);
    };

    return (
        <div
            className={`glass-panel flex-col flex-center`}
            style={{
                flex: 1,
                height: '100%',
                padding: '2rem',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: isDragOver ? 'var(--accent-primary)' : 'var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={acceptedFormats}
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            {fileName ? (
                <div className="flex-col flex-center animate-fade-in">
                    <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>{fileName}</p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Click or drop to replace</p>
                </div>
            ) : (
                <div className="flex-col flex-center">
                    <Upload size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Drag & Drop your Resume</p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>PDF or Word Documents</p>
                </div>
            )}
        </div>
    );
}
