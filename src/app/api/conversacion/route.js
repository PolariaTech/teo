import { actualizarPlan } from "../../../lib/archivo";
import {
  conversacionActiva,
  crearConversacion,
} from "../../../lib/conversaciones";
import { prepararPlan } from "../../../lib/preparar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ error: "No pude leer la solicitud." }, { status: 400 });
  }

  const accion = cuerpo.accion;
  if (accion !== "nueva" && accion !== "abrir" && accion !== "eliminar") {
    return Response.json({ error: "No entendí esa acción." }, { status: 400 });
  }

  try {
    const plan = await actualizarPlan((estado) => {
      const preparo = prepararPlan(estado, new Date());
      if (accion === "nueva") {
        const conversacion = crearConversacion(estado, new Date());
        estado.conversaciones.unshift(conversacion);
        estado.activa = conversacion.id;
        return true;
      }

      const id = String(cuerpo.id || "");
      const existe = estado.conversaciones.some((item) => item.id === id);
      if (!existe) return preparo;

      if (accion === "abrir") {
        estado.activa = id;
        return true;
      }

      estado.conversaciones = estado.conversaciones.filter((item) => item.id !== id);
      if (estado.activa === id) {
        estado.activa = estado.conversaciones[0]?.id || "";
      }
      if (!estado.activa && estado.conversaciones.length === 0) {
        return true;
      }
      if (!conversacionActiva(estado) && estado.conversaciones[0]) {
        estado.activa = estado.conversaciones[0].id;
      }
      return true;
    });
    return Response.json(plan);
  } catch (error) {
    const disco = ["EROFS", "EACCES", "EPERM", "ENOENT"].includes(error?.code);
    return Response.json(
      {
        error: disco
          ? "No pude guardar la conversación en el servidor."
          : "No pude actualizar el historial.",
      },
      { status: 500 }
    );
  }
}
