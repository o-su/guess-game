import {createServer} from "http";

export class WebServer {
  private onRequest: () => string;

  constructor() {
    this.onRequest = () => "Welcome to the guessing game.";
  }

  registerOnRequest = (onRequest: () => string): this => {
    this.onRequest = onRequest;

    return this;
  };

  run = (port: number) => {
    const server = createServer((req, res) => {
      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(this.onRequest());
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    });

    server.listen(port, () => {
      console.log(`Webserver running at http://localhost:${port}/`);
    });
  };
}
