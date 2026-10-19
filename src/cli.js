#!/usr/bin/env node
// CLI do Geo-Explorer — roteamento de comandos, sem dependências externas.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { carregarTrilhas, buscarTrilha } from "./lib/dados.js";
import { gerarPlano } from "./commands/trilha.js";
import { gerarDesafio } from "./commands/desafio.js";
import { montarCertificado, salvarCertificado } from "./commands/certificado.js";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PASTA_CERTIFICADOS = path.join(RAIZ, "certificados");

const USO = `Geo-Explorer 🧭 — trilhas de aprendizagem

Uso:
  node src/cli.js listar
  node src/cli.js trilha <tecnologia>
  node src/cli.js desafio <tecnologia> --nivel <iniciante|intermediario|avancado> [--aleatorio]
  node src/cli.js certificado <tecnologia> --nome "Seu Nome"

Exemplos:
  node src/cli.js trilha javascript
  node src/cli.js desafio javascript --nivel intermediario --aleatorio
  node src/cli.js certificado python --nome "Kaique"`;

function erro(mensagem) {
  console.error(`✖ ${mensagem}\n\n${USO}`);
  process.exit(1);
}

// --- parsing simples de argumentos (zero dependências) ---
const [comando, alvo, ...flags] = process.argv.slice(2);
const valorFlag = (nome) => {
  const i = flags.indexOf(nome);
  return i >= 0 ? flags[i + 1] : undefined;
};
const temFlag = (nome) => flags.includes(nome);

try {
  const trilhas = carregarTrilhas();

  switch (comando) {
    case undefined:
    case "ajuda":
    case "--help":
    case "-h":
      console.log(USO);
      break;

    case "listar": {
      console.log("🧭 Trilhas disponíveis:\n");
      for (const trilha of trilhas) {
        console.log(`  ${trilha.id.padEnd(14)} ${trilha.nome} · ${trilha.carga_horaria}`);
      }
      break;
    }

    case "trilha": {
      if (!alvo) erro('Informe a tecnologia. Ex.: trilha javascript');
      const trilha = buscarTrilha(trilhas, alvo);
      if (!trilha) erro(`Trilha não encontrada: "${alvo}". Use "listar" para ver as disponíveis.`);
      console.log(gerarPlano(trilha));
      break;
    }

    case "desafio": {
      if (!alvo) erro('Informe a tecnologia. Ex.: desafio javascript --nivel iniciante');
      const trilha = buscarTrilha(trilhas, alvo);
      if (!trilha) erro(`Trilha não encontrada: "${alvo}". Use "listar" para ver as disponíveis.`);
      console.log(gerarDesafio(trilha, valorFlag("--nivel"), temFlag("--aleatorio")));
      break;
    }

    case "certificado": {
      if (!alvo) erro('Informe a tecnologia. Ex.: certificado python --nome "Seu Nome"');
      const trilha = buscarTrilha(trilhas, alvo);
      if (!trilha) erro(`Trilha não encontrada: "${alvo}". Use "listar" para ver as disponíveis.`);
      const nome = valorFlag("--nome");
      if (!nome || !nome.trim()) erro('Informe o nome com --nome "Seu Nome".');
      const conteudo = montarCertificado(trilha, nome);
      const arquivo = salvarCertificado(conteudo, trilha.id, nome, PASTA_CERTIFICADOS);
      console.log(conteudo);
      console.log(`\n📄 Certificado salvo em: ${arquivo}`);
      break;
    }

    default:
      erro(`Comando desconhecido: "${comando}"`);
  }
} catch (excecao) {
  erro(excecao.message);
}
