// Comando `desafio`: gera um desafio de código por trilha + nível.
import { escolherDesafio } from "../lib/dados.js";

export function gerarDesafio(trilha, nivel, aleatorio = false) {
  const desafio = escolherDesafio(trilha, nivel, aleatorio);
  return [
    "⚔️  DESAFIO DE CÓDIGO",
    `Trilha: ${trilha.nome} · Nível: ${desafio.nivel}`,
    "",
    desafio.titulo,
    "",
    desafio.enunciado,
    "",
    "Requisitos:",
    ...desafio.requisitos.map((requisito) => `  • ${requisito}`),
  ].join("\n");
}
