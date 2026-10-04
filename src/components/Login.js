"use client";

import { useState } from "react";
import CaraTeo from "./CaraTeo";
import "../styles/login.css";

const USUARIO = "camila";
const CLAVE = "teo";

export default function Login({ onEntrar }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    const nombre = usuario.trim().toLowerCase();
    if (nombre === USUARIO && clave === CLAVE) {
      onEntrar(nombre);
      return;
    }
    setError("Ese usuario o esa clave no coinciden con el acceso de ejemplo.");
  }

  return (
    <div className="login">
      <form className="login__tarjeta" onSubmit={enviar}>
        <CaraTeo tamano="login" />
        <h1 className="marca">TEO</h1>
        <label className="login__campo">
          <span>Usuario</span>
          <input
            name="usuario"
            autoComplete="username"
            value={usuario}
            onChange={(evento) => {
              setUsuario(evento.target.value);
              setError("");
            }}
          />
        </label>
        <label className="login__campo">
          <span>Clave</span>
          <input
            name="clave"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(evento) => {
              setClave(evento.target.value);
              setError("");
            }}
          />
        </label>
        {error ? (
          <p className="login__error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="login__entrar" type="submit">
          Entrar
        </button>
        <p className="login__ejemplo">
          Ejemplo: usuario <strong>camila</strong>, clave <strong>teo</strong>
        </p>
      </form>
    </div>
  );
}
