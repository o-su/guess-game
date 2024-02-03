import { createServer, Socket } from "net";
import { randomUUID } from "crypto";

import { Message, MessageType } from "../common/types/messageTypes";
import { decodeMessage, encodeMessage } from "../common/utils/messageUtils";

export type Clients = {
  [clientId: string]: Socket;
};

export class Server {
  private clients: Clients = {};

  run = (port: number, onData: (message: Message, socket: Socket, clients: Clients, clientId: string) => void) => {
    this.clients = {};

    const server = createServer((socket) => {
      console.log("Client connected");
      let clientId: string | undefined;

      this.sendMessage(socket, { type: MessageType.HandshakeInitialization });

      socket.on("data", (data: Buffer) => {
        const message: Message = decodeMessage(data);

        if (clientId) {
          onData(message, socket, this.clients, clientId);
        } else if (!clientId && message.type === MessageType.Authentication) {
          const password = message.password;

          if (this.isValidPassword(password)) {
            clientId = this.generateClientId();

            this.clients[clientId] = socket;
            this.sendMessage(socket, {
              type: MessageType.AuthenticationSucceeded,
              clientId,
            });
          } else {
            this.sendMessage(socket, { type: MessageType.AuthenticationFailed });
            socket.end();
          }
        } else {
          this.sendMessage(socket, { type: MessageType.HandshakeInitialization });
        }
      });

      socket.on("end", () => {
        console.log("Client disconnected");

        if (clientId) {
          delete this.clients[clientId];
        }
      });

      socket.on("error", console.error);
    });

    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  };

  sendMessage = (socket: Socket, message: Message) => socket.write(encodeMessage(message));

  private isValidPassword = (password: string): boolean => password === "secret";

  private generateClientId = (): string => randomUUID();
}
