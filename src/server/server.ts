import { createServer, Socket } from "net";
import { randomUUID } from "crypto";

import { Message, MessageType } from "../common/types/messageTypes";
import { decodeMessage, encodeMessage } from "../common/utils/messageUtils";
import { ConnectionType, Settings } from "../common/types/settingsTypes";

export type Clients = {
  [clientId: string]: Socket;
};

export class Server {
  private clients: Clients = {};

  run = (settings: Settings, onData: (message: Message, socket: Socket, clients: Clients, clientId: string) => void) => {
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

          clientId = this.authenticate(socket, password);
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

    if (settings.connectionType === ConnectionType.TCP) {
      server.listen(settings.port, settings.host, () => {
        console.log(`Server listening on ${settings.host}:${settings.port}`);
      });
    } else {
      server.listen(settings.path, () => {
        console.log(`Server listening on path ${settings.path}`);
      });
    }
  };

  authenticate = (socket: Socket, password: string): string | undefined => {
    if (this.isValidPassword(password)) {
      const clientId = this.generateClientId();

      this.clients[clientId] = socket;
      this.sendMessage(socket, {
        type: MessageType.AuthenticationSucceeded,
        clientId,
      });

      return clientId;
    } else {
      this.sendMessage(socket, { type: MessageType.AuthenticationFailed });
      socket.end();

      return undefined;
    }
  };

  sendMessage = (socket: Socket, message: Message) => socket.write(encodeMessage(message));

  private isValidPassword = (password: string): boolean => password === "secret";

  private generateClientId = (): string => randomUUID();
}
