import { Message, MessageType } from "../common/types/messageTypes";
import { Client } from "./client";
import { CommandLineApi } from "./cmdApi";

const host = "127.0.0.1";
const port = 4000;

const commandLineApi = new CommandLineApi();
const client = new Client();

client
  .connect(host, port)
  .then(() => commandLineApi.print("Connected to server"));

client.registerOnClose(() => {
  commandLineApi.print("Connection closed");
  commandLineApi.close();
});

client.registerOnMessage((message: Message) => {
  switch (message.type) {
    case MessageType.HandshakeInitialization:
      commandLineApi.prompt(
        "Hello, please provide your password: ",
        (password: string) => {
          client.sendMessage({
            type: MessageType.AuthenticationRequest,
            password,
          });
        }
      );

      break;
    case MessageType.AuthenticationSucceeded:
      commandLineApi.print(`Welcome, your client ID is ${message.clientId}.`);
      break;
    case MessageType.AuthenticationFailed:
      commandLineApi.print("Invalid password. Connection closed.");
      break;
  }
  // TODO: implement game mechanics
});
