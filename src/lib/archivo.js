import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";

const ruta = path.join(process.cwd(), "data", "plan-cuidado.json");

let cadena = Promise.resolve();

function leerDesdeDisco() {
  return JSON.parse(readFileSync(ruta, "utf8"));
}

function revisionDe(plan) {
  const revision = Number(plan?.revision);
  return Number.isFinite(revision) ? revision : 0;
}

export function esErrorDeDisco(error) {
  if (["EROFS", "EACCES", "EPERM", "ENOENT", "EBUSY"].includes(error?.code)) return true;
  return /EROFS|read-only|EACCES|EPERM/i.test(String(error?.message || ""));
}

export function planRecibido(valor) {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return null;
  if (!valor.paciente || typeof valor.paciente !== "object") return null;
  if (!Array.isArray(valor.conversaciones)) return null;
  const texto = JSON.stringify(valor);
  if (texto.length > 800000) return null;
  return valor;
}

function elegir(disco, copia) {
  if (!copia) return disco;
  if (revisionDe(copia) < revisionDe(disco)) return disco;
  if (!copia.limites) copia.limites = disco.limites;
  if (!copia.medicamentos) copia.medicamentos = disco.medicamentos;
  if (!copia.tareas) copia.tareas = disco.tareas;
  if (!copia.consejos) copia.consejos = disco.consejos;
  if (!copia.profesional) copia.profesional = disco.profesional;
  if (!copia.paciente?.trato) copia.paciente = disco.paciente;
  return copia;
}

export async function leerPlan() {
  return leerDesdeDisco();
}

async function guardarPlan(plan) {
  const texto = JSON.stringify(plan, null, 2) + "\n";
  const temporal = `${ruta}.tmp`;
  mkdirSync(path.dirname(ruta), { recursive: true });
  writeFileSync(temporal, texto, "utf8");
  renameSync(temporal, ruta);
}

export function actualizarPlan(mutar, copia) {
  const ejecucion = cadena.then(async () => {
    const disco = await leerPlan();
    const plan = elegir(disco, planRecibido(copia));
    const cambio = await mutar(plan);
    if (cambio) {
      plan.revision = revisionDe(plan) + 1;
      try {
        await guardarPlan(plan);
      } catch (error) {
        if (!esErrorDeDisco(error)) throw error;
      }
    }
    return plan;
  });
  cadena = ejecucion.then(
    () => undefined,
    () => undefined
  );
  return ejecucion;
}
