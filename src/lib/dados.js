// Camada de dados: carrega e valida a base fictícia de trilhas.
// Única responsável por ler o JSON — comandos e MCP consomem estas funções.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Caminho resolvido a partir deste arquivo: funciona em qualquer diretório atual.
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CAMINHO_TRILHAS = path.join(RAIZ, "data", "trilhas.json");

export const NIVEIS = ["iniciante", "intermediario", "avancado"];

// Remove acentos e baixa a caixa — aceita "intermediário" ou "INTERMEDIARIO".
function normalizar(texto) {
  return String(texto ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function carregarTrilhas() {
  const dados = JSON.parse(readFileSync(CAMINHO_TRILHAS, "utf8"));
  if (!Array.isArray(dados.trilhas) || dados.trilhas.length === 0) {
    throw new Error("Base de trilhas inválida: nenhuma trilha encontrada em data/trilhas.json");
  }
  return dados.trilhas;
}

export function buscarTrilha(trilhas, id) {
  const idBuscado = normalizar(id);
  return trilhas.find((trilha) => trilha.id === idBuscado);
}

export function validarNivel(nivel) {
  const normalizado = normalizar(nivel);
  if (!NIVEIS.includes(normalizado)) {
    throw new Error(`Nível inválido: "${nivel}". Use um de: ${NIVEIS.join(", ")}.`);
  }
  return normalizado;
}

export function escolherDesafio(trilha, nivel, aleatorio = false) {
  const nivelValido = validarNivel(nivel);
  const opcoes = trilha.desafios?.[nivelValido] ?? [];
  if (opcoes.length === 0) {
    throw new Error(`Sem desafios cadastrados para "${trilha.id}" no nível "${nivelValido}".`);
  }
  // Sem a flag --aleatorio o resultado é determinístico (o 1º) — bom para testes.
  const indice = aleatorio && opcoes.length > 1 ? Math.floor(Math.random() * opcoes.length) : 0;
  return { nivel: nivelValido, ...opcoes[indice] };
}
