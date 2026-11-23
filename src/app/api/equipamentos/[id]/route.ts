import { NextRequest, NextResponse } from "next/server";
import { atualizarEquipamento, buscarEquipamento } from "@/lib/store";

const STATUS_VALIDOS = ["Disponível", "Reservado", "Manutenção"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const corpo = await req.json().catch(() => null);
    if (!corpo || typeof corpo !== "object") {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
    }

    const existente = await buscarEquipamento(id);
    if (!existente) {
      return NextResponse.json(
        { erro: "Equipamento não encontrado." },
        { status: 404 },
      );
    }

    const status = String(corpo.status ?? "").trim();
    if (!STATUS_VALIDOS.includes(status)) {
      return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
    }

    const reservadoPor =
      status === "Reservado"
        ? String(corpo.reservadoPor ?? "").trim() || null
        : null;

    if (status === "Reservado" && !reservadoPor) {
      return NextResponse.json(
        { erro: "Informe quem está reservando o equipamento." },
        { status: 400 },
      );
    }

    const equipamento = await atualizarEquipamento(id, { status, reservadoPor });
    if (!equipamento) {
      return NextResponse.json(
        { erro: "Equipamento não encontrado." },
        { status: 404 },
      );
    }
    return NextResponse.json({ equipamento });
  } catch (erro) {
    console.error("PATCH /api/equipamentos/[id]:", erro);
    return NextResponse.json(
      { erro: "Não foi possível atualizar o equipamento." },
      { status: 500 },
    );
  }
}
