
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

interface MensagemChat {
  papel: "usuario" | "robot";
  texto: string;
}

const PROMPT_SISTEMA = `Você é o Conecta Robot, o assistente virtual de IA do ConectaTI Senac.
Ajude servidores, instrutores e o Suporte TI com chamados, equipamentos, indicadores e avaliações.
Responda em português do Brasil, de forma simpática, objetiva e profissional.
Use respostas curtas, de 2 a 5 frases.
Nunca invente números de chamados ou patrimônios.
Se a pergunta estiver fora do escopo, redirecione educadamente para o ConectaTI.`;

export async function POST(requisicao: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (!apiKey) {
      console.error("GROQ_API_KEY não está configurada.");
      return NextResponse.json(
        { erro: "A chave da IA não está configurada no servidor." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const corpo = await requisicao.json() as {
      mensagens?: MensagemChat[];
    };

    const mensagens = Array.isArray(corpo.mensagens)
      ? corpo.mensagens
      : [];

    const historicoValido = mensagens
      .filter(
        (m) =>
          m &&
          typeof m.texto === "string" &&
          m.texto.trim().length > 0 &&
          (m.papel === "usuario" || m.papel === "robot")
      )
      .slice(-12)
      .map((m) => ({
        role: m.papel === "usuario" ? "user" as const : "assistant" as const,
        content: m.texto.slice(0, 2000),
      }));

    if (historicoValido.length === 0) {
      return NextResponse.json(
        { erro: "Envie uma mensagem para conversar com o Conecta Robot." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        ...historicoValido,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const resposta = completion.choices[0]?.message?.content?.trim();

    if (!resposta) {
      return NextResponse.json(
        { erro: "O Conecta Robot não conseguiu responder." },
        { status: 502 }
      );
    }

    return NextResponse.json({ resposta });
  } catch (erro) {
    console.error("Erro no chat:", erro);

    return NextResponse.json(
      { erro: "Conecta Robot indisponível neste momento. Tente novamente." },
      { status: 500 }
    );
  }
}
