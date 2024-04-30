import { UIError } from './error';

// Just for code coverage
describe('UIError', () => {
  let error: UIError;

  beforeEach(() => {
    error = new UIError('new error');
  });

  it('should initialize', () => {
    expect(error).toBeTruthy();
  });

  it('should say hello', () => {
    expect(error.sayHello()).toEqual('hello new error');
  });
});
