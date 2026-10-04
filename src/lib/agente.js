import { consultarHistoria } from "./historia";
import { instruccionesDeTeo } from "./prompt";

export const MODELO = process.env.OPENAI_MODEL || "gpt-6-luna";

const HERRAMIENTA = {
  type: "function",
  name: "consultar_historia_clinica",
  description:
    "Lee la historia clínica del acompañamiento: paciente, profesional, medicamentos, tareas, consejos autorizados, límites y avisos. Úsala antes de responder.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      apartado: {
        type: "string",
        enum: ["completa", "medicamentos", "tareas", "consejos", "avisos"],
        description: "Parte de la historia que necesitas. Usa completa si dudas.",
      },
    },
    required: ["apartado"],
    additionalProperties: false,
  },
};

export class ErrorDeModelo extends Error {
  constructor(codigo) {
    super(codigo);
    this.name = "ErrorDeModelo";
    this.codigo = codigo;
  }
}

function historial(conversacion, entrada) {
  const previos = (conversacion.mensajes || []).slice(-12).map((mensaje) => ({
    role: mensaje.de === "paciente" ? "user" : "assistant",
    content: mensaje.texto,
  }));
  previos.push({ role: "user", content: entrada });
  return previos;
}

function textoDe(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const partes = [];
  for (const item of data.output || []) {
    if (item.type !== "message") continue;
    for (const bloque of item.content || []) {
      if (bloque.type === "output_text" && bloque.text) partes.push(bloque.text);
    }
  }
  return partes.join("\n").trim();
}

function ejecutar(plan, llamada) {
  if (llamada.name !== "consultar_historia_clinica") {
    return { error: "Esa herramienta no está disponible." };
  }
  let argumentos = {};
  try {
    argumentos = JSON.parse(llamada.arguments || "{}");
  } catch {
    argumentos = {};
  }
  return consultarHistoria(plan, argumentos.apartado);
}

async function pedir(clave, cuerpo) {
  let respuesta;
  try {
    respuesta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    throw new ErrorDeModelo("modelo");
  }

  if (respuesta.status === 401 || respuesta.status === 403) {
    throw new ErrorDeModelo("clave_invalida");
  }
  if (!respuesta.ok) {
    throw new ErrorDeModelo("modelo");
  }
  try {
    return await respuesta.json();
  } catch {
    throw new ErrorDeModelo("modelo");
  }
}

async function completar(clave, plan, entrada, conversacion, esfuerzo) {
  let input = historial(conversacion, entrada);
  let anterior = null;

  for (let paso = 0; paso < 4; paso += 1) {
    const data = await pedir(clave, {
      model: MODELO,
      instructions: instruccionesDeTeo(plan),
      input,
      tools: [HERRAMIENTA],
      tool_choice: paso === 0
        ? { type: "function", name: "consultar_historia_clinica" }
        : "auto",
      reasoning: { effort: esfuerzo },
      max_output_tokens: 4096,
      store: true,
      ...(anterior ? { previous_response_id: anterior } : {}),
    });

    anterior = data.id || null;
    const salida = Array.isArray(data.output) ? data.output : [];
    const llamadas = salida.filter((item) => item && item.type === "function_call" && item.call_id);
    if (!llamadas.length) {
      const texto = textoDe(data);
      if (texto) return texto;
      throw new ErrorDeModelo("sin_respuesta");
    }

    input = llamadas.map((llamada) => ({
      type: "function_call_output",
      call_id: llamada.call_id,
      output: JSON.stringify(ejecutar(plan, llamada)),
    }));
  }

  throw new ErrorDeModelo("sin_respuesta");
}

export async function responderConModelo(plan, conversacion, entrada) {
  const clave = String(process.env.OPENAI_API_KEY || "").trim();
  if (!clave) throw new ErrorDeModelo("sin_clave");

  try {
    return await completar(clave, plan, entrada, conversacion, "low");
  } catch (error) {
    if (error?.codigo !== "sin_respuesta") throw error;
    return completar(clave, plan, entrada, conversacion, "none");
  }
}
