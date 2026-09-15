export async function onRequest({ request, env }) {
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, env.API_ORIGIN);
  return fetch(new Request(target, request));
}