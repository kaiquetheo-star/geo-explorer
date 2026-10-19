# 🧭 Geo-Explorer

Projeto do desafio **DIO + IBM**: uma experiência de exploração de trilhas de aprendizagem via linha de comando, com base fictícia de trilhas, testes automatizados e um **servidor MCP** que expõe os mesmos recursos para outras ferramentas de IA.

## O que é

O Geo-Explorer é um CLI em **Node.js** com três comandos principais:

| Comando | O que faz |
|---|---|
| `trilha <tecnologia>` | Apresenta o plano de estudos da tecnologia escolhida |
| `desafio <tecnologia> --nivel <nível>` | Gera um desafio de código conforme tecnologia e nível |
| `certificado <tecnologia> --nome "Seu Nome"` | Emite um certificado **fictício** de trilha concluída |

Extras: `listar` (mostra as trilhas disponíveis) e `--aleatorio` (sorteia entre os desafios do nível).

O núcleo é **zero dependência** — CLI e testes usam apenas módulos nativos do Node. O servidor MCP usa o SDK oficial (`@modelcontextprotocol/sdk`).

## Demonstração

```text
$ node src/cli.js trilha javascript
🧭 Trilha JavaScript (javascript)
Do zero ao DOM: fundamentos da linguagem, funções, objetos...
Carga horária: 40h · 4 módulos

  1. Fundamentos da linguagem — 8h
       • variáveis e tipos
       • operadores
       ...

$ node src/cli.js desafio javascript --nivel intermediario
⚔️  DESAFIO DE CÓDIGO
Trilha: Trilha JavaScript · Nível: intermediario

Relatório de vendas

Dado um array de pedidos {produto, valor, quantidade}...

$ node src/cli.js certificado python --nome "Kaique"
# 🏔️ GEO-EXPLORER
## Certificado fictício de conclusão de trilha
Certificamos que **KAIQUE** concluiu a trilha **Trilha Python**...
📄 Certificado salvo em: certificados\certificado-python-kaique.md
```

## Como executar

Pré-requisitos: **Node.js 18+** ([nodejs.org](https://nodejs.org))

```bash
git clone https://github.com/kaiquetheo-star/geo-explorer.git
cd geo-explorer
npm install      # instala o SDK do MCP (o núcleo do CLI não precisa de nada)
```

> Sem instalar nada? O CLI e os testes funcionam mesmo sem `npm install` — a dependência é só para o servidor MCP.

## Como usar os comandos

```bash
npm start                                     # ajuda com todos os comandos
node src/cli.js listar                        # trilhas disponíveis
node src/cli.js trilha javascript             # plano de estudos
node src/cli.js desafio python --nivel iniciante          # desafio de código
node src/cli.js desafio javascript --nivel intermediario --aleatorio   # sorteia entre os desafios do nível
node src/cli.js certificado cloud-devops --nome "Maria da Silva"       # certificado fictício em certificados/
```

Níveis aceitos: `iniciante`, `intermediario`, `avancado` (com ou sem acento).

## Como executar os testes

```bash
npm test
```

São 13 testes com o runner nativo (`node --test`) cobrindo: validação da base de trilhas, busca por id (case-insensitive), níveis válidos/inválidos, determinismo do desafio (e da flag `--aleatorio`), conteúdo do plano/desafio/certificado e gravação do arquivo de certificado em pasta temporária isolada.

## Servidor MCP

O MCP (Model Context Protocol) permite que clientes de IA (Claude Desktop, OpenCode, etc.) usem o Geo-Explorer como ferramenta. O servidor expõe **4 tools**: `listar_trilhas`, `ver_trilha`, `gerar_desafio` e `gerar_certificado`.

```bash
npm run mcp        # sobe o servidor (stdio) — CLI e MCP compartilham o mesmo núcleo em src/
```

Exemplo de configuração em um cliente MCP:

```json
{
  "mcpServers": {
    "geo-explorer": {
      "type": "local",
      "command": ["node", "C:\\caminho\\para\\geo-explorer\\mcp\\server.js"]
    }
  }
}
```

Detalhe de implementação: o processo conversa em JSON-RPC pelo **stdout**, então qualquer log do servidor vai para o **stderr** (`console.error`) para não corromper o protocolo.

## Estrutura do projeto

```text
geo-explorer/
├── data/trilhas.json        # base fictícia (trilhas, módulos, desafios)
├── src/
│   ├── cli.js               # roteamento de comandos (zero deps)
│   ├── lib/dados.js         # carga e validação da base
│   └── commands/            # trilha.js · desafio.js · certificado.js
├── mcp/server.js            # servidor MCP (SDK oficial, stdio)
├── test/geo.test.js         # 13 testes com node:test
├── certificados/            # certificados emitidos
└── package.json
```

## Melhorias realizadas (além do fluxo principal)

- **Comando extra `listar`** — descobrir as trilhas sem abrir o JSON;
- **Flag `--aleatorio`** — sorteia entre os desafios do nível (sem ela, o resultado é determinístico, o que facilita os testes);
- **Servidor MCP com 4 tools** — o CLI e o MCP compartilham o mesmo núcleo, sem duplicar lógica;
- **Robustez de entrada** — ids e níveis aceitam maiúsculas/minúsculas e acento (`"Intermediário"` funciona);
- **Testes isolados** — certificados de teste são gravados em pasta temporária (`os.tmpdir()`), nunca sujando o projeto;
- **Núcleo zero dependência** — só o servidor MCP tem dependência externa.

## O que eu aprendi

- A separar **núcleo (funções puras) da apresentação (CLI)**: tornou os testes triviais e permitiu reusar tudo no servidor MCP;
- A criar um CLI sem framework, parseando `process.argv` na mão — e por que isso vale a pena em projetos pequenos;
- A usar o runner nativo de testes do Node (`node:test` + `assert/strict`), sem Jest;
- Como o **protocolo MCP** funciona por cima de JSON-RPC/stdio e quais pegadinhas existem (logs no stderr, schemas das tools);
- Que a base de dados dirigindo a aplicação (JSON) torna fácil adicionar trilhas sem tocar em código.

## Base de trilhas

Quer adicionar uma trilha? Edite `data/trilhas.json` seguindo a estrutura existente — nenhum código precisa mudar. 🚀

---

Projeto do curso **DIO** (desafio com apoio de IA). Certificados são fictícios, sem validade real.
