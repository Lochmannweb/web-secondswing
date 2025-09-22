import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

let clients = new Map(); // socket -> userId

// Når en ny client forbinder
wss.on("connection", (ws) => {
  console.log("Ny klient forbundet");

  // Når der modtages en besked
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "register") {
        // registrér bruger-id (fx user123)
        clients.set(ws, data.userId);
        console.log(`Bruger registreret: ${data.userId}`);
      }

      if (data.type === "message") {
        // videresend til den rigtige modtager
        const { to, text } = data;
        for (let [client, userId] of clients) {
          if (userId === to && client.readyState === 1) {
            client.send(
              JSON.stringify({
                from: clients.get(ws),
                text,
              })
            );
          }
        }
      }
    } catch (err) {
      console.error("Fejl i besked:", err);
    }
  });

  ws.on("close", () => {
    console.log("Klient afbrudt");
    clients.delete(ws);
  });
});

// Start server
server.listen(3000, () => {
  console.log("Server kører på http://localhost:3000");
});
