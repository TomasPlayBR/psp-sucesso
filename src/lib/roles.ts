export const ROLE_HIERARCHY: Record<string, number> = {
  "Diretor Nacional": 100,
  "Diretor Nacional Adjunto": 90,
  "Superintendente-Chefe": 80,
  "Superintendente": 70,
  "Intendente": 60,
  "Subintendente": 50,
  "Comissário": 40,
  "Subcomissário": 35,
  "Chefe Coordenador": 30,
  "Chefe Principal": 28,
  "Chefe": 25,
  "Agente Coordenador": 20,
  "Agente Principal": 15,
  "Agente": 10,
  "Agente Provisório": 5,
};

export const SUPERIOR_ROLES = [
  "Diretor Nacional",
  "Diretor Nacional Adjunto",
  "Superintendente-Chefe",
  "Superintendente",
  "Intendente",
  "Subintendente",
  "Comissário",
  "Subcomissário",
];

export function getUserRole(username: string): string {
  const u = username.toLowerCase();
  if (["tomas"].includes(u)) return "Diretor Nacional";
  if (["jose", "rodrigo"].includes(u)) return "Diretor Nacional Adjunto";
  if (["superior1", "superior2"].includes(u)) return "Superintendente-Chefe";
  if (["superior3"].includes(u)) return "Superintendente";
  if (["ferreira"].includes(u)) return "Intendente";
  if (["aaaa", ""].includes(u)) return "Subintendente";
  if (["comissario1"].includes(u)) return "Comissário";
  if (["subcomissario1"].includes(u)) return "Subcomissário";
  if (["miguel"].includes(u)) return "Chefe Coordenador";
  if (["chefeprincipal1"].includes(u)) return "Chefe Principal";
  if (["viveiros", "gui", "crazy", "limz"].includes(u)) return "Chefe";
  if (["afonso", "silvazin" ].includes(u)) return "Agente Coordenador";
  if (["rayzer", "leandro", "enzo"].includes(u)) return "Agente Principal";
  if (["raul","silva","lopes", "ganso", "falcon", "amir", "pocoyo", "vortex", "monteiro"].includes(u)) return "Agente";
  if (["agenteprovisorio1"].includes(u)) return "Agente Provisório";
  return "Agente";
}

export function isSuperior(role: string): boolean {
  return SUPERIOR_ROLES.includes(role);
}

export function isDiretor(role: string): boolean {
  return role === "Diretor Nacional";
}

export function getRankColor(role: string): string {
  const level = ROLE_HIERARCHY[role] ?? 10;
  if (level >= 100) return "rank-badge rank-badge-high";
  if (level >= 50) return "rank-badge";
  return "rank-badge";
}
