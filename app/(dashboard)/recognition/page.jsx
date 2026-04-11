'use client';

import { useState, useEffect } from 'react';
import { useUser, useRecognition } from '../../../lib/hooks';
import RecognitionMatrix from '../../../components/RecognitionMatrix';
import JurisdictionSelector from '../../../components/JurisdictionSelector';
import { post, get } from '../../../lib/api';

const LEGEND = [
  { cls: 'bg-green-100 text-green-700', label: 'Recognised'    },
  { cls: 'bg-amber-100 text-amber-700', label: 'Partial'       },
  { cls: 'bg-red-100 text-red-700',     label: 'Not Recognised' },
  { cls: 'bg-blue-100 text-blue-700',   label: 'Pending'       },
];

function EvaluateModal({ isOpen, onClose, holderId }) {
  const [jurisdictionId, setJurisdictionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const data = await get(`/recognition/jobs/${jobId}`);
        setJobStatus(data);
        if (data.status === 'completed' || data.status === 'failed') clearInterval(interval);
      } catch (err) {
        setJobStatus({ status: 'error', message: err.message });
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  async function handleEvaluate(e) {
    e.preventDefault();
    if (!jurisdictionId) { setError('Please select a jurisdiction'); return; }
    setError('');
    setLoading(true);
    setJobStatus(null);
    try {
      const data = await post('/recognition/evaluate', {
        holder_id: holderId,
        target_jurisdiction_id: jurisdictionId,
      });
      setJobId(data.job_id || data.jobId || data.id);
      setJobStatus({ status: 'queued' });
    } catch (err) {
      setError(err.message || 'Failed to start evaluation');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setJurisdictionId('');
    setJobId(null);
    setJobStatus(null);
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Evaluate Recognition</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer">✕</button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 mb-5">
            Trigger a cross-jurisdiction recognition evaluation for all your credentials against a target jurisdiction.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!jobId ? (
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Jurisdiction <span className="text-red-500">*</span>
                </label>
                <JurisdictionSelector value={jurisdictionId} onChange={setJurisdictionId} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button" onClick={handleClose} disabled={loading}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting…
                    </>
                  ) : 'Run Evaluation'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                <div className="text-xs font-semibold text-gray-500 mb-1.5">Job ID</div>
                <code className="text-xs font-mono text-gray-700">{jobId}</code>
              </div>

              {jobStatus && (
                <>
                  {(jobStatus.status === 'queued' || jobStatus.status === 'processing') && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
                      Status: <strong>{jobStatus.status === 'queued' ? 'Queued' : 'Processing…'}</strong>
                    </div>
                  )}
                  {jobStatus.status === 'completed' && (
                    <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                      ✓ Evaluation completed. Refresh to see updated recognition statuses.
                    </div>
                  )}
                  {(jobStatus.status === 'failed' || jobStatus.status === 'error') && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      Evaluation {jobStatus.status}: {jobStatus.message || 'Check logs for details'}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecognitionPage() {
  const { user, isLoading: userLoading } = useUser();
  const holderId = user?._id || user?.id || user?.sub;
  const { matrix, isLoading, error, mutate } = useRecognition(holderId, null);
  const [evalOpen, setEvalOpen] = useState(false);

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
        Failed to load recognition data: {error.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cross-Jurisdiction Recognition</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            See how your credentials are recognised across different jurisdictions worldwide
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => mutate()}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Refresh
          </button>
          <button
            onClick={() => setEvalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer"
          >
            Trigger Evaluation
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Legend:</span>
        {LEGEND.map(({ cls, label }) => (
          <span key={label} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
            {label}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-1">— Not evaluated</span>
      </div>

      {/* Matrix or empty */}
      {!matrix || matrix.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recognition data yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Trigger an evaluation to see how your credentials are recognised in other jurisdictions.
          </p>
          <button
            onClick={() => setEvalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer"
          >
            Trigger First Evaluation
          </button>
        </div>
      ) : (
        <RecognitionMatrix matrix={matrix} />
      )}

      <EvaluateModal
        isOpen={evalOpen}
        onClose={() => { setEvalOpen(false); mutate(); }}
        holderId={holderId}
      />
    </div>
  );
}
