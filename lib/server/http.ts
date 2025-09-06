export const ok = (data: unknown, init?: ResponseInit) =>
  Response.json(data, init);

export const badRequest = (msg: string) =>
  Response.json({ error: msg }, { status: 400 });

export const serverError = (msg: string) =>
  Response.json({ error: msg }, { status: 500 });
