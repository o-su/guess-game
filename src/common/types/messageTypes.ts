export enum MessageProperty {
  Type = "type",
  ClientId = "clientId",
  Password = "password",
  OpponentsIds = "opponentsIds",
  OpponentId = "opponentId",
  GuessWord = "guessWord",
  Hint = "hint",
  ChallengerId = "challengerId",
}

export const messageProperties = Object.values(MessageProperty);

export type Message =
  | {
      [MessageProperty.Type]: MessageType.HandshakeInitialization;
    }
  | {
      [MessageProperty.Type]: MessageType.Authentication;
      [MessageProperty.Password]: string;
    }
  | {
      [MessageProperty.Type]: MessageType.AuthenticationSucceeded;
      [MessageProperty.ClientId]: string;
    }
  | {
      [MessageProperty.Type]: MessageType.AuthenticationFailed;
    }
  | { [MessageProperty.Type]: MessageType.Opponents }
  | {
      [MessageProperty.Type]: MessageType.OpponentsResponse;
      [MessageProperty.OpponentsIds]: string[];
    }
  | {
      [MessageProperty.Type]: MessageType.MatchStart;
      [MessageProperty.OpponentId]: string;
      [MessageProperty.GuessWord]: string;
    }
  | { [MessageProperty.Type]: MessageType.MatchSucceeded }
  | { [MessageProperty.Type]: MessageType.MatchFailed }
  | { [MessageProperty.Type]: MessageType.MatchAnnouncement; [MessageProperty.ChallengerId]: string }
  | { [MessageProperty.Type]: MessageType.Guess; [MessageProperty.GuessWord]: string }
  | { [MessageProperty.Type]: MessageType.Progress; [MessageProperty.GuessWord]: string }
  | { [MessageProperty.Type]: MessageType.Hint; [MessageProperty.Hint]: string }
  | { [MessageProperty.Type]: MessageType.HintResponse; [MessageProperty.Hint]: string }
  | { [MessageProperty.Type]: MessageType.Win }
  | { [MessageProperty.Type]: MessageType.BadAttempt }
  | { [MessageProperty.Type]: MessageType.Surrender };

export enum MessageType {
  HandshakeInitialization,
  Authentication,
  AuthenticationSucceeded,
  AuthenticationFailed,
  Opponents,
  OpponentsResponse,
  MatchStart,
  MatchSucceeded,
  MatchFailed,
  MatchAnnouncement,
  Guess,
  Progress,
  Hint,
  HintResponse,
  Win,
  BadAttempt,
  Surrender,
  Quit,
}
