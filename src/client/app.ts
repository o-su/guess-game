import { Message, MessageType } from "../common/types/messageTypes";
import { ConnectionType, Settings } from "../common/types/settingsTypes";
import { parseAppSettings } from "../common/utils/settingsUtils";
import { Client } from "./client";
import { CommandLineApi, PrintColor } from "./cmdApi";
import { Command } from "./types";

const settings = parseAppSettings();

const menu = `
Commands:
  ${Command.Help}                           displays this menu
  ${Command.Opponents}                      displays list of all available opponents
  ${Command.Match} <opponentId> <guessWord> starts match with selected opponent
  ${Command.Guess} <guessWord>              sends a guess to the opponent
  ${Command.Hint} <hint>                    sends a hint to the opponent
  ${Command.Surrender}                      ends the game with a loss
  ${Command.Quit}                           quits application
`;

class App {
  private commandLineApi: CommandLineApi;
  private client: Client;

  constructor(commandLineApi: CommandLineApi, client: Client) {
    this.commandLineApi = commandLineApi;
    this.client = client;
  }

  run = async (settings: Settings) => {
    try {
      await this.connect(settings);
      this.commandLineApi.print("Connected to server");
      this.client.registerOnClose(() => {
        this.commandLineApi.print("Connection closed");
        this.commandLineApi.close();
      });
      this.client.registerOnMessage(this.processMessage);
      this.commandLineApi.registerOnInput(this.handleInput);
    } catch {
      console.error("Failed to connect.");
    }
  };

  private connect = async (settings: Settings): Promise<void> => {
    if (settings.connectionType === ConnectionType.TCP) {
      return this.client.connectTcp(settings.host, settings.port);
    } else {
      return this.client.connectUnix(settings.path);
    }
  };

  private processMessage = (message: Message) => {
    switch (message.type) {
      case MessageType.HandshakeInitialization:
        this.commandLineApi.prompt("Hello, please provide your password: ", (password: string) => {
          this.client.sendMessage({
            type: MessageType.Authentication,
            password,
          });
        });

        break;
      case MessageType.AuthenticationSucceeded:
        this.commandLineApi.print(`Welcome, your client ID is ${message.clientId}.`);
        this.displayHelp();
        break;
      case MessageType.AuthenticationFailed:
        this.commandLineApi.print("Invalid password. Connection closed.", PrintColor.Red);
        break;
      case MessageType.OpponentsResponse:
        if (message.opponentsIds.length > 0) {
          this.commandLineApi.print(`Available opponents: ${message.opponentsIds.join(",")}`);
        } else {
          this.commandLineApi.print("There are no opponents available.", PrintColor.Red);
        }
        break;
      case MessageType.MatchSucceeded:
        this.commandLineApi.print(`The opponent has accepted your challenge.`);
        break;
      case MessageType.MatchFailed:
        this.commandLineApi.print(`The opponent did not accept your challenge. Please try again later.`);
        break;
      case MessageType.MatchAnnouncement:
        this.commandLineApi.print(`Player ${message.challengerId} challenged you to a duel.`, PrintColor.Yellow);
        break;
      case MessageType.Progress:
        this.commandLineApi.print(`Your opponent's guess: ${message.guessWord}`, PrintColor.Yellow);
        break;
      case MessageType.HintResponse:
        this.commandLineApi.print(`Your opponent sent you a hint: ${message.hint}`, PrintColor.Yellow);
        break;
      case MessageType.Win:
        this.commandLineApi.print("You won!");
        break;
      case MessageType.Surrender:
        this.commandLineApi.print("Your opponent has surrendered.");
        break;
      case MessageType.BadAttempt:
        this.commandLineApi.print("Bad guess, try again", PrintColor.Red);
        break;
      case MessageType.Error:
        this.commandLineApi.print(message.error, PrintColor.Red);
        break;
    }
  };

  private displayHelp = () => this.commandLineApi.print(menu);

  private handleInput = (input: string) => {
    const inputParts = input.split(" ");

    if (inputParts.length > 0) {
      const command = inputParts[0];

      switch (command) {
        case Command.Help:
          this.displayHelp();
          break;
        case Command.Opponents:
          this.client.sendMessage({
            type: MessageType.Opponents,
          });
          break;
        case Command.Match:
          if (inputParts.length === 3) {
            const opponentId = inputParts[1];
            const guessWord = inputParts[2];

            this.client.sendMessage({
              type: MessageType.MatchStart,
              opponentId,
              guessWord,
            });
          } else {
            this.handleInputError();
          }
          break;
        case Command.Guess:
          if (inputParts.length === 2) {
            const guessWord = inputParts[1];

            this.client.sendMessage({
              type: MessageType.Guess,
              guessWord,
            });
          } else {
            this.handleInputError();
          }
          break;
        case Command.Hint:
          if (inputParts.length === 2) {
            const hint = inputParts[1];

            this.client.sendMessage({
              type: MessageType.Hint,
              hint,
            });
          } else {
            this.handleInputError();
          }
          break;
        default:
          this.handleInputError();
          break;
        case Command.Surrender:
          this.client.sendMessage({
            type: MessageType.Surrender,
          });
          break;
        case Command.Quit:
          this.client.close();
          process.exit();
      }
    } else {
      this.handleInputError();
    }
  };

  private handleInputError = () => {
    this.commandLineApi.print("Unknown command");
    this.displayHelp();
  };
}

const commandLineApi = new CommandLineApi();
const client = new Client();
const app = new App(commandLineApi, client);

app.run(settings);
