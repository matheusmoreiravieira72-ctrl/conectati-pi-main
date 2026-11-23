"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  Inbox,
  Loader2,
  PlusCircle,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  classePrioridade,
  classeStatus,
  formatarData,
  type Chamado,
  type Perfil,
} from "@/lib/chamados";

interface PropsInicio {
  chamados: Chamado[];
  carregando: boolean;
  nome: string;
  perfil: Perfil;
  irPara: (aba: "inicio" | "chamados" | "novo") => void;
}

export function AbaInicio({ chamados, carregando, nome, perfil, irPara }: PropsInicio) {
  const total = chamados.length;
  const abertos = chamados.filter((c) => c.status === "Aberto").length;
  const andamento = chamados.filter((c) => c.status === "Em andamento").length;
  const fechados = chamados.filter((c) => c.status === "Fechado").length;
  const recentes = chamados.slice(0, 5);

  const stats = [
    { rotulo: "Total", valor: total, icone: Ticket, destaque: false },
    { rotulo: "Abertos", valor: abertos, icone: CircleDashed, destaque: false },
    { rotulo: "Em andamento", valor: andamento, icone: Clock, destaque: false },
    { rotulo: "Fechados", valor: fechados, icone: CheckCircle2, destaque: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">
          Olá, {nome.split(" ")[0]}!
        </h2>
        <p className="text-sm text-muted-foreground">
          {perfil === "suporte"
            ? "Você está atuando como Suporte — pode editar, atender e fechar chamados."
            : "Você está atuando como Usuário — abra e acompanhe seus chamados."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.rotulo} className="shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <s.icone
                  className={`h-4 w-4 ${s.destaque ? "text-primary" : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0">
                {carregando ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl font-bold leading-none">{s.valor}</p>
                )}
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {s.rotulo}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button className="h-11 w-full" onClick={() => irPara("novo")}>
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Abrir novo chamado
        </Button>
        <Button variant="outline" className="h-11 w-full" onClick={() => irPara("chamados")}>
          Ver todos os chamados
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Separator />

      <section aria-label="Chamados recentes" className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Chamados recentes</h3>
        {carregando ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando chamados…
          </div>
        ) : recentes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Nenhum chamado ainda. Abra o primeiro!
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentes.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => irPara("chamados")}
                  className="w-full rounded-xl border bg-card p-3.5 text-left transition-colors hover:bg-accent/50"
                  aria-label={`Chamado #${c.numero}: ${c.titulo}, status ${c.status}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{String(c.numero).padStart(3, "0")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0 text-[11px] ${classeStatus(c.status)}`}
                      >
                        {c.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`px-2 py-0 text-[11px] ${classePrioridade(c.prioridade)}`}
                      >
                        {c.prioridade}
                      </Badge>
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium">
                    {c.titulo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.categoria} · {formatarData(c.createdAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
