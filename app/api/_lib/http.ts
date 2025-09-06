export function badRequest(msg: string) {
  return Response.json({ error: msg }, { status: 400 });
}
export function serverError(msg: string) {
  return Response.json({ error: msg }, { status: 500 });
}
export function ok(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}
