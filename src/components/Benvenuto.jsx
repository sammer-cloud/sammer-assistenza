const SAMMER_ORANGE = "#E8610A";
const SAMMER_YELLOW = "#F5C000";

export default function Benvenuto({ onAvvia }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoWrap}>
          <svg width="120" height="36" viewBox="0 0 120 36" fill="none">
            <ellipse cx="60" cy="18" rx="58" ry="14" stroke={SAMMER_YELLOW} strokeWidth="3.5" fill="none"/>
            <ellipse cx="60" cy="18" rx="38" ry="9" stroke={SAMMER_ORANGE} strokeWidth="2.5" fill="none"/>
            <text x="60" y="23" textAnchor="middle" fontSize="13" fontWeight="600" letterSpacing="3" fill="#1a1a1a">SAMMER</text>
          </svg>
        </div>

        <h1 style={styles.titolo}>Assistenza clienti</h1>
        <p style={styles.sottotitolo}>Siamo qui per aiutarti. Descrivi il problema e ti risponderemo il prima possibile.</p>

        <div style={styles.features}>
          {[
            { icon: "📎", testo: "Allega foto e video del problema" },
            { icon: "💬", testo: "Chat in tempo reale con un operatore" },
            { icon: "📊", testo: "Segui lo stato della tua richiesta" },
          ].map((f, i) => (
            <div key={i} style={styles.featureRow}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureTesto}>{f.testo}</span>
            </div>
          ))}
        </div>

        <button style={styles.btn} onClick={onAvvia}>
          Apri una richiesta
        </button>

        <p style={styles.orari}>Lun–Ven 9:00–18:00 · Risposta entro 2 ore lavorative</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "#F7F6F3" },
  card: { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, padding: "40px 32px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" },
  logoWrap: { marginBottom: 4 },
  titolo: { fontSize: 22, fontWeight: 600, color: "#1a1a1a" },
  sottotitolo: { fontSize: 14, color: "#666", lineHeight: 1.6, maxWidth: 320 },
  features: { display: "flex", flexDirection: "column", gap: 10, width: "100%", textAlign: "left" },
  featureRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F7F6F3", borderRadius: 8 },
  featureIcon: { fontSize: 18, flexShrink: 0 },
  featureTesto: { fontSize: 13, color: "#444" },
  btn: { width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: SAMMER_ORANGE, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  orari: { fontSize: 12, color: "#aaa" },
};