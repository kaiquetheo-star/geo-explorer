// Comando `trilha`: monta o plano de estudos em texto.
export function gerarPlano(trilha) {
  const linhas = [
    `🧭 ${trilha.nome} (${trilha.id})`,
    trilha.descricao,
    `Carga horária: ${trilha.carga_horaria} · ${trilha.modulos.length} módulos`,
    "",
  ];
  for (const modulo of trilha.modulos) {
    linhas.push(`  ${modulo.ordem}. ${modulo.titulo} — ${modulo.duracao}`);
    for (const topico of modulo.topicos) {
      linhas.push(`       • ${topico}`);
    }
  }
  return linhas.join("\n");
}
