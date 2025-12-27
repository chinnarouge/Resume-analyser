"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { KeywordBadge } from "@/components/ui/KeywordBadge";
import { SuggestionCard } from "@/components/ui/SuggestionCard";
import { RestructuringCard } from "@/components/ui/RestructuringCard";
import { ResumePreview } from "@/components/ui/ResumePreview";
import { CoverLetterPreview } from "@/components/ui/CoverLetterPreview";
import { AnalysisProgress } from "@/components/ui/AnalysisProgress";
import { APIConfigPanel } from "@/components/ui/APIConfigPanel";
import { AnalysisResult, AIConfig } from "@/app/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RefreshCw, AlertCircle, Sparkles, Send, FileText } from "lucide-react";

interface ProgressState {
  iteration: number;
  maxIterations: number;
  currentScore: number;
  status: 'analyzing' | 'optimizing' | 'complete';
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [activeTab, setActiveTab] = useState<'modifications' | 'restructuring' | 'resume' | 'coverLetter'>('resume');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | undefined>(undefined);

  const handleAnalyze = async () => {
    if (!jobDescription) {
      setError("Please provide a job description.");
      return;
    }
    if (!file && !resumeText) {
      setError("Please upload a resume or paste resume text.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setProgress({ iteration: 1, maxIterations: 5, currentScore: 0, status: 'analyzing' });

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      if (file) {
        formData.append("file", file);
      } else if (resumeText) {
        formData.append("text", resumeText);
      }
      formData.append("includeCoverLetter", includeCoverLetter.toString());
      if (aiConfig) {
        formData.append("aiConfig", JSON.stringify(aiConfig));
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      setProgress({ iteration: 5, maxIterations: 5, currentScore: data.atsScore, status: 'complete' });

      // Small delay to show completion state
      setTimeout(() => {
        setIsLoading(false);
        setProgress(null);
      }, 1000);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleAcceptModification = (id: string) => {
    if (!analysisResult) return;
    const newModifications = analysisResult.suggestions.modifications.filter(m => m.id !== id);
    setAnalysisResult({
      ...analysisResult,
      suggestions: {
        ...analysisResult.suggestions,
        modifications: newModifications
      }
    });
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim() || !analysisResult?.optimizedResume) return;

    setIsRefining(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentResume: analysisResult.optimizedResume,
          feedback: refinementPrompt,
          jobDescription: jobDescription,
          aiConfig: aiConfig
        }),
      });

      if (!response.ok) throw new Error("Refinement failed");

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      setRefinementPrompt("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefining(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResumeText("");
    setJobDescription("");
    setAnalysisResult(null);
    setError(null);
    setProgress(null);
    setActiveTab('resume');
    setRefinementPrompt("");
  };

  return (
    <main className="container">
      <header className="flex-row flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div className="flex-row flex-center gap-2">
          <Sparkles size={32} color="var(--accent-primary)" />
          <h1 className="title-gradient" style={{ fontSize: '2rem' }}>Resume ATS Analyzer</h1>
        </div>
        {analysisResult && (
          <button onClick={reset} className="btn-secondary flex-center gap-2">
            <RefreshCw size={16} /> New Analysis
          </button>
        )}
      </header>

      {/* AI Settings Panel */}
      <div style={{ marginBottom: '2rem' }}>
        <APIConfigPanel onConfigChange={setAiConfig} />
      </div>

      <AnimatePresence mode="wait">
        {isLoading && progress ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <AnalysisProgress {...progress} />
          </motion.div>
        ) : !analysisResult ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Equal sized input grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Left Column: Job Description */}
              <div className="flex-col" style={{ height: '400px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                  1. Job Description
                </h2>
                <textarea
                  className="glass-panel"
                  style={{
                    flex: 1,
                    width: '100%',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    padding: '1rem',
                    fontSize: '0.95rem',
                    resize: 'none',
                    borderRadius: '16px',
                    outline: 'none'
                  }}
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Right Column: Resume Input */}
              <div className="flex-col" style={{ height: '400px' }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>2. Your Resume</h2>
                  <div className="flex-row gap-2">
                    <button
                      onClick={() => setInputMode('upload')}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        background: inputMode === 'upload' ? 'var(--accent-primary)' : 'var(--glass-bg)',
                        color: inputMode === 'upload' ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => setInputMode('paste')}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        background: inputMode === 'paste' ? 'var(--accent-primary)' : 'var(--glass-bg)',
                        color: inputMode === 'paste' ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      Paste
                    </button>
                  </div>
                </div>

                {inputMode === 'upload' ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <FileUpload onFileSelect={setFile} />
                  </div>
                ) : (
                  <textarea
                    className="glass-panel"
                    style={{
                      flex: 1,
                      width: '100%',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      padding: '1rem',
                      fontSize: '0.95rem',
                      resize: 'none',
                      borderRadius: '16px',
                      outline: 'none'
                    }}
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Options */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <label className="flex-row items-center gap-2" style={{ cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={includeCoverLetter}
                  onChange={(e) => setIncludeCoverLetter(e.target.checked)}
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Generate Tailored Cover Letter</span>
              </label>
            </div>

            {/* Analyze Button */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              {(file || resumeText) && jobDescription && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="btn-primary flex-center gap-2"
                  style={{ fontSize: '1.25rem', padding: '1rem 3rem' }}
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  <Sparkles size={20} /> Optimize Resume
                </motion.button>
              )}
            </div>

            {error && (
              <div className="glass-panel flex-center gap-2" style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '1rem', marginTop: '1rem' }}>
                <AlertCircle size={20} /> {error}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-col gap-4"
          >
            {/* Top Stats */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                <div className="flex-row flex-center" style={{ justifyContent: 'space-around' }}>
                  <CircularProgress value={analysisResult.matchPercentage} label="Match Score" color="var(--accent-primary)" />
                  <CircularProgress value={analysisResult.atsScore} label="ATS Score" color={analysisResult.atsScore >= 90 ? "var(--success)" : "var(--warning)"} />
                </div>

                <div className="flex-col gap-4">
                  <div>
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Keywords Present</h3>
                    <div className="flex-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      {analysisResult.keywords.present.map(k => (
                        <KeywordBadge key={k} label={k} type="present" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Missing Keywords</h3>
                    <div className="flex-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      {analysisResult.keywords.missing.map(k => (
                        <KeywordBadge key={k} label={k} type="missing" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ marginTop: '1rem' }}>
              <div className="flex-row" style={{ borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem', gap: '2rem' }}>
                <button
                  onClick={() => setActiveTab('resume')}
                  style={{
                    background: 'none', border: 'none',
                    color: activeTab === 'resume' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === 'resume' ? '2px solid var(--accent-primary)' : 'none',
                    paddingBottom: '0.5rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  ✨ Optimized Resume
                </button>
                <button
                  onClick={() => setActiveTab('modifications')}
                  style={{
                    background: 'none', border: 'none',
                    color: activeTab === 'modifications' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === 'modifications' ? '2px solid var(--accent-primary)' : 'none',
                    paddingBottom: '0.5rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Modifications ({analysisResult.suggestions.modifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('restructuring')}
                  style={{
                    background: 'none', border: 'none',
                    color: activeTab === 'restructuring' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === 'restructuring' ? '2px solid var(--accent-primary)' : 'none',
                    paddingBottom: '0.5rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Restructuring ({analysisResult.suggestions.restructuring.length})
                </button>
                {analysisResult.coverLetter && (
                  <button
                    onClick={() => setActiveTab('coverLetter')}
                    style={{
                      background: 'none', border: 'none',
                      color: activeTab === 'coverLetter' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === 'coverLetter' ? '2px solid var(--accent-primary)' : 'none',
                      paddingBottom: '0.5rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 500
                    }}
                  >
                    Cover Letter 📝
                  </button>
                )}
              </div>

              <div className="animate-fade-in">
                {activeTab === 'resume' && (
                  <div className="flex-col gap-3">
                    {analysisResult.optimizedResume ? (
                      <ResumePreview
                        content={analysisResult.optimizedResume}
                        keywords={[...analysisResult.keywords.present, ...analysisResult.keywords.missing]}
                      />
                    ) : (
                      <p style={{ color: 'var(--text-secondary)' }}>No optimized resume available.</p>
                    )}

                    {/* Refinement Input */}
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--glass-bg)',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        ✏️ Need changes? Describe what you want to modify:
                      </p>
                      <div className="flex-row gap-2">
                        <textarea
                          value={refinementPrompt}
                          onChange={(e) => setRefinementPrompt(e.target.value)}
                          placeholder="E.g., Add my Python certification, make the summary longer, emphasize leadership experience..."
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            resize: 'none',
                            minHeight: '60px'
                          }}
                        />
                        <button
                          onClick={handleRefine}
                          disabled={isRefining || !refinementPrompt.trim()}
                          className="btn-primary flex-center gap-2"
                          style={{
                            padding: '0.75rem 1.25rem',
                            opacity: isRefining || !refinementPrompt.trim() ? 0.5 : 1
                          }}
                        >
                          {isRefining ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                          {isRefining ? 'Refining...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'modifications' && (
                  <div className="flex-col gap-2">
                    {analysisResult.suggestions.modifications.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>All modifications have been applied to the optimized resume.</p>}
                    {analysisResult.suggestions.modifications.map(mod => (
                      <SuggestionCard key={mod.id} modification={mod} onAccept={handleAcceptModification} />
                    ))}
                  </div>
                )}
                {activeTab === 'restructuring' && (
                  <div className="flex-col gap-2">
                    {analysisResult.suggestions.restructuring.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No restructuring needed.</p>}
                    {analysisResult.suggestions.restructuring.map(res => (
                      <RestructuringCard key={res.id} suggestion={res} />
                    ))}
                  </div>
                )}
                {activeTab === 'coverLetter' && analysisResult.coverLetter && (
                  <CoverLetterPreview content={analysisResult.coverLetter} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
