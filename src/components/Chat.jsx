import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

const SAMMER_ORANGE = "#E8610A";
const TICKET_ID_DEMO = "00000000-0000-0000-0000-000000000001";

export default function Chat({ ticketId = TICKET_ID_DEMO, nomeCliente = "Cliente" }) {
  const [messaggi, setMessaggi] = useState([]);
  const [testo, setTesto] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    caricaMessaggi();
    const subscription = supabase
      .channel("messaggi-" + ticketId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messaggi",
        filter: "ticket_id=eq." + ticketId,
      }, (payload) => {
        setMessaggi((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
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
    await supabase.from("messaggi").insert([{ ticket_id: ticketId, testo: msg, mittente: "cliente" }]);
    setTimeout(async () => {
      await supabase.from("messaggi").insert([{ ticket_id: ticketId, testo: "Grazie per il messaggio. Un operatore ti risponderà a breve.", mittente: "operatore" }]);
    }, 1000);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); invia(); }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <span style={styles.logoText}>SAMMER</span>
          <span style={styles.badge}>Chat assistenza</span>
        </div>
        <div style={styles.onlineDot}>
          <span style={styles.dot}/>
          <span style={styles.onlineText}>Operatore online</span>
        </div>
      </div>
      <div style={styles.chatArea}>
        {loading && <div style={styles.loading}>Caricamento messaggi...</div>}
        {!loading && messaggi.length === 0 && <div style={styles.loading}>Nessun messaggio ancora. Scrivi per iniziare!</div>}
        {messaggi.map((m) => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.mittente === "cliente" ? "flex-end" : "flex-start" }}>
            <div style={{ ...styles.bubble, ...(m.mittente === "cliente" ? styles.bubbleCliente : {}), ...(m.mittente === "operatore" ? styles.bubbleOperatore : {}), ...(m.mittente === "ai" ? styles.bubbleAI : {}) }}>
              {m.mittente === "ai" && <div style={styles.aiLabel}>Suggerimento AI</div>}
              {m.testo}
            </div>
            <span style={styles.ora}>{m.mittente === "cliente" ? nomeCliente : m.mittente === "ai" ? "Assistente" : "Operatore"}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputRow}>
        <textarea style={styles.input} placeholder="Scrivi un messaggio... (Invio per inviare)" value={testo} onChange={(e) => setTesto(e.target.value)} onKeyDown={handleKey} rows={2}/>
        <button style={styles.btn} onClick={invia}>Invia</button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", height: 520, border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  header: { padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: "#1a1a1a", marginRight: 8 },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FDF0E6", color: "#7A2E00", fontWeight: 500 },
  onlineDot: { display: "flex", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" },
  onlineText: { fontSize: 12, color: "#555" },
  chatArea: { flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10, background: "#fafafa" },
  loading: { fontSize: 13, color: "#aaa", textAlign: "center", padding: "20px 0" },
  bubble: { maxWidth: "80%", padding: "9px 12px", borderRadius: 10, fontSize: 13, lineHeight: 1.5 },
  bubbleCliente: { background: "#E8610A", color: "#fff" },
  bubbleOperatore: { background: "#fff", color: "#1a1a1a", border: "1px solid #eee" },
  bubbleAI: { background: "#FDF0E6", color: "#7A2E00", borderLeft: "3px solid #E8610A" },
  aiLabel: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, color: "#E8610A" },
  ora: { fontSize: 10, color: "#aaa", marginTop: 2, paddingLeft: 2 },
  inputRow: { display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid #eee", background: "#fff" },
  input: { flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", resize: "none", color: "#1a1a1a" },
  btn: { padding: "0 16px", borderRadius: 8, border: "none", background: "#E8610A", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};