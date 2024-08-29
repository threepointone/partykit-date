import { createRoot } from "react-dom/client";
import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState<
    {
      serverDelta: number;
      clientDelta: number;
      hasError: boolean;
    }[]
  >([]);
  const socket = usePartySocket({
    room: "room",
    onMessage: (packet) => {
      try {
        const data = JSON.parse(packet.data);
        const serverDelta = data.payload.timestamp - data.payload.prevTimestamp;
        const clientDelta =
          data.payload.clientTimestamp - data.payload.prevClientTimestamp;

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            serverDelta,
            clientDelta,
            hasError: serverDelta < clientDelta,
          },
        ]);
      } catch (err) {
        console.log("error", err);
      }
    },
  });

  function send(type: string, payload = {}) {
    socket.send(
      JSON.stringify({
        type,

        payload: {
          ...payload,
          timestamp: Date.now(),
        },
      })
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      send("ping");
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index} style={{ display: "flex", gap: "8px" }}>
          <p>
            Server delta: <b>{message.serverDelta}ms</b>
          </p>
          <p>
            Client delta: <b>{message.clientDelta}ms</b>
          </p>
        </div>
      ))}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
