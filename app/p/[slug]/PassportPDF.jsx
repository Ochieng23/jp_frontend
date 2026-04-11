import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBox: {
    width: 28, height: 28,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { color: '#ffffff', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  brandName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111827' },
  headerRight: { fontSize: 8, color: '#9ca3af', textAlign: 'right' },

  // ── Profile ─────────────────────────────────────────────
  profileCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  avatarInitials: {
    width: 52, height: 52, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 18, fontFamily: 'Helvetica-Bold' },
  profileInfo: { flex: 1 },
  profileLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 7, letterSpacing: 1, marginBottom: 2 },
  profileName: { color: '#ffffff', fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  profileNat: { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  bio: { color: 'rgba(255,255,255,0.8)', fontSize: 9, marginTop: 10, lineHeight: 1.5 },
  statsRow: {
    flexDirection: 'row', gap: 20, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 7, letterSpacing: 0.5 },
  statVal: { color: '#ffffff', fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 1 },

  // ── Section ─────────────────────────────────────────────
  sectionTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#374151',
    marginBottom: 8, marginTop: 4,
  },
  // ── Credential cards ────────────────────────────────────
  credCard: {
    border: 1, borderColor: '#e5e7eb', borderRadius: 8,
    padding: 10, marginBottom: 8, backgroundColor: '#f9fafb',
  },
  credTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  credTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827', flex: 1 },
  credBadge: {
    fontSize: 7, fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8', backgroundColor: '#dbeafe',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  credDesc: { fontSize: 8, color: '#6b7280', marginBottom: 4, lineHeight: 1.4 },
  credMeta: { fontSize: 7, color: '#9ca3af' },

  // ── QR / footer ─────────────────────────────────────────
  footer: {
    marginTop: 24, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  footerNote: { fontSize: 7, color: '#9ca3af', maxWidth: 300, lineHeight: 1.5 },
  urlText: { fontSize: 7, color: '#6b7280', marginTop: 4, fontFamily: 'Helvetica-Oblique' },
  pageNum: { fontSize: 7, color: '#d1d5db', textAlign: 'right' },
});

function fmtDate(d) {
  if (!d) return null;
  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short' }).format(new Date(d));
}

export default function PassportPDF({ holder, credentials = [], pageUrl = '' }) {
  const initials = holder?.full_name
    ? holder.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const generatedOn = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date());

  return (
    <Document title={`${holder?.full_name || 'Passport'} — Job Passport`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandBox}>
              <Text style={styles.brandText}>JP</Text>
            </View>
            <Text style={styles.brandName}>Job Passport</Text>
          </View>
          <View>
            <Text style={styles.headerRight}>Portable Employment Credential</Text>
            <Text style={styles.headerRight}>Generated {generatedOn}</Text>
          </View>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            {holder?.avatar_key && !holder.avatar_key.startsWith('data:') ? (
              <Image src={holder.avatar_key} style={styles.avatar} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>JOB PASSPORT</Text>
              <Text style={styles.profileName}>{holder?.full_name || '—'}</Text>
              <Text style={styles.profileNat}>{holder?.nationality || '—'}</Text>
            </View>
          </View>

          {holder?.bio ? <Text style={styles.bio}>{holder.bio}</Text> : null}

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>CREDENTIALS</Text>
              <Text style={styles.statVal}>{credentials.length}</Text>
            </View>
            {holder?.jurisdictions_active?.length > 0 && (
              <View>
                <Text style={styles.statLabel}>JURISDICTIONS</Text>
                <Text style={styles.statVal}>{holder.jurisdictions_active.length}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Credentials */}
        {credentials.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Credentials ({credentials.length})</Text>
            {credentials.map((c, i) => (
              <View key={c._id || i} style={styles.credCard}>
                <View style={styles.credTop}>
                  <Text style={styles.credTitle}>{c.title}</Text>
                  <Text style={styles.credBadge}>
                    {c.type?.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </View>
                {c.description ? <Text style={styles.credDesc}>{c.description}</Text> : null}
                <Text style={styles.credMeta}>
                  {c.issued_at ? `Issued ${fmtDate(c.issued_at)}` : ''}
                  {c.expires_at ? `  ·  Expires ${fmtDate(c.expires_at)}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerNote}>
              This document is a read-only credential profile shared by the holder.
              Scan the QR code or visit the link below to verify online.
            </Text>
            {pageUrl ? <Text style={styles.urlText}>{pageUrl}</Text> : null}
          </View>
          <Text style={styles.pageNum}>Job Passport © {new Date().getFullYear()}</Text>
        </View>
      </Page>
    </Document>
  );
}
