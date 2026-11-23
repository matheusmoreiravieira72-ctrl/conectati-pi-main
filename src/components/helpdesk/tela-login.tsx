"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Fingerprint, LogIn, ScanFace, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { autenticarBiometria, type MetodoBiometria } from "@/lib/biometria";

interface PropsTelaLogin {
  onEntrar: (nome: string, metodo: string) => void;
}

export function TelaLogin({ onEntrar }: PropsTelaLogin) {
  const { toast } = useToast();
  const inputNomeRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState<MetodoBiometria | null>(null);
  const [simulado, setSimulado] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const tentativaRef = useRef(0);

  useEffect(() => {
    const salvo = localStorage.getItem("hd_nome");
    if (salvo && inputNomeRef.current) {
      inputNomeRef.current.value = salvo;
    }
  }, []);

  function validarNome(): string | null {
    const limpo = (inputNomeRef.current?.value ?? "").trim();
    if (limpo.length < 2) {
      toast({
        title: "Informe seu nome",
        description: "Digite pelo menos 2 caracteres para continuar.",
        variant: "destructive",
      });
      return null;
    }
    return limpo;
  }

  async function concluirEntrar(nomeFinal: string, metodo: string) {
    localStorage.setItem("hd_nome", nomeFinal);
    setSucesso(true);
    await new Promise((r) => setTimeout(r, 650));
    onEntrar(nomeFinal, metodo);
  }

  async function entrarBiometria(metodo: MetodoBiometria) {
    const nomeFinal = validarNome();
    if (!nomeFinal || processando) return;

    const tentativa = ++tentativaRef.current;
    setSimulado(false);
    setSucesso(false);
    setProcessando(metodo);

    const resultado = await autenticarBiometria(metodo);
    if (tentativaRef.current !== tentativa) return; // cancelado

    setProcessando(null);
    if (resultado.ok) {
      setSimulado(resultado.simulado);
      if (resultado.erro) {
        console.info("Biometria real indisponível:", resultado.erro);
      }
      const rotulo = metodo === "digital" ? "Digital" : "Reconhecimento facial";
      const sufixo = resultado.simulado
        ? " (simulado)"
        : " (sensor do dispositivo)";
      await concluirEntrar(nomeFinal, rotulo + sufixo);
    } else {
      toast({
        title: "Não foi possível verificar",
        description: resultado.erro ?? "Tente novamente ou entre sem biometria.",
        variant: "destructive",
      });
    }
  }

  async function entrarSemBiometria() {
    const nomeFinal = validarNome();
    if (!nomeFinal || salvando) return;
    setSalvando(true);
    await concluirEntrar(nomeFinal, "Sem biometria");
    setSalvando(false);
  }

  function cancelar() {
    tentativaRef.current += 1;
    setProcessando(null);
    setSimulado(false);
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Sistema de Chamados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse com sua biometria para abrir e acompanhar chamados
          </p>
        </div>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="text-sm font-medium">
              Seu nome
            </label>
            <Input
              id="nome"
              ref={inputNomeRef}
              placeholder="Ex.: Maria Silva"
              maxLength={60}
              autoComplete="name"
            />
          </div>

          <Button
            className="mt-1 h-12 w-full text-base"
            onClick={() => entrarBiometria("digital")}
            disabled={!!processando || salvando}
          >
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
            Entrar com digital
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full text-base"
            onClick={() => entrarBiometria("facial")}
            disabled={!!processando || salvando}
          >
            <ScanFace className="h-5 w-5" aria-hidden="true" />
            Entrar com reconhecimento facial
          </Button>

          <div className="my-1 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="ghost"
            className="h-11 w-full"
            onClick={entrarSemBiometria}
            disabled={!!processando || salvando}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Entrar sem biometria
          </Button>

          <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">
            Usa a impressão digital ou o reconhecimento facial do próprio
            dispositivo (WebAuthn). Sem sensor disponível, uma biometria
            simulada é utilizada.
          </p>

          {processando && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <span className="absolute inset-3 animate-pulse rounded-full bg-primary/10" />
                {processando === "digital" ? (
                  <Fingerprint
                    className="relative h-14 w-14 animate-pulse text-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <ScanFace
                    className="relative h-14 w-14 animate-pulse text-primary"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {processando === "digital"
                    ? "Verificando digital…"
                    : "Reconhecendo rosto…"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Posicione o{" "}
                  {processando === "digital" ? "dedo no sensor" : "rosto na câmera"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={cancelar}>
                Cancelar
              </Button>
            </div>
          )}

          {sucesso && !processando && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur-sm">
              <CheckCircle2 className="h-16 w-16 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">Acesso autorizado</p>
              {simulado && (
                <p className="text-xs text-muted-foreground">
                  Verificado em modo simulado
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
