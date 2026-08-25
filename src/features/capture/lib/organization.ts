/**
 * Structure and directory for the prototype.
 *
 * The shape is real — division → company → operation, with territory — but the
 * names are invented. The source data carries revenue, cost and payroll per
 * operation plus personal email addresses, and this gets deployed to a public
 * URL.
 *
 * Creating companies and operations belongs to block 1 of the project and lives
 * elsewhere. Here they arrive already created: the only thing this prototype
 * administers is WHO delivers them.
 */

export interface Company {
  id: string;
  name: string;
}

export interface Operation {
  id: string;
  name: string;
  companyId: string;
  territory: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const COMPANIES: Company[] = [
  { id: "C01", name: "Norvia Logística" },
  { id: "C02", name: "Kaltia Almacenaje" },
];

export const OPERATIONS: Operation[] = [
  { id: "OP01", name: "Arbex Querétaro", companyId: "C01", territory: "CEN" },
  { id: "OP02", name: "Arbex Toluca", companyId: "C01", territory: "CEN" },
  { id: "OP03", name: "Corvala Tultitlán", companyId: "C01", territory: "MET" },
  { id: "OP04", name: "Corvala Monterrey", companyId: "C01", territory: "NTE" },
  { id: "OP05", name: "Nimbus Guadalajara", companyId: "C01", territory: "OCC" },
  { id: "OP06", name: "Pemsa Querétaro", companyId: "C01", territory: "CEN" },
  { id: "OP07", name: "Pemsa Villahermosa", companyId: "C01", territory: "CEN" },
  { id: "OP08", name: "Multicuentas Tultitlán", companyId: "C01", territory: "MET" },
  { id: "OP09", name: "Multicuentas Bajío", companyId: "C01", territory: "BAJ" },
  { id: "OP10", name: "Veltra Silao", companyId: "C01", territory: "BAJ" },
  { id: "OP11", name: "Veltra León", companyId: "C01", territory: "BAJ" },
  { id: "OP12", name: "Ondara Puebla", companyId: "C01", territory: "CEN" },
  { id: "OP13", name: "Solmar Monterrey", companyId: "C02", territory: "NTE" },
  { id: "OP14", name: "Solmar Saltillo", companyId: "C02", territory: "NTE" },
  { id: "OP15", name: "Halcón Tijuana", companyId: "C02", territory: "NTE" },
  { id: "OP16", name: "Halcón Mexicali", companyId: "C02", territory: "NTE" },
  { id: "OP17", name: "Ridley Guadalajara", companyId: "C02", territory: "OCC" },
  { id: "OP18", name: "Ridley Zapopan", companyId: "C02", territory: "OCC" },
  { id: "OP19", name: "CEDIS Metropolitano Norte", companyId: "C02", territory: "MET" },
  { id: "OP20", name: "CEDIS Metropolitano Sur", companyId: "C02", territory: "MET" },
  { id: "OP21", name: "Tepeyac Multicliente", companyId: "C02", territory: "MET" },
  { id: "OP22", name: "Andes Mérida", companyId: "C02", territory: "SUR" },
  { id: "OP23", name: "Andes Cancún", companyId: "C02", territory: "SUR" },
  { id: "OP24", name: "Ondara Irapuato", companyId: "C01", territory: "BAJ" },
];

export const USERS: User[] = [
  { id: "U01", name: "Héctor Beltrán", email: "hector.beltran@ejemplo.mx", role: "Coordinador de indicadores" },
  { id: "U02", name: "Marisol Zárate", email: "marisol.zarate@ejemplo.mx", role: "Jefa de almacén" },
  { id: "U03", name: "Grisel Quirino", email: "grisel.quirino@ejemplo.mx", role: "Jefa de almacén" },
  { id: "U04", name: "Jaqueline Bravo", email: "jaqueline.bravo@ejemplo.mx", role: "Analista de operación" },
  { id: "U05", name: "Alma Martínez", email: "alma.martinez@ejemplo.mx", role: "Jefa de almacén" },
  { id: "U06", name: "Alondra Rangel", email: "alondra.rangel@ejemplo.mx", role: "Analista de operación" },
  { id: "U07", name: "Silvia Aguilar", email: "silvia.aguilar@ejemplo.mx", role: "Jefa de almacén" },
  { id: "U08", name: "Miguel Hernández", email: "miguel.hernandez@ejemplo.mx", role: "Supervisor de turno" },
  { id: "U09", name: "Valentina Díaz", email: "valentina.diaz@ejemplo.mx", role: "Analista de operación" },
  { id: "U10", name: "Beatriz Ruiz", email: "beatriz.ruiz@ejemplo.mx", role: "Jefa de almacén" },
  { id: "U11", name: "Sharon Martínez", email: "sharon.martinez@ejemplo.mx", role: "Supervisora de turno" },
  { id: "U12", name: "Ulises Cárdenas", email: "ulises.cardenas@ejemplo.mx", role: "Analista de datos" },
  { id: "U13", name: "Rodrigo Salinas", email: "rodrigo.salinas@ejemplo.mx", role: "Jefe de almacén" },
  { id: "U14", name: "Paola Guerrero", email: "paola.guerrero@ejemplo.mx", role: "Coordinadora de operación" },
  { id: "U15", name: "Emilio Navarrete", email: "emilio.navarrete@ejemplo.mx", role: "Supervisor de turno" },
  { id: "U16", name: "Tania Escalante", email: "tania.escalante@ejemplo.mx", role: "Analista de operación" },
  { id: "U17", name: "Ricardo Ponce", email: "ricardo.ponce@ejemplo.mx", role: "Jefe de almacén" },
  { id: "U18", name: "Gabriela Ferrer", email: "gabriela.ferrer@ejemplo.mx", role: "Coordinadora de operación" },
];

/**
 * Starting assignment.
 *
 * Shaped after the only real source there is on this: the Responsable column of
 * `Propuesta plantilla SID Logistica.xlsx`, one name per row. It is worth being
 * precise about the source, because it says the opposite of what the master
 * data suggests — the nine names in `maestro.json` are flagged `CONTACTO`, and
 * the docs are explicit that contacts of an analysis are not an assignment.
 *
 * What the spreadsheet actually shows, across 68 operations:
 *
 *   32 people · median 2 · mean 2.2 · the largest holds 12
 *   22 of the 32 carry one or two operations; 14 carry exactly one
 *   17 of the 68 operations have nobody at all — a full quarter
 *
 * So there is no one person buried under 66 warehouses. There is a long tail of
 * people with a single site, one person with 12, and a wide hole. Scaled to 24
 * operations that is 4 · 3 · 3 · 2 · 2 · 1 · 1 · 1 · 1 · 1 over ten people,
 * with six operations unassigned.
 *
 * **This is the fact that decides what the capture landing screen should be.**
 * The typical person opens this to find one or two rows, not a queue.
 *
 * One more thing the spreadsheet shows and this model flattens: 18 of the 68
 * operations carry a *different* responsible in each tab, so responsibility is
 * really per operation x data group. With a single group here it collapses to
 * one name per operation.
 *
 * An operation with nobody assigned still owes its indicators. The gap has to
 * be visible or it never gets closed.
 */
export const INITIAL_ASSIGNMENTS: Record<string, string[]> = {
  // The closest thing to a concentrator: four of eighteen, like the real 24%.
  OP01: ["U01", "U03"],
  OP02: ["U01"],
  OP03: ["U01"],
  OP04: ["U01"],
  OP05: ["U02"],
  OP06: ["U02"],
  OP07: [],
  OP08: ["U02"],
  OP09: ["U03"],
  OP10: [],
  OP11: ["U03"],
  OP12: ["U04"],
  OP13: ["U04"],
  OP14: [],
  OP15: ["U05"],
  OP16: ["U05"],
  // The long tail: one site each, which is what most people actually have.
  OP17: ["U06"],
  OP18: [],
  OP19: ["U07"],
  OP20: ["U08"],
  OP21: [],
  OP22: ["U09"],
  OP23: ["U10"],
  OP24: [],
};

export function getOperation(id: string): Operation | undefined {
  return OPERATIONS.find((o) => o.id === id);
}

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getCompany(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}
