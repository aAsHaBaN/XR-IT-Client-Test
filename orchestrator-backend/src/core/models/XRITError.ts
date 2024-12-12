export class XRITError extends Error {
    public code: number
    
    constructor(message: string, code: number) {
      super(message);      
      this.message = message;
      this.code = code;
      
      console.log(`\x1b[31m\x1b[1mNew error:\x1b[0m \x1b[31m${message}\x1b[0m\n`);
    }
  
    serialize() {
      return {
        error: {
          name: this.name,
          message: this.message,
          code: this.code
        },
      };
    }
  }
  