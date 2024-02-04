import { Socket } from "net";

import { Clients, Server } from "./server";
import { Message, MessageType } from "../common/types/messageTypes";
import { Settings } from "../common/types/settingsTypes";
import { parseAppSettings } from "../common/utils/settingsUtils";

const settings = parseAppSettings();

type Match = {
  challengerId: string;
  opponentId: string;
  guessWord: string;
};

class App {
  private server: Server;
  private matches: Match[] = [];

  constructor(server: Server) {
    this.server = server;
  }

  run = (settings: Settings) => {
    this.server.run(settings, (message: Message, socket: Socket, clients: Clients, clientId: string) => {
      switch (message.type) {
        case MessageType.Opponents:
          const opponentsIds = Object.keys(clients).filter((client) => client !== clientId);

          this.server.sendMessage(socket, {
            type: MessageType.OpponentsResponse,
            opponentsIds,
          });
          break;
        case MessageType.MatchStart:
          const opponentConnected = clients.hasOwnProperty(message.opponentId);
          const opponentAvailable = !this.matches.some(
            (match) => match.challengerId === message.opponentId || match.opponentId === message.opponentId
          );

          if (opponentConnected && opponentAvailable) {
            this.matches.push({ challengerId: clientId, opponentId: message.opponentId, guessWord: message.guessWord });
            this.server.sendMessage(socket, {
              type: MessageType.MatchSucceeded,
            });
            this.server.sendMessage(clients[message.opponentId], {
              type: MessageType.MatchAnnouncement,
              challengerId: clientId,
            });
          } else {
            this.server.sendMessage(socket, {
              type: MessageType.MatchFailed,
            });
          }

          break;
        case MessageType.Guess:
          const match = this.matches.find((match) => match.opponentId === clientId);

          if (match) {
            if (match.guessWord === message.guessWord) {
              this.closeMatch(clientId);
              this.server.sendMessage(socket, {
                type: MessageType.Win,
              });
            } else {
              this.server.sendMessage(socket, {
                type: MessageType.BadAttempt,
              });
            }

            this.server.sendMessage(clients[match.challengerId], {
              type: MessageType.Progress,
              guessWord: message.guessWord,
            });
          } else {
            // TODO: error
          }

          break;
        case MessageType.Hint:
          this.propagateHint(message.hint, clients, clientId);
          break;
        case MessageType.Surrender:
          this.propagateSurrender(clients, clientId);
          this.closeMatch(clientId);
          break;
      }
    });
  };

  private closeMatch = (opponentId: string) => {
    this.matches = this.matches.filter((match) => match.opponentId !== opponentId);
  };

  private propagateHint = (hint: string, clients: Clients, clientId: string) => {
    const match = this.matches.find((match) => match.challengerId === clientId);

    if (match) {
      this.server.sendMessage(clients[match.opponentId], {
        type: MessageType.HintResponse,
        hint,
      });
    } else {
      // TODO: error
    }
  };

  private propagateSurrender = (clients: Clients, clientId: string) => {
    const match = this.matches.find((match) => match.opponentId === clientId);

    if (match) {
      this.server.sendMessage(clients[match.challengerId], {
        type: MessageType.Surrender,
      });
    } else {
      // TODO: error
    }
  };
}

const server = new Server();
const app = new App(server);

app.run(settings);
