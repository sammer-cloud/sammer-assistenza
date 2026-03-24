import { useState } from "react";
import { supabase } from "../supabase";

const SAMMER_ORANGE = "#E8610A";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setErrore("Inserisci email e password.");
      return;
    }
    setLoading(true);
    setErrore("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrore("Credenziali non valide. Riprova.");
      setLoading(false);
      return;
    }

    setLoading(false);
    if (onLogin) onLogin(data.user);
  }

  function handleKey(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logoText}>SAMMER</span>
          <span style={styles.badge}>Area operatori</span>
        </div>
        <p style={styles.subtitle}>Accedi per gestire i ticket di assistenza</p>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="admin@sammer.it" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKey}/>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKey}/>
        </div>
        {errore && <div style={styles.errore}>{errore}</div>}
        <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }} onClick={handleLogin} disabled={loading}>
          {loading ? "Accesso in corso..." : "Accedi"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f7", fontFamily: "system-ui, sans-serif" },
  card: { width: "100%", maxWidth: 380, background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16 },
  header: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: "0.1em", color: "#1a1a1a" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FEF3C7", color: "#92400E", fontWeight: 500 },
  subtitle: { fontSize: 13, color: "#888", margin: 0 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, color: "#555", fontWeight: 500 },
  input: { fontSize: 14, padding: "9px 11px", borderRadius: 8, border: "1px solid #ddd", background: "#fafafa", color: "#1a1a1a", fontFamily: "inherit", boxSizing: "border-box", width: "100%" },
  errore: { fontSize: 13, color: "#991B1B", background: "#FEE2E2", padding: "8px 12px", borderRadius: 8 },
  btn: { padding: "11px 0", borderRadius: 8, border: "none", background: "#E8610A", color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "inherit", width: "100%", transition: "opacity 0.2s" },
};