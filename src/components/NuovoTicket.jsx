import { useState } from "react";
import { supabase } from "../supabase";

const SAMMER_ORANGE = "#E8610A";

const categorie = [
  "Dispositivo non si accende",
  "Schermo danneggiato",
  "Problemi di connettività",
  "Batteria / autonomia",
  "Altro",
];

export default function NuovoTicket({ onInviato }) {
  const [categoria, setCategoria] = useState(categorie[0]);
  const [descrizione, setDescrizione] = useState("");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [files, setFiles] = useState([]);
  const [inviato, setInviato] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  function handleFile(e) {
    const nuovi = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...nuovi].slice(0, 3));
  }

  async function handleInvia() {
    if (!descrizione || !email || !nome) {
      setErrore("Compila tutti i campi obbligatori.");
      return;
    }
    setLoading(true);
    setErrore("");

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .insert([{ nome_cliente: nome, email, categoria, descrizione, stato: "aperto" }])
      .select()
      .single();

    if (ticketError) {
      setErrore("Errore durante l'invio. Riprova.");
      setLoading(false);
      return;
    }

    const percorsi = [];
    for (const file of files) {
      const estensione = file.name.split(".").pop();
      const percorso = `${ticket.id}/${Date.now()}.${estensione}`;
      const { error: uploadError } = await supabase.storage
        .from("allegati")
        .upload(percorso, file);
      if (!uploadError) percorsi.push(percorso);
    }

    if (percorsi.length > 0) {
      await supabase
        .from("tickets")
        .update({ allegati: percorsi })
        .eq("id", ticket.id);
    }

    await fetch("/api/invia-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `Ticket #${ticket.numero} aperto — Sammer Assistenza`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <img src="https://sammer-assistenza.vercel.app/icon-512.png" width="80" style="margin-bottom: 16px;" />
            <h2 style="color: #E8610A;">Abbiamo ricevuto la tua richiesta</h2>
            <p>Ciao <strong>${nome}</strong>,</p>
            <p>Il tuo ticket <strong>#${ticket.numero}</strong> è stato aperto con successo.</p>
            <p><strong>Categoria:</strong> ${categoria}<br/>
            <strong>Descrizione:</strong> ${descrizione}</p>
            <p>Un nostro operatore ti risponderà il prima possibile.</p>
            <a href="https://sammer-assistenza.vercel.app" style="display:inline-block; background:#E8610A; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; margin-top:16px;">
              Vai all'assistenza
            </a>
            <p style="color:#888; font-size:12px; margin-top:24px;">Sammer Assistenza Clienti</p>
          </div>
        `,
      }),
    });

    setInviato(true);
    setLoading(false);
    if (onInviato) onInviato(ticket);
  }

  if (inviato) {
    return (
      <div style={styles.successBox}>
        <div style={styles.successIcon}>✓</div>
        <p style={styles.successTitle}>Ticket aperto con successo</p>
        <p style={styles.successSub}>Riceverai una conferma all'indirizzo {email}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logoText}>SAMMER</span>
        <span style={styles.badge}>Assistenza clienti</span>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Nome e cognome *</label>
        <input style={styles.input} placeholder="Mario Rossi" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Categoria *</label>
        <select style={styles.input} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {categorie.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Descrizione del problema *</label>
        <textarea style={{ ...styles.input, height: 90, resize: "vertical" }}
          placeholder="Descrivi il problema nel dettaglio..."
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
        />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Allega foto o video (max 3)</label>
        <label style={styles.uploadArea}>
          <input type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleFile} />
          <span style={{ color: SAMMER_ORANGE, fontSize: 22 }}>↑</span>
          <span style={styles.uploadText}>
            {files.length === 0 ? "Clicca per allegare — JPG, PNG, MP4" : `${files.length} file allegati`}
          </span>
        </label>
        {files.length > 0 && (
          <div style={styles.fileList}>
            {files.map((f, i) => <span key={i} style={styles.fileTag}>{f.name}</span>)}
          </div>
        )}
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Email per notifiche *</label>
        <input style={styles.input} type="email" placeholder="tuaemail@esempio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {errore && <div style={styles.errore}>{errore}</div>}
      <button
        style={{ ...styles.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}
        onClick={handleInvia}
        disabled={loading}
      >
        {loading ? "Invio in corso..." : "Invia richiesta"}
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: "0 auto", padding: "24px 20px", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 16 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: "0.1em", color: "#1a1a1a" },
  badge: { fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "#FDF0E6", color: "#7A2E00", fontWeight: 500 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, color: "#555", fontWeight: 500 },
  input: { fontSize: 14, padding: "9px 11px", borderRadius: 8, border: "1px solid #ddd", background: "#fafafa", color: "#1a1a1a", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },
  uploadArea: { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px", borderRadius: 8, border: "1px dashed #ccc", background: "#fafafa", cursor: "pointer" },
  uploadText: { fontSize: 13, color: "#777" },
  fileList: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  fileTag: { fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#FDF0E6", color: "#7A2E00" },
  errore: { fontSize: 13, color: "#991B1B", background: "#FEE2E2", padding: "8px 12px", borderRadius: 8 },
  btn: { padding: "11px 0", borderRadius: 8, border: "none", background: "#E8610A", color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "inherit", width: "100%", transition: "opacity 0.2s" },
  successBox: { maxWidth: 480, margin: "40px auto", padding: 32, borderRadius: 12, border: "1px solid #eee", textAlign: "center", fontFamily: "system-ui, sans-serif" },
  successIcon: { width: 48, height: 48, borderRadius: "50%", background: "#FDF0E6", color: "#E8610A", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  successTitle: { fontSize: 16, fontWeight: 600, margin: "0 0 6px" },
  successSub: { fontSize: 13, color: "#777", margin: 0 },
};