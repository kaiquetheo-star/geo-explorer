#!/usr/bin/env node
// Servidor MCP do Geo-Explorer (SDK oficial, transporte stdio).
// Expõe os mesmos recursos do CLI como tools MCP — CLI e MCP compartilham o núcleo em src/.
//
// ⚠️ Este processo fala JSON-RPC no stdout: qualquer log deve ir para o stderr.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { carregarTrilhas, buscarTrilha } from "../src/lib/dados.js";
import { gerarPlano } from "../src/commands/trilha.js";
import { gerarDesafio } from "../src/commands/desafio.js";
import { montarCertificado } from "../src/commands/certificado.js";

const ID_TRILHA = {
  type: "string",
  description: "id da trilha (ver listar_trilhas). Ex.: javascript",
};

const FERRAMENTAS = [
  {
    name: "listar_trilhas",
    description: "Lista as trilhas de aprendizagem disponíveis no Geo-Explorer.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "ver_trilha",
    description: "Mostra o plano de estudos completo de uma trilha (módulos, tópicos e carga horária).",
    inputSchema: {
      type: "object",
      properties: { trilha: ID_TRILHA },
      required: ["trilha"],
    },
  },
  {
    name: "gerar_desafio",
    description: "Gera um desafio de código para uma trilha em um nível específico.",
    inputSchema: {
      type: "object",
      properties: {
        trilha: ID_TRILHA,
        nivel: { type: "string", enum: ["iniciante", "intermediario", "avancado"] },
      },
      required: ["trilha", "nivel"],
    },
  },
  {
    name: "gerar_certificado",
    description: "Emite um certificado fictício de conclusão de trilha (Markdown).",
    inputSchema: {
      type: "object",
      properties: {
        trilha: ID_TRILHA,
        nome: { type: "string", description: "nome completo da pessoa certificada" },
      },
      required: ["trilha", "nome"],
    },
  },
];

function resposta(texto) {
  return { content: [{ type: "text", text: texto }] };
}

function trilhaOuErro(trilhas, id) {
  const trilha = buscarTrilha(trilhas, id);
  return trilha ? null : resposta(`Trilha não encontrada: "${id}". Use listar_trilhas.`);
}

const server = new Server(
  { name: "geo-explorer", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: FERRAMENTAS }));

server.setRequestHandler(CallToolRequestSchema, async (pedido) => {
  const { name, arguments: args = {} } = pedido.params;
  const trilhas = carregarTrilhas();

  switch (name) {
    case "listar_trilhas":
      return resposta(
        trilhas.map((t) => `${t.id} — ${t.nome} · ${t.carga_horaria}`).join("\n"),
      );

    case "ver_trilha": {
      const falha = trilhaOuErro(trilhas, args.trilha);
      if (falha) return falha;
      return resposta(gerarPlano(buscarTrilha(trilhas, args.trilha)));
    }

    case "gerar_desafio": {
      const falha = trilhaOuErro(trilhas, args.trilha);
      if (falha) return falha;
      try {
        return resposta(gerarDesafio(buscarTrilha(trilhas, args.trilha), args.nivel));
      } catch (excecao) {
        return resposta(excecao.message); // nível inválido vira mensagem, não crash
      }
    }

    case "gerar_certificado": {
      const falha = trilhaOuErro(trilhas, args.trilha);
      if (falha) return falha;
      if (!args.nome || !String(args.nome).trim()) {
        return resposta('Informe o parâmetro "nome" completo.');
      }
      return resposta(montarCertificado(buscarTrilha(trilhas, args.trilha), args.nome));
    }

    default:
      return resposta(`Ferramenta desconhecida: ${name}`);
  }
});

const transporte = new StdioServerTransport();
await server.connect(transporte);
console.error("geo-explorer MCP pronto (stdio)");
