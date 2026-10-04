"use client";

import "../styles/historial.css";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

function formatoFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  let hora = fecha.getHours();
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  const sufijo = hora >= 12 ? "p. m." : "a. m.";
  hora = hora % 12 || 12;
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]}, ${hora}:${minutos} ${sufijo}`;
}

function IconoChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconoBasura() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Historial({ conversaciones, activaId, ocupado, onNueva, onAbrir, onEliminar }) {
  const lista = [...(conversaciones || [])].sort((a, b) =>
    String(b.actualizada || "").localeCompare(String(a.actualizada || ""))
  );

  return (
    <aside className="historial" aria-label="Historial de conversaciones">
      <div className="historial__acciones">
        <button className="historial__nueva" type="button" onClick={onNueva} disabled={ocupado}>
          Nueva conversación
        </button>
      </div>
      <div className="historial__lista">
        {lista.length === 0 ? (
          <p className="historial__vacio">Sin conversaciones aún</p>
        ) : (
          lista.map((conversacion) => (
            <div
              key={conversacion.id}
              className={`historial__item${conversacion.id === activaId ? " historial__item--activa" : ""}`}
            >
              <button
                type="button"
                className="historial__abrir"
                onClick={() => onAbrir(conversacion.id)}
                disabled={ocupado}
              >
                <span className="historial__icono">
                  <IconoChat />
                </span>
                <span className="historial__cuerpo">
                  <span className="historial__titulo">{conversacion.titulo || "Nueva conversación"}</span>
                  {conversacion.actualizada ? (
                    <span className="historial__fecha">{formatoFecha(conversacion.actualizada)}</span>
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                className="historial__eliminar"
                onClick={() => onEliminar(conversacion.id, conversacion.titulo)}
                disabled={ocupado}
                aria-label={`Eliminar ${conversacion.titulo || "conversación"}`}
                title="Eliminar conversación"
              >
                <IconoBasura />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
