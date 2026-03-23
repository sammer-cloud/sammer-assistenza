import NuovoTicket from "./components/NuovoTicket";
import Chat from "./components/Chat";
import PannelloAdmin from "./components/PannelloAdmin";

export default function App() {
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 40 }}>
      <NuovoTicket />
      <Chat />
      <PannelloAdmin />
    </div>
  );
}