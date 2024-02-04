import { ConnectionType, Settings } from "../types/settingsTypes";

export function parseAppSettings(): Settings {
  let connectionType: ConnectionType | undefined;
  let path: string | undefined;
  let host: string | undefined;
  let port: number | undefined;

  process.argv.forEach((option: string) => {
    const optionParts = option.split("=");

    if (optionParts.length === 2) {
      switch (optionParts[0]) {
        case "connectionType":
          connectionType = optionParts[1] as ConnectionType | undefined;
          break;
        case "path":
          path = optionParts[1];
          break;
        case "host":
          host = optionParts[1];
          break;
        case "port":
          port = parseInt(optionParts[1], 10);
          break;
      }
    }
  });

  if (connectionType === ConnectionType.Unix && path) {
    return {
      connectionType,
      path,
    };
  } else if (connectionType === ConnectionType.TCP && host && port) {
    return {
      connectionType,
      host,
      port,
    };
  } else {
    throw new Error("Invalid settings");
  }
}
