import { useState, useEffect, useRef } from "react";

const SAMMER_ORANGE = "#E8610A";

const risposteAuto = [
  "Grazie per il messaggio. Un operatore ti risponderà a breve.",
  "Ho preso nota del tuo problema. Stiamo verificando la situazione.",
  "Puoi inviarci anche una foto del dispositivo per velocizzare l'assistenza?",
];

export default function Chat({ nomeCliente = "Cliente" }) {
  const [messaggi, setMessaggi] = useState([
    { id: 1, testo: "Benvenuto all'assistenza Sammer. Come posso aiutarti?", mittente: "operatore", ora: oraNow() },
    { id: 2, testo: "Ho analizzato il tuo ticket: prova un hard reset tenendo premuto power + volume giù per 10 secondi.", mittente: "ai", ora: oraNow() },
  ]);
  const [testo, setTesto] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi]);

  function oraNow() {
    const t = new Date();
    return t.getHours() + ":" + String(t.getMinutes()).padStart(2, "0");
  }

  function invia() {
    if (!testo.trim()) return;
    const nuovoMsg = { id: Date.now(), testo: testo.trim(), mittente: "cliente", ora: oraNow() };
    setMessaggi((prev) => [...prev, nuovoMsg]);
    setTesto("");
    setTimeout(() => {
      const risposta = risposteAuto[Math.floor(Math.random() * risposteAuto.length)];
      setMessaggi((prev) => [...prev, { id: Date.now() + 1, testo: risposta, mittente: "operatore", ora: oraNow() }]);
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
        {messaggi.map((m) => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.mittente === "cliente" ? "flex-end" : "flex-start" }}>
            <div style={{ ...styles.bubble, ...(m.mittente === "cliente" ? styles.bubbleCliente : {}), ...(m.mittente === "operatore" ? styles.bubbleOperatore : {}), ...(m.mittente === "ai" ? styles.bubbleAI : {}) }}>
              {m.mittente === "ai" && <div style={styles.aiLabel}>Suggerimento AI</div>}
              {m.testo}
            </div>
            <span style={styles.ora}>
              {m.mittente === "cliente" ? nomeCliente : m.mittente === "ai" ? "Assistente" : "Operatore"} · {m.ora}
            </span>
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
  container: { maxWidth: 480, margin: "0 auto", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", height: 580, border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  header: { padding: "12px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: "#1a1a1a", marginRight: 8 },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FDF0E6", color: "#7A2E00", fontWeight: 500 },
  onlineDot: { display: "flex", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" },
  onlineText: { fontSize: 12, color: "#555" },
  chatArea: { flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10, background: "#fafafa" },
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