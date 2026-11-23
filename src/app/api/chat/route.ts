
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

interface MensagemChat {
  papel: "usuario" | "robot";
  texto: string;
}

const PROMPT_SISTEMA = `
Você é o Conecta Robot, o assistente virtual de IA do ConectaTI Senac.

Sua função é ajudar servidores, instrutores e a equipe de Suporte TI
com chamados, equipamentos, indicadores e avaliações.

REGRAS:
- Responda sempre em português do Brasil.
- Seja simpático, objetivo e profissional.
- Use respostas curtas, de 2 a 5 frases.
- Explique assuntos técnicos de maneira simples.
- Nunca invente números de chamados ou patrimônios.
- Não afirme que realizou ações no sistema se não realizou.
- Quando não souber uma informação, seja transparente.
- Se a pergunta estiver fora do escopo, redirecione educadamente
  para o ConectaTI.
`;

export async function POST(requisicao: Request) {
  try {
    // Verifica a chave da Groq
    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (!apiKey) {
      console.error("GROQ_API_KEY não está configurada.");

      return NextResponse.json(
        { erro: "A chave da IA não está configurada no servidor." },
        { status: 500 }
      );
    }

    // Inicializa a Groq
    const groq = new Groq({ apiKey });

    // Lê os dados recebidos
    const corpo = await requisicao.json();

    const mensagens: MensagemChat[] = Array.isArray(corpo?.mensagens)
      ? corpo.mensagens
      : [];

    // Valida e organiza o histórico
    const historicoValido = mensagens
      .filter(
        (mensagem): mensagem is MensagemChat =>
          mensagem !== null &&
          typeof mensagem === "object" &&
          typeof mensagem.texto === "string" &&
          mensagem.texto.trim().length > 0 &&
          (mensagem.papel === "usuario" ||
            mensagem.papel === "robot")
      )
      .slice(-12)
      .map((mensagem) => ({
        role:
          mensagem.papel === "usuario"
            ? ("user" as const)
            : ("assistant" as const),
        content: mensagem.texto.trim().slice(0, 2000),
      }));

    // Impede requisições sem mensagens
    if (historicoValido.length === 0) {
      return NextResponse.json(
        { erro: "Envie uma mensagem para conversar com o Conecta Robot." },
        { status: 400 }
      );
    }

    // Envia a conversa para a inteligência artificial
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: PROMPT_SISTEMA,
        },
        ...historicoValido,
      ],
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    // Recupera a resposta
    const resposta =
      completion.choices[0]?.message?.content?.trim();

    if (!resposta) {
      console.error("A Groq retornou uma resposta vazia.");

      return NextResponse.json(
        { erro: "O Conecta Robot não conseguiu responder." },
        { status: 502 }
      );
    }

    return NextResponse.json({ resposta });
  } catch (erro) {
    console.error("Erro no chat:", erro);

    return NextResponse.json(
      {
        erro: "Conecta Robot indisponível neste momento. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
