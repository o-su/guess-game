export type Settings = {
    connectionType: ConnectionType.Unix;
    path: string;
} | {
    connectionType: ConnectionType.TCP;
    host: string;
    port: number;
}

export enum ConnectionType {
    Unix = "unix",
    TCP = "tcp"
}