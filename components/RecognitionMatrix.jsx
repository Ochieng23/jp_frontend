'use client';

// Status pill: green = recognised (safe), amber = partial (caution), red = not recognised (danger)
// Conforms to ISO 3864 / ISO 9241-210 semantic colour conventions
const STATUS_CONFIG = {
  recognised:     { cls: 'bg-green-100 text-green-700',  label: 'Recognised'    },
  partial:        { cls: 'bg-amber-100 text-amber-700',  label: 'Partial'       },
  not_recognised: { cls: 'bg-red-100 text-red-700',      label: 'Not Recog.'    },
  pending:        { cls: 'bg-primary-100 text-primary-700',    label: 'Pending'       },
};

function StatusCell({ status, notes }) {
  if (!status) {
    return <span className="text-gray-300 text-sm">—</span>;
  }
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
      title={notes ? `${cfg.label}: ${notes}` : cfg.label}
    >
      {cfg.label}
    </span>
  );
}

export default function RecognitionMatrix({ matrix }) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No recognition data</h3>
        <p className="text-sm text-gray-500">Trigger an evaluation to populate the matrix.</p>
      </div>
    );
  }

  // Collect unique jurisdictions
  const jurisdictionMap = new Map();
  matrix.forEach((row) => {
    if (Array.isArray(row.recognitions)) {
      row.recognitions.forEach((r) => {
        if (r.jurisdiction) {
          const jId = r.jurisdiction._id || r.jurisdiction.id || r.jurisdiction_id || r.jurisdiction.country_code;
          if (jId && !jurisdictionMap.has(jId)) jurisdictionMap.set(jId, r.jurisdiction);
        }
      });
    }
  });

  const jurisdictions = Array.from(jurisdictionMap.entries())
    .sort((a, b) => (a[1].country_name || '').localeCompare(b[1].country_name || ''))
    .map(([id, j]) => ({ id, ...j }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 min-w-[220px] sticky left-0 bg-gray-50 z-10">
              Credential
            </th>
            {jurisdictions.map((j) => (
              <th
                key={j.id}
                className="px-3 py-3 text-center text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 min-w-[110px]"
              >
                <div>{j.country_code}</div>
                <div className="font-normal normal-case tracking-normal text-gray-400 mt-0.5">{j.country_name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => {
            const credId = row.credential?._id || row.credential?.id || i;

            const recognitionByJurisdiction = {};
            if (Array.isArray(row.recognitions)) {
              row.recognitions.forEach((r) => {
                const jId = r.jurisdiction?._id || r.jurisdiction?.id || r.jurisdiction_id || r.jurisdiction?.country_code;
                if (jId) recognitionByJurisdiction[jId] = r;
              });
            }

            return (
              <tr
                key={credId}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 bg-white sticky left-0 z-10 border-r border-gray-100">
                  <div className="font-semibold text-gray-900 text-sm">{row.credential?.title || 'Untitled'}</div>
                  {row.credential?.type && (
                    <div className="text-xs text-primary-600 font-medium capitalize mt-0.5">
                      {row.credential.type.replace(/_/g, ' ')}
                    </div>
                  )}
                  {row.credential?.jurisdiction && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Issued in {row.credential.jurisdiction.country_code}
                    </div>
                  )}
                </td>
                {jurisdictions.map((j) => {
                  const rec = recognitionByJurisdiction[j.id];
                  return (
                    <td key={j.id} className="px-3 py-4 text-center align-middle">
                      {rec
                        ? <StatusCell status={rec.recognition_status} notes={rec.notes} />
                        : <span className="text-gray-300 text-sm" title="Not evaluated">—</span>
                      }
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
