export type Perfil = "usuario" | "suporte";

export type Status = "Aberto" | "Em andamento" | "Fechado";
export type Prioridade = "Baixa" | "Média" | "Alta";

export const CATEGORIAS = [
  "Hardware",
  "Software",
  "Rede",
  "Acesso",
  "Outro",
] as const;

export const PRIORIDADES: Prioridade[] = ["Baixa", "Média", "Alta"];
export const STATUS_LISTA: Status[] = ["Aberto", "Em andamento", "Fechado"];

export interface Chamado {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  autor: string;
  createdAt: string;
  updatedAt: string;
}

export function classeStatus(status: string): string {
  switch (status) {
    case "Aberto":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30";
    case "Em andamento":
      return "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30";
    case "Fechado":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function classePrioridade(prioridade: string): string {
  switch (prioridade) {
    case "Alta":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30";
    case "Média":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30";
    case "Baixa":
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export interface AuthUsuario {
  nome: string;
  metodo: string;
}
