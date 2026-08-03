'use client';

import Link from 'next/link';

/**
 * Profile-completion card. `compact` renders just a thin progress bar with
 * the percentage (for Settings, where the candidate is already mid-edit);
 * the full version (Passport dashboard) also lists what's still missing,
 * each item linking straight to where to fix it.
 */
export default function ProfileCompletion({ percentage, items, compact = false }) {
  if (percentage == null) return null;

  const color = percentage >= 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-primary-600' : 'bg-amber-500';

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Profile completion</span>
          <span className="text-sm font-bold text-gray-900">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  }

  const missing = items.filter((item) => !item.done);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-5">
        {/* Progress ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={percentage >= 100 ? '#22c55e' : percentage >= 50 ? '#148438' : '#f59e0b'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - percentage / 100)}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">
            {percentage}%
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900">
            {percentage >= 100 ? 'Your passport is complete!' : 'Complete your passport'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {percentage >= 100
              ? 'Employers see your full profile, credentials, and history.'
              : `${missing.length} more ${missing.length === 1 ? 'step' : 'steps'} to a fully built profile.`}
          </p>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-2">
          {missing.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 no-underline transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
