import { useState } from 'react';
import UploadPanel from '../components/Upload/Upload';
import Dashboard from '../components/Dashboard/Dashboard';
import { startStreamingAnalysis } from '../services/api';
import { Shield, Loader, FileSearch, Swords, FileText, CheckCircle } from 'lucide-react';
import './Home.css';

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Uploading Document', icon: FileText },
  { id: 'extracting', label: 'OCR & Text Extraction', icon: FileSearch },
  { id: 'debating', label: 'Agent Debate (3 Rounds)', icon: Swords },
  { id: 'report', label: 'Generating Report', icon: CheckCircle },
];

export default function HomePage() {
  const [analysis, setAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentStep, setCurrentStep] = useState('upload');
  const [streamText, setStreamText] = useState('');

  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisId(null);
    setStreamText('');
    setCurrentStep('upload');
    setStatusMessage('Uploading document...');

    try {
      const id = await startStreamingAnalysis(
        file,
        // onChunk
        (chunk) => {
          setCurrentStep('debating');
          setStatusMessage('AI agents are debating your contract...');
          setStreamText((prev) => prev + chunk);
        },
        // onComplete
        (result) => {
          setCurrentStep('report');
          setStatusMessage('Report generated!');
          // Brief delay so user sees "complete" step
          setTimeout(() => {
            setAnalysis(result);
            setIsAnalyzing(false);
            setStatusMessage('');
          }, 600);
        },
        // onError
        (err) => {
          console.error('Analysis error:', err);
          setStatusMessage(`Error: ${err.message}`);
          setIsAnalyzing(false);
        },
        // onStatus — pipeline phase updates from backend
        (phase, message) => {
          setCurrentStep(phase);
          setStatusMessage(message);
        }
      );

      setAnalysisId(id);
      setCurrentStep('extracting');
      setStatusMessage('Extracting text from document...');
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
    setCurrentStep('upload');
  };

  // Show dashboard if we have results
  if (analysis) {
    return <Dashboard analysis={analysis} analysisId={analysisId} onBack={handleBack} />;
  }

  const getStepState = (stepId) => {
    const stepOrder = PIPELINE_STEPS.map((s) => s.id);
    const currentIdx = stepOrder.indexOf(currentStep);
    const stepIdx = stepOrder.indexOf(stepId);

    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

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

            {/* Pipeline progress steps */}
            <div className="home-page__pipeline">
              {PIPELINE_STEPS.map((step, idx) => {
                const state = getStepState(step.id);
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className={`home-page__pipe-step home-page__pipe-step--${state}`}>
                    <div className="home-page__pipe-icon">
                      {state === 'done' ? (
                        <CheckCircle size={16} />
                      ) : state === 'active' ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <StepIcon size={16} />
                      )}
                    </div>
                    <span className="home-page__pipe-label">{step.label}</span>
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <div className={`home-page__pipe-line home-page__pipe-line--${state}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
