export const onRequestGet = async () => {
  return Response.json({
    ok: true,
    service: "salud-neurofuncional",
    timestamp: new Date().toISOString()
  });
};
