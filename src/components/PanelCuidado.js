"use client";

import { horaLegible } from "../lib/fecha";
import "../styles/panel.css";

function textoDeEstado(item) {
  if (!item.hoy || item.hoy.estado === "pendiente") {
    if (item.hoy?.preguntado) return "Te pregunté hoy";
    return "Pendiente";
  }
  if (item.hoy.estado === "hecha") return item.hoy.registro || "Lista";
  if (item.hoy.estado === "no_pudo") return item.hoy.registro || "No pudo";
  return "Pendiente";
}

function Ficha({ item }) {
  const estado = item.hoy?.estado || "pendiente";
  return (
    <article className={`ficha ficha--${estado}`}>
      <p className="ficha__hora">{horaLegible(item.horario)}</p>
      <p className="ficha__nombre">{item.nombre || item.titulo}</p>
      {item.dosis ? <p className="ficha__detalle">{item.dosis}</p> : null}
      <p className="ficha__detalle">{item.indicacion}</p>
      <p className="ficha__estado">{textoDeEstado(item)}</p>
    </article>
  );
}

export default function PanelCuidado({ plan }) {
  const tomas = plan.medicamentos || [];
  const tareas = plan.tareas || [];
  const avisos = plan.avisos || [];

  return (
    <aside className="panel" aria-label="Plan de cuidado">
      <header className="panel__encabezado">
        <p className="panel__kicker">{plan.ejemplo ? "Datos de ejemplo" : "Plan de cuidado"}</p>
        <h1 className="panel__titulo">Tu plan de hoy</h1>
        <p className="panel__trato">
          {plan.paciente.nombre}. Acordado con {plan.profesional.trato}, {plan.profesional.rol.toLowerCase()}.
        </p>
      </header>

      {plan.alerta ? <p className="panel__alerta">{plan.alerta.texto}</p> : null}

      <section className="bloque">
        <h2 className="bloque__titulo">Toma</h2>
        {tomas.map((item) => (
          <Ficha key={item.id} item={item} />
        ))}
      </section>

      <section className="bloque">
        <h2 className="bloque__titulo">Tarea</h2>
        {tareas.map((item) => (
          <Ficha key={item.id} item={item} />
        ))}
      </section>

      {avisos.length > 0 && (
        <section className="bloque">
          <h2 className="bloque__titulo">Avisos para tu psicóloga</h2>
          {avisos.map((aviso) => (
            <p key={`${aviso.tipo}-${aviso.en}`} className="aviso">
              {aviso.texto}
            </p>
          ))}
        </section>
      )}

      <p className="panel__limite">
        TEO no cambia tu tratamiento. Solo acompaña lo que quedó escrito en este plan.
      </p>
    </aside>
  );
}
