import { Command } from "./types";

export const menu = `
Commands:
  ${Command.Help}                           displays this menu
  ${Command.Opponents}                      displays list of all available opponents
  ${Command.Match} <opponentId> <guessWord> starts match with selected opponent
  ${Command.Guess} <guessWord>              sends a guess to the opponent
  ${Command.Hint} <hint>                    sends a hint to the opponent
  ${Command.Surrender}                      ends the game with a loss
  ${Command.Quit}                           quits application
`;
