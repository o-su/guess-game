const renderBaseHtml = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Guessing Game</title>
</head>
<body>
    ${content}
</body>
</html>`;

export class WebBuilder {
  private content: string[] = [];

  addContent = (content: string): this => {
    this.content.push(content);

    return this;
  };

  build = (): string => renderBaseHtml(this.content.join("\n"));
}
