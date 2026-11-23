import { NextRequest, NextResponse } from "next/server";
import { criarChamado, listarChamados } from "@/lib/store";

/** Limite do data URL base64 (~5 MB de arquivo + overhead da codificação). */
const EVIDENCIA_DADOS_MAX = 7_500_000;

export async function GET() {
  try {
    // evidenciaDados (base64) fica fora da listagem — servido em /api/chamados/[id]/evidencia.
    const chamados = await listarChamados();
    return NextResponse.json({ chamados });
  } catch (erro) {
    console.error("GET /api/chamados:", erro);
    return NextResponse.json(
      { erro: "Não foi possível carregar os chamados." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const corpo = await req.json().catch(() => null);
    if (!corpo || typeof corpo !== "object") {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
    }

    const tipo = String(corpo.tipo ?? "Outro").trim() || "Outro";
    const local = String(corpo.local ?? "Sala 05").trim() || "Sala 05";
    const descricao = String(corpo.descricao ?? "").trim();
    const solicitante = String(corpo.solicitante ?? "").trim();
    const prioridade = String(corpo.prioridade ?? "Média").trim() || "Média";

    if (descricao.length < 10) {
      return NextResponse.json(
        { erro: "Descreva o problema com pelo menos 10 caracteres." },
        { status: 400 },
      );
    }
    if (!solicitante) {
      return NextResponse.json(
        { erro: "Informe o nome do solicitante." },
        { status: 400 },
      );
    }

    // Anexo opcional (imagem ou documento) enviado junto da abertura do chamado.
    const dadosAnexo: {
      evidenciaNome?: string;
      evidenciaTipo?: string;
      evidenciaDados?: string;
    } = {};
    if (corpo.evidencia !== undefined && corpo.evidencia !== null) {
      const ev = corpo.evidencia;
      if (
        typeof ev !== "object" ||
        typeof ev.nome !== "string" ||
        !ev.nome.trim() ||
        typeof ev.dados !== "string" ||
        !ev.dados.startsWith("data:")
      ) {
        return NextResponse.json(
          { erro: "Anexo inválido: envie um arquivo de imagem ou documento." },
          { status: 400 },
        );
      }
      if (ev.dados.length > EVIDENCIA_DADOS_MAX) {
        return NextResponse.json(
          { erro: "Arquivo muito grande: o limite é de 5 MB." },
          { status: 400 },
        );
      }
      dadosAnexo.evidenciaNome = ev.nome.trim().slice(0, 200);
      dadosAnexo.evidenciaTipo = String(ev.tipo ?? "application/octet-stream")
        .trim()
        .slice(0, 100);
      dadosAnexo.evidenciaDados = ev.dados;
    }

    const chamado = await criarChamado({
      tipo,
      local,
      descricao,
      solicitante,
      prioridade,
      status: "Aberto",
      ...dadosAnexo,
    });

    return NextResponse.json({ chamado }, { status: 201 });
  } catch (erro) {
    console.error("POST /api/chamados:", erro);
    return NextResponse.json(
      { erro: "Não foi possível abrir o chamado." },
      { status: 500 },
    );
  }
}
