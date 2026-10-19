// Testes com o runner nativo do Node (node:test) — zero dependências.
// Rode com: npm test
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { carregarTrilhas, buscarTrilha, validarNivel, escolherDesafio } from "../src/lib/dados.js";
import { gerarPlano } from "../src/commands/trilha.js";
import { gerarDesafio } from "../src/commands/desafio.js";
import { montarCertificado, salvarCertificado } from "../src/commands/certificado.js";

const trilhas = carregarTrilhas();

describe("base de trilhas (data/trilhas.json)", () => {
  test("carrega ao menos 3 trilhas", () => {
    assert.ok(trilhas.length >= 3, `esperava >= 3 trilhas, veio ${trilhas.length}`);
  });

  test("toda trilha tem id, nome, carga, módulos e desafios", () => {
    for (const trilha of trilhas) {
      assert.ok(trilha.id && trilha.nome && trilha.carga_horaria, `trilha incompleta: ${trilha.id}`);
      assert.ok(trilha.modulos.length > 0, `sem módulos: ${trilha.id}`);
      for (const nivel of ["iniciante", "intermediario", "avancado"]) {
        assert.ok(trilha.desafios[nivel]?.length > 0, `sem desafios ${nivel}: ${trilha.id}`);
      }
    }
  });
});

describe("buscarTrilha", () => {
  test("encontra por id ignorando caixa", () => {
    assert.equal(buscarTrilha(trilhas, " JAVASCRIPT ")?.id, "javascript");
  });

  test("retorna undefined para id inexistente", () => {
    assert.equal(buscarTrilha(trilhas, "cobol"), undefined);
  });
});

describe("validarNivel e escolherDesafio", () => {
  test("aceita variações com acento e caixa", () => {
    assert.equal(validarNivel("Intermediário"), "intermediario");
  });

  test("nível inválido lança erro com os níveis aceitos", () => {
    assert.throws(() => validarNivel("mestre"), /Nível inválido/);
  });

  test("sem --aleatorio o desafio é determinístico (1º da lista)", () => {
    const trilha = buscarTrilha(trilhas, "javascript");
    const a = escolherDesafio(trilha, "iniciante");
    const b = escolherDesafio(trilha, "iniciante");
    assert.equal(a.titulo, b.titulo);
  });

  test("--aleatorio devolve um desafio válido da lista", () => {
    const trilha = buscarTrilha(trilhas, "javascript");
    const possiveis = trilha.desafios.iniciante.map((d) => d.titulo);
    for (let i = 0; i < 10; i++) {
      const sorteado = escolherDesafio(trilha, "iniciante", true);
      assert.ok(possiveis.includes(sorteado.titulo));
    }
  });
});

describe("comandos", () => {
  test("gerarPlano inclui nome, carga e todos os módulos", () => {
    const trilha = buscarTrilha(trilhas, "python");
    const plano = gerarPlano(trilha);
    assert.ok(plano.includes(trilha.nome));
    assert.ok(plano.includes(trilha.carga_horaria));
    for (const modulo of trilha.modulos) {
      assert.ok(plano.includes(modulo.titulo), `faltou módulo ${modulo.titulo}`);
    }
  });

  test("gerarDesafio inclui título, nível e requisitos", () => {
    const trilha = buscarTrilha(trilhas, "javascript");
    const saida = gerarDesafio(trilha, "avancado");
    assert.ok(saida.includes("DESAFIO"));
    assert.ok(saida.includes("avancado"));
    assert.ok(saida.includes("Requisitos:"));
  });

  test("certificado contém nome, trilha e aviso de fictício", () => {
    const trilha = buscarTrilha(trilhas, "cloud-devops");
    const conteudo = montarCertificado(trilha, "Kaique");
    assert.ok(conteudo.includes("KAIQUE"));
    assert.ok(conteudo.includes(trilha.nome));
    assert.ok(conteudo.includes("fictício"));
  });

  test("salvarCertificado grava o arquivo na pasta informada", () => {
    const trilha = buscarTrilha(trilhas, "javascript");
    const pastaTemporaria = mkdtempSync(path.join(tmpdir(), "geo-test-"));
    const conteudo = montarCertificado(trilha, "Maria da Silva");
    const arquivo = salvarCertificado(conteudo, trilha.id, "Maria da Silva", pastaTemporaria);
    assert.ok(readFileSync(arquivo, "utf8").includes("MARIA DA SILVA"));
  });

  test("salvarCertificado sem nome lança erro", () => {
    const pastaTemporaria = mkdtempSync(path.join(tmpdir(), "geo-test-"));
    assert.throws(() => salvarCertificado("x", "javascript", "", pastaTemporaria));
  });
});
