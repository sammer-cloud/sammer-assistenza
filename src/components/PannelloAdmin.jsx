import { useState } from "react";

const SAMMER_ORANGE = "#E8610A";

const ticketIniziali = [
  { id: "TK-042", nome: "Mario Rossi", categoria: "Dispositivo non si accende", descrizione: "Non si accende dopo aggiornamento firmware.", stato: "aperto", ora: "10:01", allegati: 2 },
  { id: "TK-041", nome: "Giulia Bianchi", categoria: "Schermo danneggiato", descrizione: "Righe verticali dopo caduta.", stato: "in lavorazione", ora: "ieri", allegati: 1 },
  { id: "TK-040", nome: "Luca Verdi", categoria: "Batteria / autonomia", descrizione: "Si scarica in 2 ore invece di 8.", stato: "risolto", ora: "2 giorni fa", allegati: 0 },
];

const coloreStato = {
  aperto: { background: "#FEF3C7", color: "#92400E" },
  "in lavorazione": { background: "#FDF0E6", color: "#7A2E00" },
  risolto: { background: "#DCFCE7", color: "#166534" },
};

export default function PannelloAdmin() {
  const [tickets, setTickets] = useState(ticketIniziali);
  const [selezionato, setSelezionato] = useState(ticketIniziali[0]);
  const [risposta, setRisposta] = useState("");
  const [nuovoStato, setNuovoStato] = useState(ticketIniziali[0].stato);
  const [inviato, setInviato] = useState(false);

  function seleziona(t) {
    setSelezionato(t);
    setNuovoStato(t.stato);
    setRisposta("");
    setInviato(false);
  }

  function inviaRisposta() {
    if (!risposta.trim()) return;
    setTickets((prev) =>
      prev.map((t) => t.id === selezionato.id ? { ...t, stato: nuovoStato } : t)
    );
    setSelezionato((prev) => ({ ...prev, stato: nuovoStato }));
    setInviato(true);
    setRisposta("");
    setTimeout(() => setInviato(false), 3000);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logoText}>SAMMER</span>
        <span style={styles.badge}>Pannello operatore</span>
      </div>
      <div style={styles.body}>
        <div style={styles.lista}>
          <div style={styles.listaHeader}>Ticket aperti</div>
          {tickets.map((t) => (
            <div key={t.id} style={{ ...styles.ticketItem, ...(selezionato?.id === t.id ? styles.ticketAttivo : {}) }} onClick={() => seleziona(t)}>
              <div style={styles.ticketTop}>
                <span style={styles.ticketTitolo}>#{t.id}</span>
                <span style={{ ...styles.statoBadge, ...coloreStato[t.stato] }}>{t.stato}</span>
              </div>
              <div style={styles.ticketNome}>{t.nome}</div>
              <div style={styles.ticketPreview}>{t.descrizione}</div>
              <div style={styles.ticketMeta}>{t.ora}{t.allegati > 0 ? ` · ${t.allegati} allegati` : ""}</div>
            </div>
          ))}
        </div>
        {selezionato && (
          <div style={styles.dettaglio}>
            <div style={styles.dettaglioTitolo}>#{selezionato.id} — {selezionato.nome}</div>
            <div style={styles.dettaglioCategoria}>{selezionato.categoria}</div>
            <div style={styles.dettaglioDesc}>{selezionato.descrizione}</div>
            <div style={styles.aiBox}>
              <div style={styles.aiLabel}>Suggerimento AI</div>
              Problema comune post-aggiornamento. Suggerisci: hard reset (power + volume giù per 10s). Se non risolve, potrebbe essere necessario un reflash del firmware.
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Risposta al cliente</label>
              <textarea style={styles.input} rows={3} placeholder="Scrivi la risposta..." value={risposta} onChange={(e) => setRisposta(e.target.value)}/>
            </div>
            <div style={styles.azioniRow}>
              <div style={styles.field}>
                <label style={styles.label}>Aggiorna stato</label>
                <select style={{ ...styles.input, width: "auto" }} value={nuovoStato} onChange={(e) => setNuovoStato(e.target.value)}>
                  <option>aperto</option>
                  <option>in lavorazione</option>
                  <option>risolto</option>
                </select>
              </div>
              <button style={styles.btn} onClick={inviaRisposta}>Invia risposta</button>
            </div>
            {inviato && <div style={styles.successMsg}>Risposta inviata. Notifica email spedita al cliente.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, sans-serif", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  header: { padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10, background: "#fff" },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: "#1a1a1a" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FEF3C7", color: "#92400E", fontWeight: 500 },
  body: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 500 },
  lista: { borderRight: "1px solid #eee", background: "#fafafa" },
  listaHeader: { padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#888", borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.05em" },
  ticketItem: { padding: "12px 14px", borderBottom: "1px solid #f0f0f0", cursor: "pointer" },
  ticketAttivo: { background: "#FDF0E6", borderLeft: "3px solid #E8610A" },
  ticketTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  ticketTitolo: { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },
  statoBadge: { fontSize: 10, padding: "2px 7px", borderRadius: 999, fontWeight: 500 },
  ticketNome: { fontSize: 12, fontWeight: 500, color: "#444", marginBottom: 2 },
  ticketPreview: { fontSize: 11, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 },
  ticketMeta: { fontSize: 10, color: "#bbb" },
  dettaglio: { padding: "20px", display: "flex", flexDirection: "column", gap: 14, background: "#fff" },
  dettaglioTitolo: { fontSize: 15, fontWeight: 700, color: "#1a1a1a" },
  dettaglioCategoria: { fontSize: 12, color: "#E8610A", fontWeight: 500 },
  dettaglioDesc: { fontSize: 13, color: "#555", lineHeight: 1.6 },
  aiBox: { background: "#FDF0E6", border: "1px solid #F4A35A", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#7A2E00", lineHeight: 1.6 },
  aiLabel: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, color: "#E8610A" },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, color: "#777", fontWeight: 500 },
  input: { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", color: "#1a1a1a", background: "#fafafa", boxSizing: "border-box", width: "100%" },
  azioniRow: { display: "flex", alignItems: "flex-end", gap: 10 },
  btn: { padding: "9px 18px", borderRadius: 8, border: "none", background: "#E8610A", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  successMsg: { fontSize: 12, color: "#166534", background: "#DCFCE7", padding: "8px 12px", borderRadius: 8 },
};