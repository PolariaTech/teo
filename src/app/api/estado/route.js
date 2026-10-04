import { actualizarPlan } from "../../../lib/archivo";
import { prepararPlan } from "../../../lib/preparar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const plan = await actualizarPlan((plan) => prepararPlan(plan, new Date()));
    return Response.json(plan);
  } catch {
    return Response.json(
      { error: "No pude leer el plan de cuidado." },
      { status: 500 }
    );
  }
}
