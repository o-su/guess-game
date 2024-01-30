export type Message =
  | {
      type: MessageType.HandshakeInitialization;
    }
  | {
      type: MessageType.AuthenticationRequest;
      password: string;
    }
  | {
      type: MessageType.AuthenticationSucceeded;
      clientId: string;
    }
  | {
      type: MessageType.AuthenticationFailed;
    };

export enum MessageType {
  HandshakeInitialization = "HandshakeInitialization",
  AuthenticationRequest = "AuthenticationRequest",
  AuthenticationSucceeded = "AuthenticationSucceeded",
  AuthenticationFailed = "AuthenticationFailed",
}
