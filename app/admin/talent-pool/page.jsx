'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { get, post } from '../../../lib/api';
import { SENIORITY_LABELS } from '../../../lib/talentClassification';

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value ?? '—'}</div>
    </div>
  );
}

/** Dependency-free horizontal bar row — width scaled against the largest
 * count in the set, consistent with the plain-CSS look of the rest of the
 * admin UI (no charting library). */
function BarRow({ label, count, maxCount, href }) {
  const pct = maxCount > 0 ? Math.max(4, Math.round((count / maxCount) * 100)) : 0;
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div style={{ width: 200, flexShrink: 0, fontSize: 13, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ flex: 1, background: 'var(--color-bg)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 4 }} />
      </div>
      <div style={{ width: 32, textAlign: 'right', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{count}</div>
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{content}</Link>
  ) : content;
}

export default function TalentPoolPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await get('/admin/talent-pool');
      setStats(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClassifyAll() {
    setClassifying(true);
    setClassifyResult(null);
    try {
      const res = await post('/admin/holders/classify-bulk', { all_unclassified: true });
      setClassifyResult(res.data);
      await load();
    } catch (err) {
      setClassifyResult({ error: err.message || 'Bulk classification failed' });
    } finally {
      setClassifying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-center"><span className="spinner spinner-lg" /></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Failed to load talent pool: {error?.message || 'Unknown error'}</div>
      </div>
    );
  }

  const maxIndustry = Math.max(0, ...stats.by_industry.map((r) => r.count));
  const maxSeniority = Math.max(0, ...stats.by_seniority.map((r) => r.count));
  const maxExpertise = Math.max(0, ...stats.top_expertise_areas.map((r) => r.count));
  const coverage = stats.total_holders > 0 ? Math.round((stats.classified_holders / stats.total_holders) * 100) : 0;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Talent Pool</h1>
          <p className="page-subtitle">AI-derived industry, expertise, and seniority breakdown of the jobseeker pool</p>
        </div>
        {stats.unclassified_holders > 0 && (
          <button className="btn btn-primary" onClick={handleClassifyAll} disabled={classifying}>
            {classifying ? 'Classifying…' : `🤖 Classify ${Math.min(stats.unclassified_holders, 30)} unclassified holder(s)`}
          </button>
        )}
      </div>

      {classifyResult && (
        <div className={`alert ${classifyResult.error ? 'alert-error' : ''}`} style={{ marginBottom: 20 }}>
          {classifyResult.error
            ? classifyResult.error
            : `Classified ${classifyResult.classified.length} holder(s)${classifyResult.failed.length ? `, ${classifyResult.failed.length} failed` : ''}.`}
        </div>
      )}

      <div className="stats-grid">
        <StatCard label="Jobseekers" value={stats.total_holders} color="var(--color-primary)" />
        <StatCard label="Classified" value={stats.classified_holders} color="var(--color-success)" />
        <StatCard label="Unclassified" value={stats.unclassified_holders} color={stats.unclassified_holders > 0 ? 'var(--color-pending)' : undefined} />
        <StatCard label="Coverage" value={`${coverage}%`} />
      </div>

      <div className="grid-2" style={{ marginTop: 4 }}>
        <div className="card">
          <div className="card-header"><h2 className="card-title">By Industry</h2></div>
          {stats.by_industry.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No classified holders yet.</p>
          ) : (
            stats.by_industry.map((r) => (
              <BarRow
                key={r.industry}
                label={r.industry}
                count={r.count}
                maxCount={maxIndustry}
                href={`/admin/holders?industry=${encodeURIComponent(r.industry)}`}
              />
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">By Seniority</h2></div>
          {stats.by_seniority.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No classified holders yet.</p>
          ) : (
            stats.by_seniority.map((r) => (
              <BarRow
                key={r.seniority_level}
                label={SENIORITY_LABELS[r.seniority_level] || r.seniority_level}
                count={r.count}
                maxCount={maxSeniority}
                href={`/admin/holders?seniority_level=${encodeURIComponent(r.seniority_level)}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2 className="card-title">Top Expertise Areas</h2></div>
        {stats.top_expertise_areas.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No classified holders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stats.top_expertise_areas.map((r) => (
              <Link
                key={r.expertise_area}
                href={`/admin/holders?expertise_area=${encodeURIComponent(r.expertise_area)}`}
                className="pill"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)', textDecoration: 'none', fontSize: `${Math.min(16, 12 + (r.count / maxExpertise) * 4)}px` }}
              >
                {r.expertise_area} · {r.count}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
