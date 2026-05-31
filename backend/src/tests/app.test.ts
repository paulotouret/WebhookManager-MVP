import 'dotenv/config';
import { describe, expect, it } from 'vitest';
import { app } from '../main/app';

describe('App', () => {
  it('should return 200 and a message for the root route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: 'Webhook Manager API is running',
    });
  });
});
