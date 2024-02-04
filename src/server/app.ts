import { Socket } from "net";

import { Clients, Server } from "./server";
import { Message, MessageType } from "../common/types/messageTypes";
import { Settings } from "../common/types/settingsTypes";
import { parseAppSettings } from "../common/utils/settingsUtils";
import { WebServer } from "./webServer";
import { WebBuilder } from "./webBuilder";

const settings = parseAppSettings();

type Match = {
  challengerId: string;
  opponentId: string;
  guessWord: string;
};

class App {
  private server: Server;
  private webServer: WebServer;
  private matches: Match[] = [];

  constructor(server: Server, webServer: WebServer) {
    this.server = server;
    this.webServer = webServer;
  }

  run = (settings: Settings) => {
    this.webServer
      .registerOnRequest(() =>
        new WebBuilder()
          .addContent("<h1>Active Matches</h1>")
          .addContent("<table>")
          .addContent("<thead><tr><th>Challenger</th><th>Opponent</th><th>Guess Word</th></tr></thead>")
          .addContent("<tbody>")
          .addContent(
            this.matches
              .map((match) => `<tr><td>${match.challengerId}</td><td>${match.opponentId}</td><td>${match.guessWord}</td></tr>`)
              .join("")
          )
          .addContent("</tbody>")
          .addContent("</table>")

          .build()
      )
      .run(8080);

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
          const challengerAvailable = !this.matches.some((match) => match.challengerId === clientId || match.opponentId === clientId);

          if (opponentConnected && opponentAvailable && challengerAvailable) {
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
            this.server.sendMessage(clients[clientId], {
              type: MessageType.Error,
              error: "Could not find a match.",
            });
          }

          break;
        case MessageType.Hint:
          this.propagateHint(message.hint, clients, clientId);
          break;
        case MessageType.Surrender:
          this.propagateSurrender(clients, clientId);
          this.closeMatch(clientId);
          break;
        default:
          this.server.sendMessage(clients[clientId], {
            type: MessageType.Error,
            error: "Unknown command",
          });
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
      this.server.sendMessage(clients[clientId], {
        type: MessageType.Error,
        error: "Could not find a match.",
      });
    }
  };

  private propagateSurrender = (clients: Clients, clientId: string) => {
    const match = this.matches.find((match) => match.opponentId === clientId);

    if (match) {
      this.server.sendMessage(clients[match.challengerId], {
        type: MessageType.Surrender,
      });
    } else {
      this.server.sendMessage(clients[clientId], {
        type: MessageType.Error,
        error: "Could not find a match.",
      });
    }
  };
}

const server = new Server();
const webServer = new WebServer();
const app = new App(server, webServer);

app.run(settings);
