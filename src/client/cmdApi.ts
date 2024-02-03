import { Interface, createInterface } from "readline";

export enum PrintColor {
  White = "",
  Yellow = "\x1b[33m%s\x1b[0m",
  Red = "\x1b[31m",
}

export class CommandLineApi {
  cmdApi: Interface;

  constructor() {
    this.cmdApi = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  registerOnInput = (onInput: (input: string) => void) => {
    this.cmdApi.on("line", onInput);
  };

  prompt = (message: string, onResponse: (response: string) => void) => this.cmdApi.question(message, onResponse);

  print = (message: string, color: PrintColor = PrintColor.White) => console.log(color, message, "\x1b[0m");

  close = () => this.cmdApi.close();
}
