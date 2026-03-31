import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Chat from "./Chat";

const SAMMER_ORANGE = "#E8610A";

const coloreStato = {
  aperto: { background: "#FEF3C7", color: "#92400E" },
  "in lavorazione": { background: "#FDF0E6", color: "#7A2E00" },
  risolto: { background: "#DCFCE7", color: "#166534" },
};

export default function PannelloAdmin() {
  const [tickets, setTickets] = useState([]);
  const [selezionato, setSelezionato] = useState(null);
  const [nuovoStato, setNuovoStato] = useState("aperto");
  const [inviato, setInviato] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caricaTickets();
    const subscription = supabase
      .channel("tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => {
        caricaTickets();
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  async function caricaTickets() {
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("creato_at", { ascending: false });
    if (data) setTickets(data);
    setLoading(false);
  }

  function seleziona(t) {
    setSelezionato(t);
    setNuovoStato(t.stato);
    setInviato(false);
  }

  async function aggiornaStato() {
    if (!selezionato) return;
    const { error } = await supabase
      .from("tickets")
      .update({ stato: nuovoStato })
      .eq("id", selezionato.id);
    if (!error) {
      await fetch("/api/invia-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selezionato.email,
          subject: `Aggiornamento ticket #${selezionato.numero} — Sammer`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <img src="https://sammer-assistenza.vercel.app/icon-512.png" width="80" style="margin-bottom: 16px;" />
              <h2 style="color: #E8610A;">Aggiornamento sulla tua richiesta</h2>
              <p>Ciao <strong>${selezionato.nome_cliente}</strong>,</p>
              <p>Il tuo ticket <strong>#${selezionato.numero}</strong> è stato aggiornato.</p>
              <p><strong>Nuovo stato:</strong> ${nuovoStato}</p>
              <a href="https://sammer-assistenza.vercel.app" style="display:inline-block; background:#E8610A; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; margin-top:16px;">
                Vai all'assistenza
              </a>
              <p style="color:#888; font-size:12px; margin-top:24px;">Sammer Assistenza Clienti</p>
            </div>
          `,
        }),
      });
      setInviato(true);
      setSelezionato((prev) => ({ ...prev, stato: nuovoStato }));
      caricaTickets();
      setTimeout(() => setInviato(false), 3000);
    }
  }

  function formatData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit" })
      + " " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logoText}>SAMMER</span>
        <span style={s.badge}>Pannello operatore</span>
        <span style={s.counter}>{tickets.length} ticket totali</span>
      </div>
      <div style={s.body}>
        <div style={s.lista}>
          <div style={s.listaHeader}>Ticket</div>
          {loading && <div style={s.loading}>Caricamento...</div>}
          {!loading && tickets.length === 0 && <div style={s.loading}>Nessun ticket ancora.</div>}
          {tickets.map((t) => (
            <div key={t.id} style={{ ...s.ticketItem, ...(selezionato?.id === t.id ? s.ticketAttivo : {}) }} onClick={() => seleziona(t)}>
              <div style={s.ticketTop}>
                <span style={s.ticketTitolo}>#{t.numero}</span>
                <span style={{ ...s.statoBadge, ...coloreStato[t.stato] }}>{t.stato}</span>
              </div>
              <div style={s.ticketNome}>{t.nome_cliente}</div>
              <div style={s.ticketPreview}>{t.descrizione}</div>
              <div style={s.ticketMeta}>{formatData(t.creato_at)}</div>
            </div>
          ))}
        </div>
        {selezionato ? (
          <div style={s.dettaglio}>
            <div style={s.dettaglioTitolo}>#{selezionato.numero} — {selezionato.nome_cliente}</div>
            <div style={s.dettaglioEmail}>{selezionato.email}</div>
            <div style={s.dettaglioCategoria}>{selezionato.categoria}</div>
            <div style={s.dettaglioDesc}>{selezionato.descrizione}</div>
            <div style={s.dettaglioData}>Ricevuto il {formatData(selezionato.creato_at)}</div>
            {selezionato.allegati && selezionato.allegati.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#777" }}>Allegati ({selezionato.allegati.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selezionato.allegati.map((percorso, i) => {
                    const url = `https://eshgimmcuacfhjupqkml.supabase.co/storage/v1/object/public/allegati/${percorso}`;
                    const isVideo = percorso.match(/\.(mp4|mov|avi|webm)$/i);
                    return isVideo ? (
                      <video key={i} src={url} controls style={{ maxWidth: 200, borderRadius: 8 }} />
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="allegato" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={s.label}>Aggiorna stato</label>
                <select style={{ ...s.input, width: "auto" }} value={nuovoStato} onChange={(e) => setNuovoStato(e.target.value)}>
                  <option>aperto</option>
                  <option>in lavorazione</option>
                  <option>risolto</option>
                </select>
              </div>
              <button style={s.btn} onClick={aggiornaStato}>Aggiorna</button>
            </div>
            {inviato && <div style={s.successMsg}>Stato aggiornato. Email inviata al cliente.</div>}
            <div style={{ marginTop: 8, minHeight: 300 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#777", marginBottom: 8 }}>Chat con il cliente</div>
              <Chat ticketId={selezionato.id} nomeCliente={selezionato.nome_cliente} ruolo="operatore" />
            </div>
          </div>
        ) : (
          <div style={s.vuoto}>Seleziona un ticket dalla lista</div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, sans-serif", border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  header: { padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10, background: "#fff" },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: "#1a1a1a" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FEF3C7", color: "#92400E", fontWeight: 500 },
  counter: { marginLeft: "auto", fontSize: 12, color: "#888" },
  body: { display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 500 },
  lista: { borderRight: "1px solid #eee", background: "#fafafa", overflowY: "auto" },
  listaHeader: { padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#888", borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.05em" },
  loading: { padding: "20px 14px", fontSize: 13, color: "#aaa" },
  ticketItem: { padding: "12px 14px", borderBottom: "1px solid #f0f0f0", cursor: "pointer" },
  ticketAttivo: { background: "#FDF0E6", borderLeft: "3px solid #E8610A" },
  ticketTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  ticketTitolo: { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },
  statoBadge: { fontSize: 10, padding: "2px 7px", borderRadius: 999, fontWeight: 500 },
  ticketNome: { fontSize: 12, fontWeight: 500, color: "#444", marginBottom: 2 },
  ticketPreview: { fontSize: 11, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 },
  ticketMeta: { fontSize: 10, color: "#bbb" },
  dettaglio: { padding: "20px", display: "flex", flexDirection: "column", gap: 12, background: "#fff", overflowY: "auto" },
  dettaglioTitolo: { fontSize: 15, fontWeight: 700, color: "#1a1a1a" },
  dettaglioEmail: { fontSize: 12, color: "#888" },
  dettaglioCategoria: { fontSize: 12, color: "#E8610A", fontWeight: 500 },
  dettaglioDesc: { fontSize: 13, color: "#555", lineHeight: 1.6 },
  dettaglioData: { fontSize: 11, color: "#bbb" },
  label: { fontSize: 12, color: "#777", fontWeight: 500 },
  input: { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", color: "#1a1a1a", background: "#fafafa", boxSizing: "border-box", width: "100%" },
  btn: { padding: "9px 18px", borderRadius: 8, border: "none", background: "#E8610A", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  successMsg: { fontSize: 12, color: "#166534", background: "#DCFCE7", padding: "8px 12px", borderRadius: 8 },
  vuoto: { display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 13, background: "#fff" },
};