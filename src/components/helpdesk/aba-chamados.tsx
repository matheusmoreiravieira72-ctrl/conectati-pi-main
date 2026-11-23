"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Pencil,
  Play,
  RotateCcw,
  Search,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CATEGORIAS,
  PRIORIDADES,
  classePrioridade,
  classeStatus,
  formatarData,
  type Chamado,
  type Perfil,
  type Prioridade,
  type Status,
} from "@/lib/chamados";

type Filtro = "Todos" | Status;

interface PropsChamados {
  chamados: Chamado[];
  carregando: boolean;
  perfil: Perfil;
  atualizar: (
    id: string,
    dados: Partial<Pick<Chamado, "titulo" | "descricao" | "categoria" | "prioridade" | "status">>,
  ) => Promise<boolean>;
  irPara: (aba: "inicio" | "chamados" | "novo") => void;
}

export function AbaChamados({ chamados, carregando, perfil, atualizar, irPara }: PropsChamados) {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [busca, setBusca] = useState("");

  const [editando, setEditando] = useState<Chamado | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [fechando, setFechando] = useState<Chamado | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState<string | null>(null);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return chamados.filter((c) => {
      const combinaFiltro = filtro === "Todos" || c.status === filtro;
      const combinaBusca =
        !termo ||
        c.titulo.toLowerCase().includes(termo) ||
        c.descricao.toLowerCase().includes(termo) ||
        String(c.numero).includes(termo);
      return combinaFiltro && combinaBusca;
    });
  }, [chamados, filtro, busca]);

  const contagem = useMemo(() => {
    return {
      Todos: chamados.length,
      Aberto: chamados.filter((c) => c.status === "Aberto").length,
      "Em andamento": chamados.filter((c) => c.status === "Em andamento").length,
      Fechado: chamados.filter((c) => c.status === "Fechado").length,
    } as Record<Filtro, number>;
  }, [chamados]);

  async function acaoStatus(chamado: Chamado, status: Status, mensagem: string) {
    if (processandoAcao) return;
    setProcessandoAcao(chamado.id + status);
    const ok = await atualizar(chamado.id, { status });
    setProcessandoAcao(null);
    if (ok) {
      toast({ title: mensagem, description: `Chamado #${chamado.numero} — ${chamado.titulo}` });
    }
  }

  async function salvarEdicao() {
    if (!editando || salvandoEdicao) return;
    const titulo = editando.titulo.trim();
    const descricao = editando.descricao.trim();
    if (titulo.length < 5) {
      toast({
        title: "Título muito curto",
        description: "O título precisa ter pelo menos 5 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (descricao.length < 10) {
      toast({
        title: "Descrição muito curta",
        description: "Descreva o problema com pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setSalvandoEdicao(true);
    const ok = await atualizar(editando.id, {
      titulo,
      descricao,
      categoria: editando.categoria,
      prioridade: editando.prioridade,
    });
    setSalvandoEdicao(false);
    if (ok) {
      toast({
        title: "Chamado atualizado!",
        description: `As alterações no chamado #${editando.numero} foram salvas.`,
      });
      setEditando(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Chamados</h2>
        <Badge variant="secondary">{chamados.length} no total</Badge>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Buscar por título, descrição ou nº…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
          aria-label="Buscar chamados"
        />
      </div>

      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label="Filtrar por status"
      >
        {(["Todos", "Aberto", "Em andamento", "Fechado"] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              filtro === f
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {f} ({contagem[f]})
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando chamados…
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
          <Search className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Nenhum chamado encontrado{busca ? " para essa busca" : ""}.
          </p>
          <Button variant="outline" size="sm" onClick={() => irPara("novo")}>
            Criar novo chamado
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {listaFiltrada.map((c) => (
            <li key={c.id}>
              <Card className={`shadow-none ${c.status === "Fechado" ? "opacity-80" : ""}`}>
                <CardContent className="flex flex-col gap-2.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{String(c.numero).padStart(3, "0")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Badge variant="outline" className="px-2 py-0 text-[11px]">
                        {c.categoria}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`px-2 py-0 text-[11px] ${classePrioridade(c.prioridade)}`}
                      >
                        {c.prioridade}
                      </Badge>
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold leading-snug">{c.titulo}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {c.descricao}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0 text-[11px] ${classeStatus(c.status)}`}
                    >
                      {c.status}
                    </Badge>
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" aria-hidden="true" />
                      {c.autor}
                    </span>
                    <span>{formatarData(c.createdAt)}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditando(c)}
                      aria-label={`Editar chamado ${c.numero}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Editar
                    </Button>

                    {perfil === "suporte" && (
                      <>
                        {c.status === "Aberto" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={processandoAcao !== null}
                            onClick={() =>
                              acaoStatus(c, "Em andamento", "Atendimento iniciado!")
                            }
                            aria-label={`Iniciar atendimento do chamado ${c.numero}`}
                          >
                            {processandoAcao === c.id + "Em andamento" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            Iniciar atendimento
                          </Button>
                        )}

                        {c.status !== "Fechado" && (
                          <Button
                            size="sm"
                            disabled={processandoAcao !== null}
                            onClick={() => setFechando(c)}
                            aria-label={`Fechar chamado ${c.numero}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Fechar chamado
                          </Button>
                        )}

                        {c.status === "Fechado" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processandoAcao !== null}
                            onClick={() => acaoStatus(c, "Aberto", "Chamado reaberto!")}
                            aria-label={`Reabrir chamado ${c.numero}`}
                          >
                            {processandoAcao === c.id + "Aberto" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            Reabrir
                          </Button>
                        )}
                      </>
                    )}

                    {perfil !== "suporte" && c.status === "Fechado" && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        Encerrado pelo suporte
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Diálogo de edição */}
      <Dialog
        open={editando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEditando(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar chamado</DialogTitle>
            <DialogDescription>
              {editando && (
                <>
                  #{String(editando.numero).padStart(3, "0")} · aberto por{" "}
                  {editando.autor} · status atual: {editando.status}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {editando && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editar-titulo">Título</Label>
                <Input
                  id="editar-titulo"
                  value={editando.titulo}
                  onChange={(e) =>
                    setEditando({ ...editando, titulo: e.target.value })
                  }
                  maxLength={120}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="editar-categoria">Categoria</Label>
                  <Select
                    value={editando.categoria}
                    onValueChange={(v) => setEditando({ ...editando, categoria: v })}
                  >
                    <SelectTrigger id="editar-categoria">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="editar-prioridade">Prioridade</Label>
                  <Select
                    value={editando.prioridade}
                    onValueChange={(v) =>
                      setEditando({ ...editando, prioridade: v })
                    }
                  >
                    <SelectTrigger id="editar-prioridade">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editar-descricao">Descrição</Label>
                <Textarea
                  id="editar-descricao"
                  value={editando.descricao}
                  onChange={(e) =>
                    setEditando({ ...editando, descricao: e.target.value })
                  }
                  rows={5}
                  maxLength={1000}
                />
                <span className="text-right text-xs text-muted-foreground">
                  {editando.descricao.length}/1000
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setEditando(null)} disabled={salvandoEdicao}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao} disabled={salvandoEdicao}>
              {salvandoEdicao && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de fechamento (somente suporte) */}
      <AlertDialog
        open={fechando !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setFechando(null);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Fechar chamado{" "}
              {fechando && `#${String(fechando.numero).padStart(3, "0")}`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O chamado será marcado como <strong>Fechado</strong> e sairá da
              fila de atendimento. Você poderá reabri-lo depois, se precisar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!fechando) return;
                const alvo = fechando;
                setFechando(null);
                await acaoStatus(alvo, "Fechado", "Chamado fechado!");
              }}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Fechar chamado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
