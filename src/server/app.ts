import { Socket } from "net";

import { Server } from "./server";
import { Message } from "../common/types/messageTypes";

const port = 4000;

class App {
  private server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  run = (port: number) => {
    this.server.run(port, (socket: Socket, message: Message) => {
      // TODO: implement game mechanics
    });
  };
}

const server = new Server();
const app = new App(server);

app.run(port);
