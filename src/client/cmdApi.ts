import { Interface, createInterface } from "readline";

export class CommandLineApi {
  cmdApi: Interface;

  constructor() {
    this.cmdApi = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  prompt = (message: string, onResponse: (response: string) => void) => {
    this.cmdApi.question(message, onResponse);
  };

  print = (message: string) => this.cmdApi.write(message + "\n");

  close = () => this.cmdApi.close();
}
