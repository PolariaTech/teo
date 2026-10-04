"use client";

import { useEffect, useRef, useState } from "react";
import CaraTeo from "./CaraTeo";
import "../styles/chat.css";

function horaMensaje(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  }).format(fecha);
}

export default function Conversacion({ mensajes, sugerencias, enviando, error, onEnviar }) {
  const [texto, setTexto] = useState("");
  const finalRef = useRef(null);

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, enviando]);

  function enviar(valor) {
    const limpio = valor.trim();
    if (!limpio || enviando) return;
    onEnviar(limpio);
    setTexto("");
  }

  function alEnviar(evento) {
    evento.preventDefault();
    enviar(texto);
  }

  function alTeclado(evento) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      enviar(texto);
    }
  }

  return (
    <section className="conversacion" aria-label="Conversación con TEO">
      <div className="mensajes" aria-live="polite">
        {mensajes.map((mensaje) => {
          const esPaciente = mensaje.de === "paciente";
          return (
            <article
              key={mensaje.id}
              className={`mensaje mensaje--${esPaciente ? "paciente" : "teo"}`}
            >
              {esPaciente ? null : <CaraTeo />}
              <div className="mensaje__cuerpo">
                <p className="mensaje__quien">{esPaciente ? "Tú" : "TEO"}</p>
                <p className="mensaje__texto">{mensaje.texto}</p>
                <p className="mensaje__hora">{horaMensaje(mensaje.en)}</p>
              </div>
            </article>
          );
        })}
        {enviando ? (
          <article className="mensaje mensaje--teo mensaje--escribiendo" aria-live="polite" aria-label="TEO está escribiendo">
            <CaraTeo />
            <div className="escribiendo">
              <span />
              <span />
              <span />
            </div>
          </article>
        ) : null}
        <div ref={finalRef} />
      </div>
      <form className="compositor" onSubmit={alEnviar}>
        {sugerencias.length > 0 && (
          <div className="sugerencias">
            {sugerencias.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                className="sugerencia"
                disabled={enviando}
                onClick={() => enviar(sugerencia)}
              >
                {sugerencia}
              </button>
            ))}
          </div>
        )}
        <div className="compositor__fila">
          <label className="sr-solo" htmlFor="mensaje">
            Escribe a TEO
          </label>
          <textarea
            id="mensaje"
            rows={2}
            value={texto}
            placeholder="Escríbeme con calma…"
            onChange={(evento) => setTexto(evento.target.value)}
            onKeyDown={alTeclado}
          />
          <button className="enviar" type="submit" disabled={enviando || !texto.trim()}>
            Enviar
          </button>
        </div>
        {error ? <p className="compositor__error">{error}</p> : null}
      </form>
    </section>
  );
}
