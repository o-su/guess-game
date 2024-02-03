import { Socket } from "net";

import { Message } from "../common/types/messageTypes";
import { decodeMessage, encodeMessage } from "../common/utils/messageUtils";

export class Client {
  private client: Socket;

  constructor() {
    this.client = new Socket();
  }

  connect = async (host: string, port: number): Promise<void> => new Promise((resolve) => this.client.connect(port, host, resolve));

  registerOnClose = (onClose: () => void) => this.client.on("close", onClose);

  registerOnMessage = (onMessage: (message: Message) => void) =>
    this.client.on("data", (data: Buffer) => {
      onMessage(decodeMessage(data));
    });

  sendMessage = (message: Message) => {
    this.client.write(encodeMessage(message));
  };

  close = () => this.client.end();
}
