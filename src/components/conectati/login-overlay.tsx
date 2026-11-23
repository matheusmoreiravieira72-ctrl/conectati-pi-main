"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Fingerprint, LogIn, ScanFace, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { autenticarBiometria, type MetodoBiometria } from "@/lib/biometria";

interface PropsLogin {
  aberto: boolean;
  onFechar: () => void;
  onEntrar: (nome: string, metodo: string) => void;
}

export function LoginOverlay({ aberto, onFechar, onEntrar }: PropsLogin) {
  const { toast } = useToast();
  const inputNomeRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState<MetodoBiometria | null>(null);
  const [simulado, setSimulado] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const tentativaRef = useRef(0);

  useEffect(() => {
    if (aberto && inputNomeRef.current) {
      const salvo = localStorage.getItem("hd_nome");
      if (salvo) inputNomeRef.current.value = salvo;
    }
  }, [aberto]);

  if (!aberto) return null;

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
    setSucesso(false);
  }

  async function entrarBiometria(metodo: MetodoBiometria) {
    const nomeFinal = validarNome();
    if (!nomeFinal || processando) return;

    const tentativa = ++tentativaRef.current;
    setSimulado(false);
    setProcessando(metodo);

    const resultado = await autenticarBiometria(metodo);
    if (tentativaRef.current !== tentativa) return; // cancelado

    setProcessando(null);
    if (resultado.ok) {
      setSimulado(resultado.simulado);
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
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Acesso ao sistema"
    >
      <div className="relative w-full max-w-md rounded-t-3xl border border-white/60 bg-white p-5 pb-8 text-slate-900 shadow-2xl sm:rounded-3xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Senac Taguatinga
          </p>
          <h2 className="text-lg font-bold">Acesso ao ConectaTI</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Use a biometria do dispositivo para entrar
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="login-nome" className="sr-only">
            Seu nome
          </label>
          <Input
            id="login-nome"
            ref={inputNomeRef}
            placeholder="Seu nome (ex.: Prof. Maria Silva)"
            maxLength={60}
            autoComplete="name"
            className="h-11 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <Button
            className="h-12 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-orange-400 text-base font-bold text-white hover:brightness-105"
            onClick={() => entrarBiometria("digital")}
            disabled={!!processando || salvando}
          >
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
            Entrar com digital
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full border-2 border-blue-600 bg-white text-base font-semibold text-blue-900 hover:bg-blue-50 dark:border-blue-400 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800"
            onClick={() => entrarBiometria("facial")}
            disabled={!!processando || salvando}
          >
            <ScanFace className="h-5 w-5" aria-hidden="true" />
            Entrar com reconhecimento facial
          </Button>

          <Button
            variant="ghost"
            className="h-10 w-full text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={entrarSemBiometria}
            disabled={!!processando || salvando}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Entrar sem biometria
          </Button>

          <p className="text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            Impressão digital e reconhecimento facial via WebAuthn. Sem sensor
            disponível, uma biometria simulada é usada.
          </p>
        </div>

        {processando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-t-3xl bg-white/95 backdrop-blur-sm sm:rounded-3xl dark:bg-slate-900/95">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/25" />
              <span className="absolute inset-3 animate-pulse rounded-full bg-blue-500/10" />
              {processando === "digital" ? (
                <Fingerprint
                  className="relative h-14 w-14 animate-pulse text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              ) : (
                <ScanFace
                  className="relative h-14 w-14 animate-pulse text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {processando === "digital"
                  ? "Verificando digital…"
                  : "Reconhecendo rosto…"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Posicione o{" "}
                {processando === "digital" ? "dedo no sensor" : "rosto na câmera"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              onClick={cancelar}
            >
              Cancelar
            </Button>
          </div>
        )}

        {sucesso && !processando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-t-3xl bg-white/95 backdrop-blur-sm sm:rounded-3xl dark:bg-slate-900/95">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Acesso autorizado
            </p>
            {simulado && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verificado em modo simulado
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
