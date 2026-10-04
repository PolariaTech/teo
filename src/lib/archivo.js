import { mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";

const ruta = path.join(process.cwd(), "data", "plan-cuidado.json");

let cadena = Promise.resolve();

export function leerPlan() {
  return JSON.parse(readFileSync(ruta, "utf8"));
}

function guardarPlan(plan) {
  const temporal = `${ruta}.tmp`;
  mkdirSync(path.dirname(ruta), { recursive: true });
  writeFileSync(temporal, JSON.stringify(plan, null, 2) + "\n", "utf8");
  renameSync(temporal, ruta);
}

export function actualizarPlan(mutar) {
  const ejecucion = cadena.then(async () => {
    const plan = leerPlan();
    const cambio = await mutar(plan);
    if (cambio) guardarPlan(plan);
    return plan;
  });
  cadena = ejecucion.then(
    () => undefined,
    () => undefined
  );
  return ejecucion;
}
