"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CATEGORIAS, PRIORIDADES, type Prioridade } from "@/lib/chamados";

interface PropsNovo {
  nome: string;
  criando: boolean;
  criar: (dados: {
    titulo: string;
    descricao: string;
    categoria: string;
    prioridade: string;
    autor: string;
  }) => Promise<boolean>;
}

export function AbaNovo({ nome, criando, criar }: PropsNovo) {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<string>("Outro");
  const [prioridade, setPrioridade] = useState<Prioridade>("Média");
  const [autor, setAutor] = useState(nome);

  async function enviar() {
    if (criando) return;
    const tituloLimpo = titulo.trim();
    const descricaoLimpa = descricao.trim();
    const autorLimpo = autor.trim();

    if (tituloLimpo.length < 5) {
      toast({
        title: "Título muito curto",
        description: "Descreva o problema em pelo menos 5 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (descricaoLimpa.length < 10) {
      toast({
        title: "Descrição muito curta",
        description: "Detalhe o problema com pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (!autorLimpo) {
      toast({
        title: "Informe o solicitante",
        description: "Preencha o campo 'Solicitado por'.",
        variant: "destructive",
      });
      return;
    }

    const ok = await criar({
      titulo: tituloLimpo,
      descricao: descricaoLimpa,
      categoria,
      prioridade,
      autor: autorLimpo,
    });

    if (ok) {
      setTitulo("");
      setDescricao("");
      setCategoria("Outro");
      setPrioridade("Média");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Novo chamado</h2>
        <p className="text-sm text-muted-foreground">
          Descreva o problema e a equipe de suporte vai atender.
        </p>
      </div>

      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novo-titulo">Título</Label>
            <Input
              id="novo-titulo"
              placeholder="Ex.: Monitor do caixa piscando"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novo-categoria">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger id="novo-categoria">
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
              <Label htmlFor="novo-prioridade">Prioridade</Label>
              <Select
                value={prioridade}
                onValueChange={(v) => setPrioridade(v as Prioridade)}
              >
                <SelectTrigger id="novo-prioridade">
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
            <Label htmlFor="novo-autor">Solicitado por</Label>
            <Input
              id="novo-autor"
              placeholder="Seu nome"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              maxLength={60}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novo-descricao">Descrição</Label>
            <Textarea
              id="novo-descricao"
              placeholder="Descreva o problema com detalhes: o que aconteceu, quando começou e o que já foi tentado."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <span className="text-right text-xs text-muted-foreground">
              {descricao.length}/1000
            </span>
          </div>

          <Button className="h-11 w-full" onClick={enviar} disabled={criando}>
            {criando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Abrir chamado
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
