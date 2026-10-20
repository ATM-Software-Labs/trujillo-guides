import React, { useRef, useState } from 'react';
import { ParseResult } from '../types';
import { normalizeBankCsv } from '../parsers/bankNormalizer';
import { formatCurrency } from '../utils/formatters';
import { useI18n } from '../utils/i18n';

interface UniversalDropzoneProps {
  parseResults: ParseResult[];
  onAddResults: (results: ParseResult[]) => void;
  onRemoveResult: (fileName: string) => void;
  onLoadDemo: () => void;
}

export const UniversalDropzone: React.FC<UniversalDropzoneProps> = ({
  parseResults,
  onAddResults,
  onRemoveResult,
  onLoadDemo
}) => {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'info'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    setNotice(null);
    const newResults: ParseResult[] = [];
    const updatedNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Verificación de tamaño razonable (máx 10 MB para un CSV)
      if (file.size > 10 * 1024 * 1024) {
        setNotice({
          type: 'error',
          message: `El archivo ${file.name} es demasiado pesado. Comprueba que sea un archivo de texto o CSV.`
        });
        continue;
      }

      try {
        const text = await file.text();
        const res = normalizeBankCsv(text, file.name);

        if (res.transactions.length === 0) {
          setNotice({
            type: 'error',
            message: t('step2.err_empty', { name: file.name })
          });
        } else {
          // Detectar si ya existía
          if (parseResults.some((p) => p.fileName === file.name)) {
            updatedNames.push(file.name);
          }
          newResults.push(res);
        }
      } catch (err) {
        console.error('Error procesando archivo:', err);
        setNotice({
          type: 'error',
          message: t('step2.err_read', { name: file.name })
        });
      }
    }

    if (newResults.length > 0) {
      onAddResults(newResults);
      if (updatedNames.length > 0) {
        setNotice({
          type: 'info',
          message: t('step2.warn_duplicate', { name: updatedNames.join(', ') })
        });
      }
    }
    setIsProcessing(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <section className="step-card" aria-labelledby="step2-title">
      <div className="step-badge-row">
        <span className="step-badge">{t('step2.badge')}</span>
        <h2 id="step2-title" className="step-title">
          {t('step2.title')}
        </h2>
      </div>

      <p className="step-description">{t('step2.desc')}</p>

      <div
        className={`dropzone-container ${isDragging ? 'is-dragging' : ''} ${isProcessing ? 'is-processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
        aria-label={t('step2.drop_prompt')}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.txt,text/csv,text/plain"
          className="sr-only"
          onChange={handleFileInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="dropzone-icon-box">
          <svg
            className="dropzone-svg"
            viewBox="0 0 24 24"
            width="36"
            height="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div className="dropzone-content">
          <p className="dropzone-title">
            {isProcessing ? (
              t('step2.processing')
            ) : (
              <>
                {t('step2.drop_prompt')}{' '}
                <span className="dropzone-link">{t('step2.select_files')}</span>
              </>
            )}
          </p>
          <p className="dropzone-subtitle">{t('step2.support_info')}</p>
        </div>

        <div className="dropzone-demo-action" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="demo-data-btn"
            onClick={onLoadDemo}
            title={t('step2.demo_sub')}
          >
            <svg
              className="tool-ic"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>{t('step2.demo_btn')}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`alert-box ${notice.type === 'error' ? 'alert-error' : 'alert-info'}`}
          role="alert"
        >
          <svg
            className="tool-ic"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{notice.message}</span>
        </div>
      )}

      {parseResults.length > 0 && (
        <div className="uploaded-files-list">
          <h3 className="uploaded-files-title">
            {t('step2.loaded_title')} ({parseResults.length})
          </h3>
          <div className="files-grid">
            {parseResults.map((res) => (
              <div key={res.fileName} className="file-chip-card">
                <div className="file-chip-top">
                  <div className="file-bank-badge">
                    <span className="bank-dot" aria-hidden="true" />
                    <strong>{res.bankName}</strong>
                  </div>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => onRemoveResult(res.fileName)}
                    title={`${t('step2.remove_file')}: ${res.fileName}`}
                    aria-label={`${t('step2.remove_file')} ${res.fileName}`}
                  >
                    <svg
                      className="tool-ic"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="file-chip-name" title={res.fileName}>
                  {res.fileName}
                </div>

                <div className="file-chip-stats">
                  <span>
                    {res.rowCount} {t('step2.movements')}
                  </span>
                  <span className="stat-separator">•</span>
                  <span className="stat-income">
                    +{formatCurrency(res.totalIncome, { hideCents: true })}
                  </span>
                  <span className="stat-separator">•</span>
                  <span className="stat-expense">
                    -{formatCurrency(res.totalExpense, { hideCents: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
