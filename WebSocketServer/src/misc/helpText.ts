export function getHelpText(): string {
    return "How to connect the client:\n" +
    "1) start the server:\n" +
    "Without external file:\n ... server.ts\n" +
    "With external file:\n ... server.ts <FILEPATH> <NAME>\n" +
    "2) connect the client:\n" +
    " ... client.ts ws://localhost:<PORT>";
}
