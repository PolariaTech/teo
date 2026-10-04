import { fechaLocal, minutosDeHorario, minutosDelDia } from "./fecha";
import { crearMensaje } from "./mensajes";
import { itemsDelPlan } from "./plan";
import { preguntaDeReloj } from "./teo";

export function asegurarHoy(plan, ahora) {
  const hoy = fechaLocal(ahora);
  let cambio = false;

  for (const item of itemsDelPlan(plan)) {
    if (!item.hoy || item.hoy.fecha !== hoy) {
      item.hoy = {
        fecha: hoy,
        estado: "pendiente",
        preguntado: false,
        registro: null,
      };
      cambio = true;
    }
  }

  return cambio;
}

export function aplicarReloj(plan, ahora) {
  const minutos = minutosDelDia(ahora);
  const mensajes = [];

  for (const item of itemsDelPlan(plan)) {
    if (!item.hoy || item.hoy.estado !== "pendiente" || item.hoy.preguntado) continue;
    if (minutos < minutosDeHorario(item.horario)) continue;
    item.hoy.preguntado = true;
    mensajes.push(crearMensaje("teo", preguntaDeReloj(plan, item)));
  }

  return mensajes;
}
