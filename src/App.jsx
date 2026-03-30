import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import NuovoTicket from "./components/NuovoTicket";
import Chat from "./components/Chat";
import PannelloAdmin from "./components/PannelloAdmin";
import Login from "./components/Login";
import Benvenuto from "./components/Benvenuto";

export default function App() {
  const [utente, setUtente] = useState(null);
  const [vista, setVista] = useState("benvenuto");
  const [ticketAperto, setTicketAperto] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [mostraBanner, setMostraBanner] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUtente(data.session?.user ?? null);
    });

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setMostraBanner(true);
    });
  }, []);

  async function installa() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setMostraBanner(false);
  }

  function logout() {
    supabase.auth.signOut();
    setUtente(null);
    setVista("benvenuto");
  }

  if (vista === "admin" && !utente) return <Login onLogin={(u) => setUtente(u)} />;
  if (vista === "admin" && utente) return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={logout} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}>
          Esci ({utente.email})
        </button>
      </div>
      <PannelloAdmin />
    </div>
  );

  return (
    <div>
      {mostraBanner && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 999, boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>Installa Sammer Assistenza</div>
            <div style={{ fontSize: 12, color: "#888" }}>Aggiungila alla schermata home</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setMostraBanner(false)} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff", color: "#888" }}>
              Non ora
            </button>
            <button onClick={installa} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "#E8610A", color: "#fff", fontWeight: 600 }}>
              Installa
            </button>
          </div>
        </div>
      )}

      {vista === "benvenuto" && (
        <div>
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <button onClick={() => setVista("admin")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff", color: "#aaa" }}>
              Area operatori
            </button>
          </div>
          <Benvenuto onAvvia={() => setVista("cliente")} />
        </div>
      )}

      {vista === "cliente" && (
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 32, maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => { setVista("benvenuto"); setTicketAperto(null); }} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer" }}>
              ← Torna alla home
            </button>
            <button onClick={() => setVista("admin")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff", color: "#aaa" }}>
              Area operatori
            </button>
          </div>
          {!ticketAperto ? (
            <NuovoTicket onInviato={(ticket) => setTicketAperto(ticket)} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#166534" }}>
                Ticket #{ticketAperto.numero} aperto — puoi continuare a scrivere qui sotto
              </div>
              <Chat ticketId={ticketAperto.id} nomeCliente={ticketAperto.nome_cliente} ruolo="cliente" />
              <button onClick={() => { setTicketAperto(null); setVista("benvenuto"); }} style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Torna alla home
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}