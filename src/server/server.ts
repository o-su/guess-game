import { createServer, Socket } from "net";
import { randomUUID } from "crypto";

import { Message, MessageType } from "../common/types/messageTypes";
import { decodeMessage, encodeMessage } from "../common/utils/messageUtils";

export class Server {
  private clients: { [clientId: string]: Socket } = {};

  run = (port: number, onData: (socket: Socket, message: Message) => void) => {
    this.clients = {};

    const server = createServer((socket) => {
      console.log("Client connected");
      let clientId: string | undefined;

      this.sendMessage(socket, { type: MessageType.HandshakeInitialization });

      socket.on("data", (data: Buffer) => {
        const message: Message = decodeMessage(data);

        if (clientId) {
          onData(socket, message);
        } else if (
          !clientId &&
          message.type === MessageType.AuthenticationRequest
        ) {
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
    });

    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  };

  sendMessage = (socket: Socket, message: Message) =>
    socket.write(encodeMessage(message));

  isValidPassword = (password: string): boolean => password === "secret";

  generateClientId = (): string => randomUUID();
}
