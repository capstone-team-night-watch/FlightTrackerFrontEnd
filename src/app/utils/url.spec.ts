import { Url } from "src/lib/utils/url";

describe('Url', () => {
  it('should append the provided path to the producer base URL', () => {
    const path = '/producer';

    const expected = '/producer';

    expect(Url.socket(path)).toEqual(expected);
  });

  it('should append the provided path to the consumer base URL', () => {
    const path = '/example';
    const expectedUrl = 'http://localhost:5000' + path;

    const result = Url.consumer(path);

    expect(result).toBe(expectedUrl);
  });
});
