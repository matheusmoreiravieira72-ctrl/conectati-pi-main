
import "server-only";
import { randomUUID } from "crypto";
import { supabase } from "./supabase";

export interface ChamadoRecord {
  id: string;
  numero: number;
  tipo: string;
  local: string;
  descricao: string;
  prioridade: string;
  status: string;
  solicitante: string;
  evidenciaNome: string | null;
  evidenciaTipo: string | null;
  evidenciaDados: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipamentoRecord {
  id: string;
  patrimonio: string;
  modelo: string;
  status: string;
  reservadoPor: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvaliacaoRecord {
  id: string;
  nota: number;
  comentario: string;
  unidade: string;
  nome: string;
  createdAt: Date;
  updatedAt: Date;
}

type ChamadoDados = {
  id: string;
  numero: number;
  tipo: string;
  local: string;
  descricao: string;
  prioridade: string;
  status: string;
  solicitante: string;
  evidencia_nome: string | null;
  evidencia_tipo: string | null;
  evidencia_dados: string | null;
  created_at: string;
  updated_at: string;
};

type EquipamentoDados = {
  id: string;
  patrimonio: string;
  modelo: string;
  status: string;
  reservado_por: string | null;
  created_at: string;
  updated_at: string;
};

type AvaliacaoDados = {
  id: string;
  nota: number;
  comentario: string | null;
  unidade: string;
  nome: string | null;
  created_at: string;
  updated_at: string;
};

function converterChamado(c: ChamadoDados): ChamadoRecord {
  return {
    id: c.id,
    numero: c.numero,
    tipo: c.tipo,
    local: c.local,
    descricao: c.descricao,
    prioridade: c.prioridade,
    status: c.status,
    solicitante: c.solicitante,
    evidenciaNome: c.evidencia_nome ?? null,
    evidenciaTipo: c.evidencia_tipo ?? null,
    evidenciaDados: c.evidencia_dados ?? null,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  };
}

function converterEquipamento(e: EquipamentoDados): EquipamentoRecord {
  return {
    id: e.id,
    patrimonio: e.patrimonio,
    modelo: e.modelo,
    status: e.status,
    reservadoPor: e.reservado_por ?? null,
    createdAt: new Date(e.created_at),
    updatedAt: new Date(e.updated_at),
  };
}

function converterAvaliacao(a: AvaliacaoDados): AvaliacaoRecord {
  return {
    id: a.id,
    nota: a.nota,
    comentario: a.comentario ?? "",
    unidade: a.unidade,
    nome: a.nome ?? "",
    createdAt: new Date(a.created_at),
    updatedAt: new Date(a.updated_at),
  };
}

function dadosChamado(c: Partial<ChamadoRecord>) {
  const dados: Record<string, unknown> = {};

  if (c.tipo !== undefined) dados.tipo = c.tipo;
  if (c.local !== undefined) dados.local = c.local;
  if (c.descricao !== undefined) dados.descricao = c.descricao;
  if (c.prioridade !== undefined) dados.prioridade = c.prioridade;
  if (c.status !== undefined) dados.status = c.status;
  if (c.solicitante !== undefined) dados.solicitante = c.solicitante;
  if (c.evidenciaNome !== undefined) dados.evidencia_nome = c.evidenciaNome;
  if (c.evidenciaTipo !== undefined) dados.evidencia_tipo = c.evidenciaTipo;
  if (c.evidenciaDados !== undefined) dados.evidencia_dados = c.evidenciaDados;

  return dados;
}

const TIPOS = [
  "Internet",
  "Notebook",
  "Projetor",
  "Impressora",
  "Computador",
  "Software",
];

const LOCAIS = [
  "Lab 01",
  "Lab 02",
  "Lab 03",
  "Sala 05",
  "Sala 12",
  "Sala 20",
  "Biblioteca",
  "Coordenação",
  "Secretaria",
];

const PROFESSORES = [
  "Prof. Ana Souza",
  "Prof. Carlos Lima",
  "Prof. Marcos Vieira",
  "Prof. Juliana Costa",
  "Prof. Rafael Dias",
  "Prof. Beatriz Alves",
  "Prof. Tiago Mendes",
  "Coordenação",
];

const MODELOS = [
  "Dell Latitude 3420",
  "Lenovo ThinkPad L14",
  "Acer Aspire 5",
  "Samsung Book3",
];

function evidenciaTexto(nome: string, conteudo: string) {
  return {
    evidencia_nome: nome,
    evidencia_tipo: "text/plain",
    evidencia_dados:
      "data:text/plain;base64," +
      Buffer.from(conteudo, "utf8").toString("base64"),
  };
}

function gerarChamadosIniciais() {
  const agora = Date.now();

  const primeiros = [
    {
      numero: 1,
      tipo: "Notebook",
      local: "Lab 02",
      descricao:
        "Notebook do carrinho 1 não liga. A luz de carregamento não acende e a aula do período da tarde precisa do equipamento.",
      prioridade: "Alta",
      status: "Em atendimento",
      solicitante: "Prof. Ana Souza",
    },
    {
      numero: 2,
      tipo: "Projetor",
      local: "Sala 12",
      descricao:
        "Projetor liga mas não exibe imagem do computador. Já testei o cabo HDMI em outra fonte e o problema continua.",
      prioridade: "Alta",
      status: "Aberto",
      solicitante: "Prof. Carlos Lima",
    },
    {
      numero: 3,
      tipo: "Internet",
      local: "Lab 01",
      descricao:
        "Wi-Fi do laboratório caindo constantemente durante as aulas práticas.",
      prioridade: "Média",
      status: "Resolvido",
      solicitante: "Prof. Marcos Vieira",
    },
  ];

  const chamados: Array<Record<string, unknown>> = [];

  for (let numero = 1; numero <= 30; numero++) {
    const base = primeiros[numero - 1];

    const tipo = base?.tipo ?? TIPOS[numero % TIPOS.length];
    const local = base?.local ?? LOCAIS[(numero * 3) % LOCAIS.length];

    const status =
      base?.status ??
      (numero <= 26
        ? "Aberto"
        : numero <= 28
          ? "Em atendimento"
          : "Resolvido");

    const prioridade =
      base?.prioridade ??
      (numero % 3 === 0
        ? "Alta"
        : numero % 3 === 1
          ? "Média"
          : "Baixa");

    const criadoEm = new Date(
      agora - (30 - numero) * 12 * 60 * 60 * 1000,
    ).toISOString();

    let evidencia = {
      evidencia_nome: null as string | null,
      evidencia_tipo: null as string | null,
      evidencia_dados: null as string | null,
    };

    if (status === "Resolvido") {
      evidencia = evidenciaTexto(
        `registro-atendimento-${String(numero).padStart(3, "0")}.txt`,
        `Registro de atendimento - chamado #${String(numero).padStart(3, "0")}\nAtendimento concluído com verificação no ambiente.`,
      );
    }

    chamados.push({
      id: randomUUID(),
      numero,
      tipo,
      local,
      descricao:
        base?.descricao ??
        `Equipamento ou serviço com falha no ambiente ${local}. Reportado para o suporte de TI.`,
      prioridade,
      status,
      solicitante:
        base?.solicitante ?? PROFESSORES[numero % PROFESSORES.length],
      ...evidencia,
      created_at: criadoEm,
      updated_at: criadoEm,
    });
  }

  return chamados;
}

function gerarEquipamentosIniciais() {
  const agora = new Date().toISOString();

  const reservados: Record<string, string> = {
    "NB-104": "Prof. Ana Souza",
    "NB-110": "Prof. Carlos Lima",
    "NB-117": "Coordenação",
  };

  return Array.from({ length: 22 }, (_, indice) => {
    const numero = indice + 101;
    const patrimonio = `NB-${numero}`;

    const status = reservados[patrimonio]
      ? "Reservado"
      : patrimonio === "NB-113"
        ? "Manutenção"
        : "Disponível";

    return {
      id: randomUUID(),
      patrimonio,
      modelo: MODELOS[numero % MODELOS.length],
      status,
      reservado_por: reservados[patrimonio] ?? null,
      created_at: agora,
      updated_at: agora,
    };
  });
}

async function garantirDadosIniciais() {
  const [chamadosResult, equipamentosResult] = await Promise.all([
    supabase.from("chamados").select("id").limit(1),
    supabase.from("equipamentos").select("id").limit(1),
  ]);

  if (chamadosResult.error) throw chamadosResult.error;
  if (equipamentosResult.error) throw equipamentosResult.error;

  if (!chamadosResult.data?.length) {
    const { error } = await supabase
      .from("chamados")
      .insert(gerarChamadosIniciais());

    if (error) throw error;
  }

  if (!equipamentosResult.data?.length) {
    const { error } = await supabase
      .from("equipamentos")
      .insert(gerarEquipamentosIniciais());

    if (error) throw error;
  }
}

/* ------------------------------ Chamados ------------------------------ */

export async function listarChamados(): Promise<
  Omit<ChamadoRecord, "evidenciaDados">[]
> {
  await garantirDadosIniciais();

  const { data, error } = await supabase
    .from("chamados")
    .select("*")
    .order("numero", { ascending: false });

  if (error) throw error;

  return (data as ChamadoDados[]).map((item) => {
    const { evidenciaDados: _omitido, ...resto } = converterChamado(item);
    return resto;
  });
}

export async function buscarChamado(
  id: string,
): Promise<ChamadoRecord | null> {
  await garantirDadosIniciais();

  const { data, error } = await supabase
    .from("chamados")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data ? converterChamado(data as ChamadoDados) : null;
}

export async function criarChamado(
  dados: Pick<
    ChamadoRecord,
    "tipo" | "local" | "descricao" | "prioridade" | "status" | "solicitante"
  > &
    Partial<
      Pick<
        ChamadoRecord,
        "evidenciaNome" | "evidenciaTipo" | "evidenciaDados"
      >
    >,
): Promise<ChamadoRecord> {
  await garantirDadosIniciais();

  const { data: ultimo, error: erroNumero } = await supabase
    .from("chamados")
    .select("numero")
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroNumero) throw erroNumero;

  const numero = (ultimo?.numero ?? 0) + 1;
  const agora = new Date().toISOString();

  const registro = {
    id: randomUUID(),
    numero,
    tipo: dados.tipo,
    local: dados.local,
    descricao: dados.descricao,
    prioridade: dados.prioridade,
    status: dados.status,
    solicitante: dados.solicitante,
    evidencia_nome: dados.evidenciaNome ?? null,
    evidencia_tipo: dados.evidenciaTipo ?? null,
    evidencia_dados: dados.evidenciaDados ?? null,
    created_at: agora,
    updated_at: agora,
  };

  const { data, error } = await supabase
    .from("chamados")
    .insert(registro)
    .select("*")
    .single();

  if (error) throw error;

  return converterChamado(data as ChamadoDados);
}

export async function atualizarChamado(
  id: string,
  dados: Partial<
    Pick<
      ChamadoRecord,
      | "tipo"
      | "local"
      | "descricao"
      | "prioridade"
      | "status"
      | "evidenciaNome"
      | "evidenciaTipo"
      | "evidenciaDados"
    >
  >,
): Promise<ChamadoRecord | null> {
  await garantirDadosIniciais();

  const atualizacao = dadosChamado(dados);
  atualizacao.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("chamados")
    .update(atualizacao)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data ? converterChamado(data as ChamadoDados) : null;
}

/* ---------------------------- Equipamentos ---------------------------- */

export async function listarEquipamentos(): Promise<EquipamentoRecord[]> {
  await garantirDadosIniciais();

  const { data, error } = await supabase
    .from("equipamentos")
    .select("*")
    .order("patrimonio", { ascending: true });

  if (error) throw error;

  return (data as EquipamentoDados[]).map(converterEquipamento);
}

export async function buscarEquipamento(
  id: string,
): Promise<EquipamentoRecord | null> {
  await garantirDadosIniciais();

  const { data, error } = await supabase
    .from("equipamentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data ? converterEquipamento(data as EquipamentoDados) : null;
}

export async function atualizarEquipamento(
  id: string,
  dados: Partial<Pick<EquipamentoRecord, "status" | "reservadoPor">>,
): Promise<EquipamentoRecord | null> {
  await garantirDadosIniciais();

  const atualizacao: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (dados.status !== undefined) {
    atualizacao.status = dados.status;
  }

  if (dados.reservadoPor !== undefined) {
    atualizacao.reservado_por = dados.reservadoPor;
  }

  const { data, error } = await supabase
    .from("equipamentos")
    .update(atualizacao)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data ? converterEquipamento(data as EquipamentoDados) : null;
}

/* ------------------------------ Avaliações ---------------------------- */

export async function listarAvaliacoes(
  limite = 50,
): Promise<AvaliacaoRecord[]> {
  const { data, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw error;

  return (data as AvaliacaoDados[]).map(converterAvaliacao);
}

export async function contarAvaliacoes(): Promise<number> {
  const { count, error } = await supabase
    .from("avaliacoes")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count ?? 0;
}

export async function criarAvaliacao(dados: {
  nota: number;
  comentario: string;
  unidade: string;
  nome: string;
}): Promise<AvaliacaoRecord> {
  const agora = new Date().toISOString();

  const registro = {
    id: randomUUID(),
    nota: dados.nota,
    comentario: dados.comentario,
    unidade: dados.unidade,
    nome: dados.nome,
    created_at: agora,
    updated_at: agora,
  };

  const { data, error } = await supabase
    .from("avaliacoes")
    .insert(registro)
    .select("*")
    .single();

  if (error) throw error;

  return converterAvaliacao(data as AvaliacaoDados);
}
