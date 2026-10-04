import { conversacionActiva, crearConversacion, asegurarConversaciones } from "./conversaciones";
import { aplicarReloj, asegurarHoy } from "./reloj";

export function prepararPlan(plan, ahora) {
  let cambio = asegurarHoy(plan, ahora);
  if (!plan.avisos) {
    plan.avisos = [];
    cambio = true;
  }
  if (asegurarConversaciones(plan)) cambio = true;

  const preguntas = aplicarReloj(plan, ahora);
  if (preguntas.length) {
    let activa = conversacionActiva(plan);
    if (!activa) {
      activa = crearConversacion(plan, ahora);
      plan.conversaciones.unshift(activa);
      plan.activa = activa.id;
    }
    activa.mensajes.push(...preguntas);
    activa.actualizada = ahora.toISOString();
    cambio = true;
  }
  return cambio;
}
