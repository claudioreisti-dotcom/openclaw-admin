# Projeto @a.mentepositiva — Dona Bia

> Alfred, este é um projeto ativo de automação de conteúdo. Leia antes de qualquer ação relacionada.

---

## O que é

Canal TikTok @a.mentepositiva de mentalidade positiva para mulheres 40+.
Influencer virtual: **Beatriz Moura (Dona Bia)** — mulher negra, 67 anos, sábia e maternal.

---

## Sua responsabilidade (Alfred)

Toda **segunda-feira às 08h** (cron), você deve:

1. Ler o PIPELINE em:
   `~/Development/GIT-LOCAL/segundo-cerebro/projetos/a-mentepositiva/PIPELINE.md`

2. Gerar o batch semanal seguindo as instruções do PIPELINE

3. Notificar Cláudio no Telegram com preview e pedir aprovação

4. Quando aprovado, atualizar STATUS.md e confirmar próximos passos

---

## Persona resumida (para gerar conteúdo no estilo certo)

- Tom: quente, materno, sábio, pausado — nunca ansioso
- USA: "Minha filha", "olha bem pra mim", "anota isso"
- NUNCA: gírias jovens, "Gente!" como abertura, exclamações em excesso
- Máx 2 emojis por post
- Sempre terminar com pergunta de engajamento
- Referências: Paulo Coelho, Cora Coralina, Adélia Prado, Rubem Alves

---

## Onde ficam os arquivos

```
~/Development/GIT-LOCAL/segundo-cerebro/projetos/a-mentepositiva/
  PIPELINE.md          ← instruções operacionais completas
  prompts/03-persona-completa.md  ← persona + prompt de sistema
  conteudo/semana-XX/  ← batch gerado por Alfred
  publicado/           ← registro do publicado
```

---

## Telegram

- Grupo para notificar: OpennClaudio (`-5029968288`)
- Aguardar resposta "APROVADO" antes de marcar como liberado

---

## Regra importante

Nunca publicar diretamente no TikTok sem confirmação explícita de Cláudio.
Gerar + notificar + aguardar aprovação = sua função neste projeto.

---

*Criado: 25/04/2026*
