import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#111827' },
  contactRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  contact: { fontSize: 9, color: '#6b7280' },
  bio: { fontSize: 9.5, color: '#374151', marginTop: 10, lineHeight: 1.5 },

  sectionTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2563eb',
    marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1,
  },
  entry: { marginBottom: 10 },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  entryTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  entrySub: { fontSize: 9.5, color: '#2563eb', marginTop: 1 },
  entryMeta: { fontSize: 8.5, color: '#9ca3af' },
  entryDesc: { fontSize: 9, color: '#4b5563', marginTop: 3, lineHeight: 1.4 },

  footer: {
    marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb',
    fontSize: 7.5, color: '#9ca3af', textAlign: 'center',
  },
});

function fmtDate(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short' }).format(new Date(d));
}

/**
 * Auto-generated resume built from the holder's existing Job Passport profile
 * (credentials + work experience), used as the resume attachment when applying
 * to a job via the job board.
 */
export default function ResumePDF({ holder, credentials = [], workExperiences = [] }) {
  const sortedWork = [...workExperiences].sort(
    (a, b) => new Date(b.start_date) - new Date(a.start_date)
  );
  const sortedCreds = [...credentials].sort(
    (a, b) => new Date(b.issued_at) - new Date(a.issued_at)
  );

  return (
    <Document title={`${holder?.full_name || 'Resume'} — Resume`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{holder?.full_name || '—'}</Text>
          <View style={styles.contactRow}>
            {holder?.email && <Text style={styles.contact}>{holder.email}</Text>}
            {holder?.phone && <Text style={styles.contact}>{holder.phone}</Text>}
            {holder?.nationality && <Text style={styles.contact}>{holder.nationality}</Text>}
          </View>
          {holder?.bio && <Text style={styles.bio}>{holder.bio}</Text>}
        </View>

        {sortedWork.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {sortedWork.map((w, i) => (
              <View key={w._id || w.id || i} style={styles.entry}>
                <View style={styles.entryTop}>
                  <Text style={styles.entryTitle}>{w.job_title}</Text>
                  <Text style={styles.entryMeta}>
                    {fmtDate(w.start_date)} — {w.is_current ? 'Present' : fmtDate(w.end_date) || '—'}
                  </Text>
                </View>
                <Text style={styles.entrySub}>
                  {w.employer_name}{w.location ? ` · ${w.location}` : ''}
                </Text>
                {w.description && <Text style={styles.entryDesc}>{w.description}</Text>}
              </View>
            ))}
          </>
        )}

        {sortedCreds.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Credentials &amp; Education</Text>
            {sortedCreds.map((c, i) => (
              <View key={c._id || c.id || i} style={styles.entry}>
                <View style={styles.entryTop}>
                  <Text style={styles.entryTitle}>{c.title}</Text>
                  <Text style={styles.entryMeta}>{fmtDate(c.issued_at)}</Text>
                </View>
                <Text style={styles.entrySub}>{c.type?.replace(/([A-Z])/g, ' $1').trim()}</Text>
                {c.description && <Text style={styles.entryDesc}>{c.description}</Text>}
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer}>
          Generated from this candidate&apos;s Job Passport profile — verified credentials and work
          history available at their passport share link.
        </Text>
      </Page>
    </Document>
  );
}
