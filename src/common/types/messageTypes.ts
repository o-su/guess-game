export enum MessageProperty {
  Type = "type",
  ClientId = "clientId",
  Password = "password",
}

export const messageProperties = Object.values(MessageProperty)

export type Message =
  | {
      [MessageProperty.Type]: MessageType.HandshakeInitialization;
    }
  | {
      [MessageProperty.Type]: MessageType.AuthenticationRequest;
      [MessageProperty.Password]: string;
    }
  | {
      [MessageProperty.Type]: MessageType.AuthenticationSucceeded;
      [MessageProperty.ClientId]: string;
    }
  | {
      [MessageProperty.Type]: MessageType.AuthenticationFailed;
    };

export enum MessageType {
  HandshakeInitialization,
  AuthenticationRequest,
  AuthenticationSucceeded,
  AuthenticationFailed,
}
