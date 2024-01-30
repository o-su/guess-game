import { Message } from "../types/messageTypes";

export function decodeMessage(data: Buffer): Message {
  return JSON.parse(data.toString("utf8").trim()); // TODO: implement custom protocol
}

export function encodeMessage(message: Message): Buffer {
  return Buffer.from(JSON.stringify(message), "utf8"); // TODO: implement custom protocol
}
