export class UIError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UIError.prototype);
  }

  sayHello() {
    return 'hello ' + this.message;
  }
}
