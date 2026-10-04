export function fechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function horaLegible(horario) {
  const [horaTexto, minutos] = String(horario).split(":");
  let hora = Number(horaTexto);
  const sufijo = hora >= 12 ? "p. m." : "a. m.";
  hora = hora % 12 || 12;
  return `${hora}:${minutos} ${sufijo}`;
}

export function minutosDelDia(fecha) {
  return fecha.getHours() * 60 + fecha.getMinutes();
}

export function minutosDeHorario(horario) {
  const [hora, minutos] = String(horario).split(":").map(Number);
  return hora * 60 + minutos;
}
