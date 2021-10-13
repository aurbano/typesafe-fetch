// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';

import { baseUrl } from '../index.test';

export default [
  rest.post(`${baseUrl}/pet/123/uploadImage`, (_, res, ctx) => res(ctx.json({ code: 5 }))),
  rest.get(`${baseUrl}/pet/findByStatus`, (req, res, ctx) => {
    const query = req.url.searchParams;
    const status = query.get('status');

    if (status !== 'available') {
      return res(ctx.json([]));
    }

    return res(ctx.json([{ name: 'test-name', photoUrls: ['test-url'] }]));
  }),
];
