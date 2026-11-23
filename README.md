# ConectaTI Senac — versão corrigida

Sistema de Chamados, Suporte Técnico e Gestão de Equipamentos do Senac
(Taguatinga/DF). Esta versão corrige os erros visíveis nas telas
("Falha ao carregar os dados", "Erro ao carregar dados" e o bloqueio ao salvar
o chamado), além de reconstruir os arquivos que estavam faltando no projeto.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — não é preciso configurar banco de dados,
variáveis de ambiente ou executar migrações.

## O que estava quebrado e foi corrigido

1. **"Falha ao carregar os dados" / "Erro ao carregar dados" (print 1)**
   - As APIs (`/api/chamados`, `/api/equipamentos`, `/api/avaliacoes`) usavam
     Prisma (`db.chamado`, `db.equipamento`, `db.avaliacao`), mas o projeto não
     tinha `prisma/schema.prisma`, `package.json`, `.env` nem banco configurado:
     toda chamada retornava 500.
   - **Correção:** nova camada de dados própria em `src/lib/store.ts`
     (armazenamento em `.data/db.json` + dados iniciais idênticos aos originais:
     30 chamados e 22 notebooks). As rotas de API foram reescritas mantendo as
     mesmas respostas e validações. Se quiser voltar ao Prisma depois, o
     `store.ts` concentra todas as operações de dados em um só lugar.

2. **"Não foi possível abrir o chamado — pelo menos 10 caracteres" (print 2)**
   - Essa mensagem é uma validação de propósito (a descrição mínima é de 10
     caracteres; no print haviam sido digitados apenas 6). O problema era que o
     formulário não explicava a regra. Agora o campo mostra, em vermelho,
     "A descrição precisa de pelo menos 10 caracteres — faltam N" e o botão
     **Salvar** fica desabilitado até a descrição ser válida. Com 10 caracteres
     ou mais, o chamado é salvo normalmente.

3. **Arquivos faltando no projeto (impediam a compilação)**
   - Recriados: `components/ui/button.tsx`, `input.tsx`, `textarea.tsx`,
     `label.tsx`, `card.tsx`, `select.tsx`, `badge.tsx`, `separator.tsx`,
     `alert-dialog.tsx`, `toast.tsx`, `dialog.tsx` (estava vazio no zip),
     `hooks/use-toast.ts`.
   - Adicionados: `package.json`, `tsconfig.json`, `postcss.config.mjs`,
     `next.config.ts`, `components.json`, `.gitignore`.

4. **Assets públicos ausentes**
   - `public/senac-logo.png` (placeholder simples — substitua pelo logo oficial
     mantendo o mesmo nome) e `public/qr-avaliacao.png` (QR aponta para
     `http://localhost:3000/avaliacao`; regenere apontando para o endereço real
     de produção se necessário).

## Observações

- Os dados ficam em `.data/db.json` (criado automaticamente na primeira
  execução). Para zerar os dados, apague esse arquivo.
- O assistente **Conecta Robot** (`/api/chat`) usa o `z-ai-web-dev-sdk`; sem
  credenciais configuradas ele responde com erro amigável, sem quebrar o resto
  do sistema.
- Login é simulado (perfil Suporte TI); biometria/facial usam a API WebAuthn do
  navegador quando disponível.
