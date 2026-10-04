import { crearMensaje } from "./mensajes";
import { textoBienvenida } from "./teo";

function nuevoId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function tituloDe(texto) {
  const limpio = String(texto || "").replace(/\s+/g, " ").trim();
  if (!limpio) return "Nueva conversación";
  if (limpio.length <= 42) return limpio;
  return `${limpio.slice(0, 42).trim()}…`;
}

export function crearConversacion(plan, ahora = new Date()) {
  const en = ahora.toISOString();
  return {
    id: nuevoId(),
    titulo: "Nueva conversación",
    creada: en,
    actualizada: en,
    mensajes: [crearMensaje("teo", textoBienvenida(plan))],
  };
}

export function conversacionActiva(plan) {
  return (plan.conversaciones || []).find((item) => item.id === plan.activa) || null;
}

export function ponerAlFrente(plan, id) {
  const indice = plan.conversaciones.findIndex((item) => item.id === id);
  if (indice <= 0) return;
  const [item] = plan.conversaciones.splice(indice, 1);
  plan.conversaciones.unshift(item);
}

export function asegurarConversaciones(plan) {
  let cambio = false;

  if (!Array.isArray(plan.conversaciones)) {
    const previas = Array.isArray(plan.mensajes) ? plan.mensajes : [];
    if (previas.length) {
      const paciente = previas.find((mensaje) => mensaje.de === "paciente");
      const creada = previas[0]?.en || new Date().toISOString();
      plan.conversaciones = [
        {
          id: nuevoId(),
          titulo: paciente ? tituloDe(paciente.texto) : "Acompañamiento",
          creada,
          actualizada: previas[previas.length - 1]?.en || creada,
          mensajes: previas,
        },
      ];
    } else {
      const conversacion = crearConversacion(plan);
      plan.conversaciones = [conversacion];
    }
    plan.activa = plan.conversaciones[0].id;
    cambio = true;
  }

  if (Object.prototype.hasOwnProperty.call(plan, "mensajes")) {
    delete plan.mensajes;
    cambio = true;
  }

  const existe = plan.conversaciones.some((item) => item.id === plan.activa);
  if (!existe) {
    plan.activa = plan.conversaciones[0]?.id || "";
    cambio = true;
  }

  return cambio;
}
