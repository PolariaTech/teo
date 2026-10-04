"use client";

import { useCallback, useEffect, useState } from "react";
import CaraTeo from "./CaraTeo";
import Conversacion from "./Conversacion";
import Historial from "./Historial";
import Login from "./Login";
import PanelCuidado from "./PanelCuidado";

const SESION = "teo-sesion";

function sugerenciasDe(plan) {
  if (!plan) return [];
  const chips = [];
  const hayToma = (plan.medicamentos || []).some((item) => item.hoy?.estado === "pendiente");
  const hayTarea = (plan.tareas || []).some((item) => item.hoy?.estado === "pendiente");
  if (hayToma) chips.push("Ya me la tomé", "Todavía no me la tomé");
  if (hayTarea) chips.push("Ya hice la tarea", "No pude hacer la tarea");
  return chips;
}

export default function Aplicacion() {
  const [sesion, setSesion] = useState(undefined);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [vista, setVista] = useState("chat");
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const respuesta = await fetch("/api/estado", { cache: "no-store" });
    if (!respuesta.ok) throw new Error("estado");
    const cuerpo = await respuesta.json();
    setPlan(cuerpo);
    setError("");
  }, []);

  useEffect(() => {
    setSesion(sessionStorage.getItem(SESION) || "");
  }, []);

  useEffect(() => {
    if (!sesion) return undefined;
    let activo = true;
    cargar().catch(() => {
      if (activo) setError("No pude abrir el acompañamiento. Intenta de nuevo en un momento.");
    });
    const reloj = setInterval(() => {
      cargar().catch(() => {});
    }, 30000);
    return () => {
      activo = false;
      clearInterval(reloj);
    };
  }, [cargar, sesion]);

  function entrar(usuario) {
    sessionStorage.setItem(SESION, usuario);
    setSesion(usuario);
  }

  function salir() {
    sessionStorage.removeItem(SESION);
    setSesion("");
    setPlan(null);
    setVista("chat");
    setError("");
  }

  async function actuar(accion, id) {
    setOcupado(true);
    setError("");
    try {
      const respuesta = await fetch("/api/conversacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, id }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) {
        setError(cuerpo.error || "No pude actualizar el historial.");
        return;
      }
      setPlan(cuerpo);
    } catch {
      setError("No pude actualizar el historial. Intenta de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  function nueva() {
    setVista("chat");
    actuar("nueva");
  }

  function abrir(id) {
    setVista("chat");
    actuar("abrir", id);
  }

  function eliminar(id, titulo) {
    const nombre = titulo || "esta conversación";
    if (!window.confirm(`¿Eliminar «${nombre}» del historial?`)) return;
    actuar("eliminar", id);
  }

  async function enviar(texto) {
    setEnviando(true);
    setError("");
    const inicio = Date.now();
    try {
      const respuesta = await fetch("/api/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) {
        setError(cuerpo.error || "No pude enviar el mensaje.");
        return;
      }
      const falta = 900 - (Date.now() - inicio);
      if (falta > 0) await new Promise((resolver) => setTimeout(resolver, falta));
      setPlan(cuerpo);
    } catch {
      setError("No pude enviar el mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (sesion === undefined) {
    return <div className="aplicacion" />;
  }

  if (!sesion) {
    return <Login onEntrar={entrar} />;
  }

  if (!plan && !error) {
    return (
      <div className="aplicacion">
        <p className="aviso-carga">TEO está abriendo tu plan.</p>
      </div>
    );
  }

  if (!plan && error) {
    return (
      <div className="aplicacion">
        <div className="aviso-bloque">
          <p className="aviso-error">{error}</p>
          <button type="button" className="cabecera__salir" onClick={salir}>
            Salir
          </button>
        </div>
      </div>
    );
  }

  const activa = (plan.conversaciones || []).find((item) => item.id === plan.activa) || null;

  return (
    <div className="aplicacion">
      <header className="cabecera">
        <div className="cabecera__identidad">
          <CaraTeo tamano="grande" />
          <div>
            <p className="marca">TEO</p>
            <p className="subtitulo">Acompañamiento para {plan.paciente.trato}</p>
          </div>
        </div>
        <div className="cabecera__acciones">
          <button
            type="button"
            className="cabecera__historial"
            onClick={() => setVista((actual) => (actual === "historial" ? "chat" : "historial"))}
          >
            {vista === "historial" ? "Volver al chat" : "Historial"}
          </button>
          <button
            type="button"
            className="cabecera__plan"
            onClick={() => setVista((actual) => (actual === "plan" ? "chat" : "plan"))}
          >
            {vista === "plan" ? "Volver al chat" : "Tu plan"}
          </button>
          <button type="button" className="cabecera__salir" onClick={salir}>
            Salir
          </button>
        </div>
      </header>
      <main className={`marco marco--${vista}`}>
        <Historial
          conversaciones={plan.conversaciones || []}
          activaId={plan.activa}
          ocupado={ocupado || enviando}
          onNueva={nueva}
          onAbrir={abrir}
          onEliminar={eliminar}
        />
        {activa ? (
          <Conversacion
            mensajes={activa.mensajes || []}
            sugerencias={sugerenciasDe(plan)}
            enviando={enviando}
            error={error}
            onEnviar={enviar}
          />
        ) : (
          <section className="conversacion conversacion--vacia">
            <CaraTeo tamano="login" />
            <p>Cuando quieras, empieza una conversación. TEO guarda cada una en el historial.</p>
            <button type="button" onClick={nueva} disabled={ocupado}>
              Nueva conversación
            </button>
          </section>
        )}
        <PanelCuidado plan={plan} />
      </main>
    </div>
  );
}
