import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import NuovoTicket from "./components/NuovoTicket";
import Chat from "./components/Chat";
import PannelloAdmin from "./components/PannelloAdmin";
import Login from "./components/Login";

export default function App() {
  const [utente, setUtente] = useState(null);
  const [vista, setVista] = useState("cliente");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUtente(data.session?.user ?? null);
    });
  }, []);

  function logout() {
    supabase.auth.signOut();
    setUtente(null);
    setVista("cliente");
  }

  if (vista === "admin" && !utente) return <Login onLogin={(u) => setUtente(u)} />;
  if (vista === "admin" && utente) return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={logout} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}>
          Esci ({utente.email})
        </button>
      </div>
      <PannelloAdmin />
    </div>
  );

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setVista("admin")} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}>
          Area operatori
        </button>
      </div>
      <NuovoTicket />
      <Chat />
    </div>
  );
}