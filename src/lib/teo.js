import { fechaLocal, horaLegible } from "./fecha";
import { itemsDelPlan } from "./plan";

export function preguntaDeReloj(plan, item) {
  const nombre = plan.paciente.trato;
  const hora = horaLegible(item.horario);
  if (item.tipo === "medicamento") {
    return `${nombre}, es la hora de las ${hora}. ¿Pudiste tomar ${item.mencion}?`;
  }
  return `${nombre}, es la hora de las ${hora}. ¿Pudiste hacer ${item.mencion}?`;
}

export function textoBienvenida(plan) {
  const { paciente, profesional } = plan;
  return `Hola, ${paciente.trato}. Soy TEO. Te acompaño con lo que acordaste con ${profesional.trato}. Puedes contarme cómo vas con la toma y con la tarea.`;
}

function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function registroHora(ahora) {
  let hora = ahora.getHours();
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const sufijo = hora >= 12 ? "p. m." : "a. m.";
  hora = hora % 12 || 12;
  return `${hora}:${minutos} ${sufijo}`;
}

function esCrisis(texto) {
  const frases = [
    "suicid",
    "matarme",
    "hacerme dano",
    "quiero morir",
    "no quiero vivir",
    "quitarme la vida",
    "no quiero existir",
    "mejor muerto",
    "mejor muerta",
  ];
  return frases.some((frase) => texto.includes(frase));
}

function pideCambiarDosis(texto) {
  const frases = [
    "cambiar la dosis",
    "subir la dosis",
    "bajar la dosis",
    "dejar la pastilla",
    "dejar el medicamento",
    "suspender",
    "tomar dos",
    "tomarme dos",
    "otra pastilla",
  ];
  return frases.some((frase) => texto.includes(frase));
}

function hablaDeToma(texto) {
  return /(pastilla|medicamento|\btoma\b|\bdosis\b|\btome\b|\btomarla\b|\btomado\b)/.test(texto);
}

function hablaDeTarea(texto) {
  return /(tarea|ejercicio|respiracion|caminar)/.test(texto);
}

function esNegacion(texto) {
  return /(\bno\b|todavia no|aun no|olvide|no pude|se me olvido)/.test(texto);
}

function esAfirmacion(texto) {
  return /(\bya\b|\bsi\b|\blisto\b|lo hice|pude)/.test(texto) && !esNegacion(texto);
}

function avisar(plan, tipo, texto, ahora) {
  if (!plan.avisos) plan.avisos = [];
  const fecha = fechaLocal(ahora);
  const existe = plan.avisos.some((aviso) => aviso.tipo === tipo && aviso.fecha === fecha);
  if (existe) return;
  plan.avisos.push({
    tipo,
    texto,
    fecha,
    en: ahora.toISOString(),
  });
}

function marcar(item, estado, registro) {
  item.hoy.estado = estado;
  item.hoy.registro = registro;
  item.hoy.preguntado = true;
}

function candidatos(plan, tipo, texto) {
  const items = itemsDelPlan(plan).filter((item) => item.tipo === tipo);
  const nombrado = items.find((item) => {
    const nombre = normalizar(item.nombre || item.titulo || "");
    return nombre && texto.includes(nombre);
  });
  if (nombrado) return [nombrado];
  const preguntados = items.filter((item) => item.hoy && item.hoy.estado === "pendiente" && item.hoy.preguntado);
  if (preguntados.length) return preguntados;
  return items.filter((item) => item.hoy && item.hoy.estado === "pendiente");
}

function cerrarEstado(plan, lista, tipo, afirmacion, ahora) {
  if (lista.length === 1 && lista[0].hoy && lista[0].hoy.estado !== "pendiente") {
    return `Eso ya quedó registrado: ${lista[0].mencion}.`;
  }

  const pendientes = lista.filter((item) => item.hoy && item.hoy.estado === "pendiente");
  if (pendientes.length !== 1) {
    if (tipo === "medicamento") {
      return "¿Me dices de cuál toma hablas? Así la registro bien.";
    }
    return "¿Me dices de cuál tarea hablas? Así la registro bien.";
  }

  const item = pendientes[0];
  const hora = registroHora(ahora);
  if (afirmacion) {
    marcar(item, "hecha", tipo === "medicamento" ? `Tomada a las ${hora}` : `Hecha a las ${hora}`);
    if (tipo === "medicamento") {
      return `Quedó registrado: tomaste ${item.mencion}. Gracias por contármelo.`;
    }
    return `Quedó registrada ${item.mencion}. Gracias por contármelo.`;
  }

  marcar(item, "no_pudo", `No pudo, a las ${hora}`);
  const detalle = tipo === "medicamento"
    ? `No pudo tomar ${item.mencion}.`
    : `No pudo hacer ${item.mencion}.`;
  avisar(plan, `no_pudo:${item.id}`, detalle, ahora);
  return `Quedó registrado que no pudiste con ${item.mencion}. No tienes que justificarte. ${plan.profesional.trato} verá este aviso.`;
}

function describirPlan(plan) {
  const tomas = (plan.medicamentos || [])
    .map((item) => `${item.mencion} a las ${horaLegible(item.horario)}`)
    .join("; ");
  const tareas = (plan.tareas || [])
    .map((item) => `${item.mencion} a las ${horaLegible(item.horario)}`)
    .join("; ");
  return `Hoy tu plan tiene esta toma: ${tomas}. Y esta tarea: ${tareas}.`;
}

function consejoPara(plan, texto) {
  for (const consejo of plan.consejos || []) {
    const coincide = (consejo.cuando || []).some((pista) => texto.includes(normalizar(pista)));
    if (coincide) return consejo.texto;
  }
  return "";
}

export function respuestaDeCuidado(plan, entrada, ahora) {
  const texto = normalizar(entrada);

  if (esCrisis(texto)) {
    avisar(plan, "crisis", "El paciente escribió algo que requiere atención de una persona.", ahora);
    plan.alerta = {
      en: ahora.toISOString(),
      texto: plan.limites.crisis,
    };
    return `${plan.paciente.trato}, lo que escribes es importante y no lo voy a resolver con un consejo. ${plan.limites.crisis} Dejé un aviso para ${plan.profesional.trato}.`;
  }

  if (pideCambiarDosis(texto)) {
    const toma = (plan.medicamentos || [])
      .map((item) => `${item.mencion} a las ${horaLegible(item.horario)}`)
      .join("; ");
    return `${plan.limites.dosis} Lo que quedó escrito es: ${toma}. Si algo no te cae bien, conviene decírselo a ${plan.profesional.trato}.`;
  }

  if (hablaDeToma(texto) && (esAfirmacion(texto) || esNegacion(texto))) {
    return cerrarEstado(plan, candidatos(plan, "medicamento", texto), "medicamento", esAfirmacion(texto), ahora);
  }

  if (hablaDeTarea(texto) && (esAfirmacion(texto) || esNegacion(texto))) {
    return cerrarEstado(plan, candidatos(plan, "tarea", texto), "tarea", esAfirmacion(texto), ahora);
  }

  if (/^(si|ya|listo|no|todavia no|aun no)$/.test(texto)) {
    const preguntados = itemsDelPlan(plan).filter(
      (item) => item.hoy && item.hoy.estado === "pendiente" && item.hoy.preguntado
    );
    if (preguntados.length === 1) {
      return cerrarEstado(plan, preguntados, preguntados[0].tipo, esAfirmacion(texto), ahora);
    }
    if (preguntados.length > 1) {
      return "Puedo registrar la toma o la tarea. ¿Cuál de las dos?";
    }
  }

  return null;
}

export function responder(plan, entrada, ahora) {
  const fija = respuestaDeCuidado(plan, entrada, ahora);
  if (fija) return fija;

  const texto = normalizar(entrada);
  const consejo = consejoPara(plan, texto);
  if (consejo) return consejo;

  if (/(que pastilla|que medicamento|que tomo|cual es la dosis|que debo tomar)/.test(texto)) {
    const tomas = (plan.medicamentos || [])
      .map((item) => `${item.nombre}, ${item.dosis}, a las ${horaLegible(item.horario)}. ${item.indicacion}`)
      .join(" ");
    return tomas || "En tu plan de hoy no quedó ninguna toma.";
  }

  if (/(que tarea|que ejercicio|que tengo que hacer)/.test(texto)) {
    const tareas = (plan.tareas || [])
      .map((item) => `${item.titulo}, a las ${horaLegible(item.horario)}. ${item.indicacion}`)
      .join(" ");
    return tareas || "En tu plan de hoy no quedó ninguna tarea.";
  }

  if (/(que tengo hoy|mi plan|como voy)/.test(texto)) {
    return describirPlan(plan);
  }

  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(texto)) {
    return textoBienvenida(plan);
  }

  return `Puedo acompañarte con lo que quedó en tu plan: la toma, la tarea y los consejos que ${plan.profesional.trato} autorizó. Si me cuentas cómo vas con eso, lo registro.`;
}
