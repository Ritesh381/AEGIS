import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, X, Sparkles, Loader } from 'lucide-react';
import './Upload.css';

const SAMPLE_CONTRACT = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of January 15, 2025.

1. NON-COMPETE CLAUSE
Employee agrees not to engage in any business activity that competes with the Company, directly or indirectly, within a 100-mile radius of any Company office, for a period of 36 months following termination of employment, regardless of the reason for termination.

2. INTELLECTUAL PROPERTY ASSIGNMENT
All work product, inventions, discoveries, and creative works conceived by Employee during the term of employment, whether or not related to the Company's business, and whether created during or outside of working hours, shall be the sole and exclusive property of the Company.

3. AUTOMATIC RENEWAL
This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 90 days prior to the expiration of the then-current term. Failure to provide timely notice shall constitute agreement to all terms, including any salary adjustments determined solely by the Company.

4. INDEMNIFICATION
Employee shall indemnify, defend, and hold harmless the Company from any and all claims, damages, losses, and expenses (including attorneys' fees) arising from Employee's performance of duties under this Agreement, without limitation as to amount or duration.

5. TERMINATION
The Company may terminate this Agreement at any time, with or without cause, upon 7 days' written notice. Employee may terminate this Agreement upon 90 days' written notice. Upon termination by Employee, all unvested compensation, bonuses, and benefits shall be immediately forfeited.

6. ARBITRATION
Any dispute arising from this Agreement shall be resolved exclusively through binding arbitration administered by an arbitrator selected solely by the Company. The arbitration shall take place in the Company's home jurisdiction, and the Employee shall bear all costs of arbitration.

7. DATA COLLECTION
Employee consents to the Company's collection, storage, and analysis of all communications, browsing activity, location data, and biometric information obtained through company devices and systems, which may be shared with third-party partners at the Company's discretion.`;

export default function UploadPanel({ onAnalyze, isAnalyzing }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (file) {
      onAnalyze(file);
    }
  };

  const handleSampleContract = () => {
    const blob = new Blob([SAMPLE_CONTRACT], { type: 'text/plain' });
    const sampleFile = new File([blob], 'sample_employment_contract.txt', { type: 'text/plain' });
    setFile(sampleFile);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="upload-panel animate-fade-in-up">
      <div className="upload-panel__hero">
        <h1 className="upload-panel__title">
          Analyze Your <span className="text-gradient">Contract</span>
        </h1>
        <p className="upload-panel__desc">
          Upload any legal document and let our AI agents debate, identify risks, and generate actionable questions for you.
        </p>
      </div>

      <div
        className={`upload-zone glass-panel ${dragActive ? 'upload-zone--active' : ''} ${file ? 'upload-zone--has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        id="upload-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="upload-zone__input"
          accept=".pdf,.docx,.doc,.txt,.csv,.md,.png,.jpg,.jpeg,.webp,.gif"
          onChange={handleFileChange}
          id="file-input"
        />

        {!file ? (
          <div className="upload-zone__placeholder">
            <div className="upload-zone__icon-wrap">
              <UploadIcon size={32} />
            </div>
            <p className="upload-zone__label">
              Drop your contract here, or <span className="upload-zone__browse">browse</span>
            </p>
            <p className="upload-zone__formats">
              PDF, DOCX, TXT, CSV, Markdown, PNG, JPEG, WebP • Max 50MB
            </p>
          </div>
        ) : (
          <div className="upload-zone__file animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="upload-zone__file-info">
              <FileText size={24} className="upload-zone__file-icon" />
              <div>
                <p className="upload-zone__file-name truncate">{file.name}</p>
                <p className="upload-zone__file-size">{formatSize(file.size)}</p>
              </div>
            </div>
            <button
              className="upload-zone__file-remove"
              onClick={handleRemoveFile}
              disabled={isAnalyzing}
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="upload-panel__actions">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
          id="btn-analyze"
        >
          {isAnalyzing ? (
            <>
              <Loader size={18} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Contract
            </>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleSampleContract}
          disabled={isAnalyzing}
          id="btn-sample"
        >
          <FileText size={16} />
          Try Sample Contract
        </button>
      </div>
    </div>
  );
}
