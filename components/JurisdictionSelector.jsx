'use client';

import { useJurisdictions } from '../lib/hooks';

export default function JurisdictionSelector({ value, onChange, multiple, placeholder, style }) {
  const { jurisdictions, isLoading } = useJurisdictions();

  if (multiple) {
    return (
      <select
        multiple
        className="form-input"
        value={Array.isArray(value) ? value : value ? [value] : []}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
          onChange(selected);
        }}
        disabled={isLoading}
        style={{ minHeight: 100, ...style }}
      >
        {isLoading ? (
          <option disabled>Loading jurisdictions…</option>
        ) : (
          jurisdictions.map((j) => (
            <option key={j._id || j.id} value={j._id || j.id}>
              {j.country_code} — {j.country_name}
            </option>
          ))
        )}
      </select>
    );
  }

  return (
    <select
      className="form-input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      style={style}
    >
      <option value="">{isLoading ? 'Loading…' : (placeholder || 'All jurisdictions')}</option>
      {!isLoading &&
        jurisdictions.map((j) => (
          <option key={j._id || j.id} value={j._id || j.id}>
            {j.country_code} — {j.country_name}
          </option>
        ))}
    </select>
  );
}
