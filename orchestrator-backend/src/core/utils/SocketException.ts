// Dummy exception class for XR-IT
// TO DO: Implement a proper error object with error codes
export class SocketException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Exception";
    this.message = message;
    console.log(`\x1b[31m\x1b[1mNew exception:\x1b[0m \x1b[31m${message}\x1b[0m\n`);
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
