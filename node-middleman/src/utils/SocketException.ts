export class SocketException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Exception";
    this.message = message;
    console.log(`\x1b[31mNew exception: ${message}\x1b[0m`);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
      },
    };
  }
}