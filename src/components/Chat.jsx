import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

const TICKET_ID_DEMO = "00000000-0000-0000-0000-000000000001";

export default function Chat(props) {
  const ticketId = props.ticketId !== undefined ? props.ticketId : TICKET_ID_DEMO;
  const nomeCliente = props.nomeCliente !== undefined ? props.nomeCliente : "Cliente";
  const ruolo = props.ruolo !== undefined ? props.ruolo : "cliente";

  const [messaggi, setMessaggi] = useState([]);
  const [testo, setTesto] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    caricaMessaggi();
    const sub = supabase
      .channel("chat-" + ticketId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messaggi",
        filter: "ticket_id=eq." + ticketId,
      }, (payload) => {
        setMessaggi((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi]);

  async function caricaMessaggi() {
    const { data } = await supabase
      .from("messaggi")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("creato_at", { ascending: true });
    if (data) setMessaggi(data);
    setLoading(false);
  }

  async function invia() {
    if (!testo.trim()) return;
    const msg = testo.trim();
    setTesto("");
    await supabase.from("messaggi").insert([{
      ticket_id: ticketId,
      testo: msg,
      mittente: ruolo,
    }]);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      invia();
    }
  }

  return (
    <div style={s.container}>
      <div style={{ background: "red", color: "white", padding: "4px 8px", fontSize: 11 }}>
        RUOLO ATTIVO: {ruolo}
      </div>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={s.logoText}>SAMMER</span>
          <span style={s.badge}>Chat assistenza</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={s.dot}/>
          <span style={s.onlineText}>Operatore online</span>
        </div>
      </div>
      <div style={s.chatArea}>
        {loading && <div style={s.empty}>Caricamento...</div>}
        {!loading && messaggi.length === 0 && (
          <div style={s.empty}>Nessun messaggio. Scrivi per iniziare!</div>
        )}
        {messaggi.map((m) => {
          const isCliente = m.mittente === "cliente";
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isCliente ? "flex-end" : "flex-start", gap: 2 }}>
              <div style={{ ...s.bubble, ...(isCliente ? s.bubbleCliente : s.bubbleOperatore) }}>
                {m.testo}
              </div>
              <span style={s.label}>{isCliente ? nomeCliente : "Operatore"}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={s.inputRow}>
        <textarea style={s.input} placeholder="Scrivi un messaggio..." value={testo} onChange={(e) => setTesto(e.target.value)} onKeyDown={handleKey} rows={2}/>
        <button style={s.btn} onClick={invia}>Invia</button>
      </div>
    </div>
  );
}

const s = {
  container: { fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", height: 400, border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  header: { padding: "10px 14px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" },
  logoText: { fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "#1a1a1a" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FDF0E6", color: "#7A2E00", fontWeight: 500 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" },
  onlineText: { fontSize: 12, color: "#555" },
  chatArea: { flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 10, background: "#fafafa" },
  empty: { fontSize: 13, color: "#aaa", textAlign: "center", padding: "20px 0" },
  bubble: { maxWidth: "75%", padding: "9px 12px", borderRadius: 10, fontSize: 13, lineHeight: 1.5 },
  bubbleCliente: { background: "#E8610A", color: "#fff" },
  bubbleOperatore: { background: "#fff", color: "#1a1a1a", border: "1px solid #eee" },
  label: { fontSize: 10, color: "#aaa", paddingLeft: 2, paddingRight: 2 },
  inputRow: { display: "flex", gap: 8, padding: "8px 12px", borderTop: "1px solid #eee", background: "#fff" },
  input: { flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", resize: "none", color: "#1a1a1a" },
  btn: { padding: "0 16px", borderRadius: 8, border: "none", background: "#E8610A", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};