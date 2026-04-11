'use client';

function CheckIcon({ pass }) {
  return (
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold
      ${pass ? 'bg-green-600' : 'bg-red-500'}`}>
      {pass ? '✓' : '✗'}
    </div>
  );
}

export default function VerificationStatus({ result }) {
  if (!result) {
    return <p className="text-sm text-gray-500">No verification result available.</p>;
  }

  const { valid, issuer, holder, checks, error } = result;

  return (
    <div className="space-y-4">
      {/* Main status banner */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border
        ${valid
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
        }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0
          ${valid ? 'bg-green-600' : 'bg-red-500'}`}>
          {valid ? '✓' : '✗'}
        </div>
        <div>
          <div className={`text-base font-bold ${valid ? 'text-green-700' : 'text-red-700'}`}>
            {valid ? 'Credential Valid' : 'Credential Invalid'}
          </div>
          <div className={`text-sm mt-0.5 ${valid ? 'text-green-600' : 'text-red-600'}`}>
            {valid
              ? 'This credential has been cryptographically verified.'
              : error || 'This credential could not be verified.'}
          </div>
        </div>
      </div>

      {/* Error box */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <strong>Error: </strong>{error}
        </div>
      )}

      {/* Checks list */}
      {checks && checks.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Verification Checks
          </div>
          <div className="space-y-2">
            {checks.map((check, i) => {
              const isObj = typeof check === 'object' && check !== null;
              const name    = isObj ? check.name || check.check : check;
              const passed  = isObj ? check.passed !== false : true;
              const message = isObj ? check.message : null;
              return (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <CheckIcon pass={passed} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    {message && <div className="text-xs text-gray-500 mt-0.5">{message}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issuer / Holder */}
      {(issuer || holder) && (
        <div className="grid grid-cols-2 gap-3">
          {issuer && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Issuer</div>
              <div className="text-sm font-semibold text-gray-900">{issuer.name || 'Unknown'}</div>
              {issuer.did && (
                <div className="text-xs font-mono text-gray-400 mt-1 break-all">{issuer.did}</div>
              )}
            </div>
          )}
          {holder && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Holder</div>
              <div className="text-sm font-semibold text-gray-900">{holder.name || holder.full_name || 'Unknown'}</div>
              {holder.did && (
                <div className="text-xs font-mono text-gray-400 mt-1 break-all">{holder.did}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
