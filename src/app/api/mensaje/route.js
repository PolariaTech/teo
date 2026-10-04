import { ErrorDeModelo, responderConModelo } from "../../../lib/agente";
import { actualizarPlan } from "../../../lib/archivo";
import {
  conversacionActiva,
  crearConversacion,
  ponerAlFrente,
  tituloDe,
} from "../../../lib/conversaciones";
import { crearMensaje } from "../../../lib/mensajes";
import { prepararPlan } from "../../../lib/preparar";
import { respuestaDeCuidado } from "../../../lib/teo";

function errorParaLaPersona(error) {
  if (!(error instanceof ErrorDeModelo)) return "No pude registrar el mensaje.";
  if (error.codigo === "sin_clave") {
    return "Falta la clave del modelo. Escríbela en .env.local como OPENAI_API_KEY y reinicia el servidor.";
  }
  if (error.codigo === "clave_invalida") {
    return "La clave del modelo no fue aceptada. Revísala en .env.local y reinicia el servidor.";
  }
  return "No pude consultar el modelo en este momento. Intenta de nuevo.";
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ error: "No pude leer el mensaje." }, { status: 400 });
  }

  const texto = String(cuerpo.texto || "").trim();
  if (!texto) {
    return Response.json({ error: "Escribe un mensaje." }, { status: 400 });
  }
  if (texto.length > 2000) {
    return Response.json({ error: "El mensaje es muy largo." }, { status: 400 });
  }

  try {
    const plan = await actualizarPlan(async (estado) => {
      const ahora = new Date();
      prepararPlan(estado, ahora);
      let activa = conversacionActiva(estado);
      if (!activa) {
        activa = crearConversacion(estado, ahora);
        estado.conversaciones.unshift(activa);
        estado.activa = activa.id;
      }
      const respuesta = respuestaDeCuidado(estado, texto, ahora)
        || await responderConModelo(estado, activa, texto);
      if (activa.titulo === "Nueva conversación") {
        activa.titulo = tituloDe(texto);
      }
      activa.mensajes.push(crearMensaje("paciente", texto));
      activa.mensajes.push(crearMensaje("teo", respuesta));
      activa.actualizada = ahora.toISOString();
      ponerAlFrente(estado, activa.id);
      return true;
    });
    return Response.json(plan);
  } catch (error) {
    const codigo = error instanceof ErrorDeModelo && error.codigo === "sin_clave" ? 503 : 500;
    return Response.json({ error: errorParaLaPersona(error) }, { status: codigo });
  }
}
