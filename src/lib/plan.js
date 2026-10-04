export function itemsDelPlan(plan) {
  return [...(plan.medicamentos || []), ...(plan.tareas || [])];
}
