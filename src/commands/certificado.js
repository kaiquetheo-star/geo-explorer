// Comando `certificado`: emite certificado fictício de conclusão.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

// Função pura (sem I/O): fácil de testar e reaproveitada pelo servidor MCP.
export function montarCertificado(trilha, nome, data = hoje()) {
  return [
    "# 🏔️ GEO-EXPLORER",
    "## Certificado fictício de conclusão de trilha",
    "",
    `Certificamos que **${nome.toUpperCase()}** concluiu a trilha **${trilha.nome}**.`,
    "",
    `- Trilha: ${trilha.nome} (${trilha.id})`,
    `- Carga horária: ${trilha.carga_horaria}`,
    `- Data de emissão: ${data}`,
    "",
    "> ⚠️ Documento fictício, gerado para fins de estudo — não possui validade real.",
    "",
    "_Emitido pelo Geo-Explorer_ 🧭",
  ].join("\n");
}

// Sanitiza o nome para virar nome de arquivo seguro (ex.: "Joãoão Silva" -> "joao-silva").
function slug(nome) {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function salvarCertificado(conteudo, trilhaId, nome, pastaSaida) {
  if (!nome || !nome.trim()) {
    throw new Error('Informe o nome com --nome "Seu Nome".');
  }
  mkdirSync(pastaSaida, { recursive: true });
  const arquivo = path.join(pastaSaida, `certificado-${trilhaId}-${slug(nome)}.md`);
  writeFileSync(arquivo, conteudo, "utf8");
  return arquivo;
}
