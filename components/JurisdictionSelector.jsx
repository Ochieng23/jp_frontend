'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useJurisdictions } from '../lib/hooks';

function labelFor(j) {
  return `${j.country_name} (${j.country_code})`;
}

/** Single-select searchable country combobox. Type to filter, click or
 * Enter to choose. Backed by whatever jurisdictions actually exist server-side
 * (real _ids), not a hardcoded list, so a selection is always valid. */
export default function JurisdictionSelector({ value, onChange, multiple, placeholder, style }) {
  const { jurisdictions, isLoading } = useJurisdictions();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedIds = useMemo(
    () => (multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [value] : []),
    [value, multiple]
  );

  const byId = useMemo(() => {
    const map = new Map();
    for (const j of jurisdictions) map.set(j._id || j.id, j);
    return map;
  }, [jurisdictions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? jurisdictions.filter(
          (j) => j.country_name?.toLowerCase().includes(q) || j.country_code?.toLowerCase().includes(q)
        )
      : jurisdictions;
    return [...list].sort((a, b) => a.country_name.localeCompare(b.country_name));
  }, [jurisdictions, query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function select(j) {
    const id = j._id || j.id;
    if (multiple) {
      const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
      onChange(next);
    } else {
      onChange(id);
      setQuery('');
      setOpen(false);
    }
  }

  function remove(id) {
    onChange(multiple ? selectedIds.filter((x) => x !== id) : '');
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

  return (
    <div className="relative" ref={containerRef} style={style}>
      {/* Selected chips (multiple mode) */}
      {multiple && selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedIds.map((id) => {
            const j = byId.get(id);
            return (
              <span key={id} className="inline-flex items-center gap-1 text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                {j ? labelFor(j) : id}
                <button type="button" onClick={() => remove(id)} className="hover:text-primary-900 cursor-pointer" aria-label="Remove">✕</button>
              </span>
            );
          })}
        </div>
      )}

      <input
        type="text"
        className={inputClass}
        placeholder={isLoading ? 'Loading countries…' : (placeholder || 'Search for a country…')}
        disabled={isLoading}
        value={
          !multiple && !open && value && byId.get(value)
            ? labelFor(byId.get(value))
            : query
        }
        onFocus={() => { setOpen(true); if (!multiple) setQuery(''); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />

      {open && !isLoading && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {!multiple && (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer"
              onClick={() => { onChange(''); setQuery(''); setOpen(false); }}
            >
              {placeholder || 'All jurisdictions'}
            </button>
          )}
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">No countries match &quot;{query}&quot;</p>
          )}
          {filtered.map((j) => {
            const id = j._id || j.id;
            const isSelected = selectedIds.includes(id);
            return (
              <button
                type="button"
                key={id}
                onClick={() => select(j)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
              >
                <span>{j.country_name} <span className="text-gray-400">({j.country_code})</span></span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
