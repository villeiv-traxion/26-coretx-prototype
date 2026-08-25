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
 * Starting assignment. Deliberately lopsided, because the real one is: U01
 * carries nine operations and three have nobody at all. An operation with no
 * one assigned still owes its indicators — the gap has to be visible.
 */
export const INITIAL_ASSIGNMENTS: Record<string, string[]> = {
  OP01: ["U01", "U02"],
  OP02: ["U01"],
  OP03: ["U01"],
  OP04: ["U01"],
  OP05: ["U01"],
  OP06: ["U01", "U04"],
  OP07: ["U01"],
  OP08: ["U01"],
  OP09: ["U01"],
  OP10: ["U03"],
  OP11: ["U05"],
  OP12: ["U06", "U07"],
  OP13: ["U08"],
  OP14: ["U09"],
  OP15: ["U10", "U11"],
  OP16: [],
  OP17: ["U13"],
  OP18: ["U14"],
  OP19: ["U15", "U16", "U17"],
  OP20: [],
  OP21: ["U18"],
  OP22: ["U12"],
  OP23: [],
  OP24: ["U02"],
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
