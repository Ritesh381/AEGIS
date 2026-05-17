import { useState, useRef } from 'react';
import UploadPanel from '../components/Upload/Upload';
import Dashboard from '../components/Dashboard/Dashboard';
import { startStreamingAnalysis } from '../services/api';
import { Shield, Loader } from 'lucide-react';
import './Home.css';

export default function HomePage() {
  const [analysis, setAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [streamText, setStreamText] = useState('');

  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisId(null);
    setStreamText('');
    setStatusMessage('Uploading document...');

    try {
      const id = await startStreamingAnalysis(
        file,
        // onChunk
        (chunk) => {
          setStatusMessage('AI agents are debating...');
          setStreamText((prev) => prev + chunk);
        },
        // onComplete
        (result) => {
          setAnalysis(result);
          setIsAnalyzing(false);
          setStatusMessage('');
        },
        // onError
        (err) => {
          console.error('Analysis error:', err);
          setStatusMessage(`Error: ${err.message}`);
          setIsAnalyzing(false);
        }
      );

      setAnalysisId(id);
      setStatusMessage('AI agents are analyzing your contract...');
    } catch (err) {
      console.error('Failed to start analysis:', err);
      setStatusMessage(`Error: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    setAnalysis(null);
    setAnalysisId(null);
    setStreamText('');
    setStatusMessage('');
  };

  // Show dashboard if we have results
  if (analysis) {
    return <Dashboard analysis={analysis} analysisId={analysisId} onBack={handleBack} />;
  }

  return (
    <div className="home-page">
      <UploadPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {/* Live analysis status */}
      {isAnalyzing && (
        <div className="home-page__status animate-fade-in">
          <div className="home-page__status-card glass-panel">
            <div className="home-page__status-header">
              <div className="home-page__status-pulse" />
              <Loader size={16} className="animate-spin" />
              <span className="home-page__status-text">{statusMessage}</span>
            </div>

            {streamText && (
              <div className="home-page__stream">
                <pre className="home-page__stream-text">{streamText.slice(-800)}</pre>
              </div>
            )}

            <div className="home-page__status-steps">
              <div className="home-page__step home-page__step--done">
                <span className="home-page__step-dot" />
                Upload Complete
              </div>
              <div className={`home-page__step ${statusMessage.includes('debating') || streamText ? 'home-page__step--active' : ''}`}>
                <span className="home-page__step-dot" />
                AI Debate in Progress
              </div>
              <div className="home-page__step">
                <span className="home-page__step-dot" />
                Generating Report
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
