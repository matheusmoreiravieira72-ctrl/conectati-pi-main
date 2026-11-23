import { NextResponse } from "next/server";
import { listarEquipamentos } from "@/lib/store";

export async function GET() {
  try {
    const equipamentos = await listarEquipamentos();
    return NextResponse.json({ equipamentos });
  } catch (erro) {
    console.error("GET /api/equipamentos:", erro);
    return NextResponse.json(
      { erro: "Não foi possível carregar os equipamentos." },
      { status: 500 },
    );
  }
}
