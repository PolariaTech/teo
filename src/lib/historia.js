import { horaLegible } from "./fecha";

function ficha(item) {
  return {
    nombre: item.nombre || item.titulo,
    mencion: item.mencion,
    horario: horaLegible(item.horario),
    dosis: item.dosis || null,
    indicacion: item.indicacion,
    hoy: item.hoy
      ? { estado: item.hoy.estado, registro: item.hoy.registro }
      : null,
  };
}

export function consultarHistoria(plan, apartado) {
  const pedido = ["medicamentos", "tareas", "consejos", "avisos"].includes(apartado)
    ? apartado
    : "completa";

  const historia = {
    paciente: {
      nombre: plan.paciente?.nombre,
      trato: plan.paciente?.trato,
    },
    profesional: {
      nombre: plan.profesional?.nombre,
      rol: plan.profesional?.rol,
      trato: plan.profesional?.trato,
    },
    limites: plan.limites || {},
  };

  if (pedido === "completa" || pedido === "medicamentos") {
    historia.medicamentos = (plan.medicamentos || []).map(ficha);
  }
  if (pedido === "completa" || pedido === "tareas") {
    historia.tareas = (plan.tareas || []).map(ficha);
  }
  if (pedido === "completa" || pedido === "consejos") {
    historia.consejos = (plan.consejos || []).map((item) => ({
      cuando: item.cuando,
      texto: item.texto,
    }));
  }
  if (pedido === "completa" || pedido === "avisos") {
    historia.avisos = (plan.avisos || []).map((item) => ({
      fecha: item.fecha,
      texto: item.texto,
    }));
  }

  return historia;
}
