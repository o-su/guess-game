import { TextDecoder, TextEncoder } from "util";

import { Message, messageProperties } from "../types/messageTypes";

export function encodeMessage(message: Message): Buffer {
  const compressedDictionary = compressDictionary(message, messageProperties);

  return Buffer.from(new TextEncoder().encode(JSON.stringify(compressedDictionary)));
}

export function decodeMessage(data: Buffer): Message {
  const parsedData = JSON.parse(new TextDecoder().decode(data));

  return decompressDictionary(parsedData, messageProperties);
}

function compressDictionary<T extends {}>(dictionary: T, mapping: string[]): T {
  return Object.fromEntries(Object.entries(dictionary).map(([k, v]) => [mapping.indexOf(k), v])) as T;
}

function decompressDictionary<T extends {}>(dictionary: T, mapping: string[]): T {
  return Object.fromEntries(Object.entries(dictionary).map(([k, v]) => [mapping[k as unknown as number], v])) as T;
}
