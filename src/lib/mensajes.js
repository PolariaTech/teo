export function crearMensaje(de, texto) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    de,
    texto,
    en: new Date().toISOString(),
  };
}
