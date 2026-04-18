# PRD — App Financeiro Mobile Offline-First

## 1. Visão do produto

Aplicativo mobile de controle financeiro pessoal com foco em:
- uso **100% mobile**
- funcionamento **offline e online**
- sincronização confiável entre dispositivos
- visão clara de **caixa** e **competência**
- experiência simples, rápida e inteligente
- potencial de crescimento viral por utilidade real e compartilhamento

O produto deve permitir que o usuário registre, acompanhe e projete sua vida financeira sem depender de conexão contínua, sem perder histórico e sem gerar confusão entre data da compra e data do pagamento.

---

## 2. Problema

Os apps financeiros tradicionais falham em pelo menos um destes pontos:
- não funcionam bem offline
- tratam mal parcelamentos e recorrências
- confundem competência com caixa
- têm UX lenta para registrar gastos
- não oferecem previsões realmente úteis
- não inspiram confiança quando há sync entre dispositivos

Para um produto viral, a confiança precisa ser absoluta: o usuário precisa sentir que os números batem e que o app entende como dinheiro funciona na vida real.

---

## 3. Objetivo do MVP

Entregar um app mobile que permita ao usuário:
- registrar receitas e despesas rapidamente
- controlar recorrentes e parcelamentos
- marcar contas como pagas/recebidas
- ver o mês atual em **visão caixa** e **visão competência**
- operar offline com sincronização posterior
- receber alertas úteis sobre o que falta pagar e saldo projetado

---

## 4. Público-alvo inicial

### Primário
- profissionais autônomos, gestores, empreendedores e famílias
- usuários que precisam controlar fluxo real de caixa
- usuários com múltiplas fontes de renda, cartões, parcelamentos e despesas recorrentes

### Secundário
- casais/famílias que compartilham finanças
- pequenos empresários que misturam ou acompanham finanças pessoais e operacionais
- usuários frustrados com planilhas e apps genéricos

---

## 5. Proposta de valor

### Promessa principal
**“Seu financeiro real, funcionando até sem internet.”**

### Diferenciais
- offline-first de verdade
- visão separada entre **quando aconteceu** e **quando pesou no bolso**
- controle natural de parcelamentos e recorrências
- saldo projetado do mês
- UX rápida para lançamento e baixa fricção
- sincronização confiável entre dispositivos

---

## 6. Hipóteses de produto

1. Usuários valorizam mais **clareza e confiança** do que excesso de gráficos.
2. A distinção entre **competência** e **caixa** será percebida como diferencial real.
3. Offline-first melhora retenção e percepção de qualidade.
4. Parcelamentos, faturas e recorrências bem modelados geram vantagem competitiva.
5. Um resumo mensal muito claro pode ser o principal gatilho de compartilhamento e indicação.

---

## 7. Funcionalidades do MVP

## 7.1 Autenticação e conta
- cadastro/login
- recuperação de senha
- sessão persistente
- desbloqueio por biometria

## 7.2 Dashboard do mês
- saldo atual
- total recebido no mês
- total pago no mês
- total ainda a pagar
- saldo projetado
- visão rápida por data/vencimento
- alternância entre:
  - **Visão Caixa**
  - **Visão Competência**

## 7.3 Lançamentos
- criar receita
- criar despesa
- editar lançamento
- excluir lançamento
- categorizar lançamento
- adicionar observação
- anexar comprovante futuramente
- registrar data do evento financeiro
- registrar data de pagamento/recebimento

## 7.4 Recorrentes
- criar receita recorrente
- criar despesa recorrente
- editar valor, vencimento e descrição
- cancelar recorrência
- marcar ocorrência do mês como paga/recebida

## 7.5 Parcelamentos
- criar parcelamento
- informar:
  - descrição
  - valor da parcela
  - total de parcelas
  - parcelas pagas
  - dia de vencimento
- registrar pagamento de parcela
- atualizar próxima parcela
- mostrar quantas faltam

## 7.6 Cartões e faturas
- cadastrar cartões
- importar/transcrever fatura manualmente no MVP
- vincular transações ao cartão
- registrar data de pagamento da fatura
- refletir impacto em visão caixa sem perder data original da transação

## 7.7 Sincronização
- funcionamento offline completo para leitura/escrita
- fila local de operações
- sync automático ao reconectar
- indicador visual de status:
  - sincronizado
  - pendente
  - erro
- política de conflitos definida

## 7.8 Alertas
- contas vencendo hoje
- contas atrasadas
- saldo projetado negativo
- faturas/cartões próximos do vencimento

---

## 8. Funcionalidades pós-MVP
- importação automática de faturas
- parser de texto/áudio para lançar despesas
- compartilhamento familiar/casal
- centro de notificações inteligentes
- metas e orçamento por categoria
- categorização automática
- insights com IA
- modo contador/consultor
- anexos e comprovantes
- exportação PDF/Excel
- painel web administrativo interno

---

## 9. Requisitos funcionais essenciais

1. O app deve funcionar sem internet para operações principais.
2. O usuário deve conseguir criar e editar lançamentos offline.
3. O sistema deve sincronizar automaticamente quando houver conexão.
4. O sistema deve distinguir claramente:
   - data da transação
   - data do pagamento
   - data de vencimento
5. O sistema deve calcular saldo atual e saldo projetado.
6. O sistema deve permitir registrar pagamentos parciais/parcelados quando aplicável.
7. O sistema deve manter histórico e trilha mínima de alterações.

---

## 10. Requisitos não funcionais

### Performance
- abertura inicial < 3 segundos em aparelho mediano
- interações principais < 300ms locais
- leitura do dashboard instantânea com dados locais

### Confiabilidade
- nenhuma ação do usuário pode se perder offline
- operações devem ser idempotentes
- sync precisa ser resiliente a quedas de conexão

### Segurança
- TLS em toda comunicação
- armazenamento seguro de credenciais/token
- suporte a biometria
- criptografia local para dados sensíveis
- trilha de auditoria para alterações relevantes

### Escalabilidade
- arquitetura pronta para múltiplos dispositivos por usuário
- preparada para crescimento de base ativa sem reescrever a fundação

---

## 11. Modelo conceitual de dados

### Entidades principais
- Usuário
- Conta
- Cartão
- Transação
- Recorrente
- Parcelamento
- Categoria
- Fatura
- Evento de Sync
- Dispositivo

### Campos importantes em Transação
- id
- user_id
- descricao
- valor
- tipo (receita/despesa)
- categoria_id
- conta_id
- cartao_id
- data_competencia
- data_pagamento
- data_vencimento
- status
- origem
- observacoes
- created_at
- updated_at
- deleted_at
- sync_status

### Status mínimos
- pendente
- pago
- recebido
- atrasado
- cancelado

---

## 12. Regras de negócio principais

1. **Visão competência** usa a data em que o evento ocorreu.
2. **Visão caixa** usa a data em que houve pagamento/recebimento.
3. Transações de cartão mantêm a data da compra, mas impactam caixa na data da fatura paga.
4. Parcelamentos devem manter número total, parcelas pagas e próxima parcela.
5. Recorrentes geram ocorrências mensais controláveis.
6. Itens vencidos e sem pagamento entram como “em aberto”, independentemente do mês de origem.

---

## 13. Jornada principal do usuário

## 13.1 Primeiro uso
- baixa o app
- cria conta
- define moeda/região
- cadastra contas/cartões
- adiciona primeiras receitas e despesas
- vê o resumo do mês

## 13.2 Uso diário
- lança gasto ou receita em poucos toques
- marca conta como paga
- acompanha o que falta pagar
- consulta saldo projetado

## 13.3 Uso mensal
- revisa contas do mês
- compara caixa vs competência
- identifica apertos antes do vencimento
- fecha o mês com clareza

---

## 14. Métricas do MVP

### Ativação
- % que cadastra pelo menos 1 receita
- % que cadastra pelo menos 3 despesas
- % que cadastra pelo menos 1 recorrente ou parcelamento

### Engajamento
- DAU/WAU
- frequência semanal de uso
- média de lançamentos por usuário

### Retenção
- retenção D7
- retenção D30

### Confiabilidade
- taxa de sync com sucesso
- tempo médio de sincronização
- nº de conflitos por 1.000 operações
- nº de duplicidades/incidentes de consistência

### Valor percebido
- % de usuários que visualizam resumo mensal
- % de usuários que usam visão caixa e competência
- NPS / intenção de indicar

---

## 15. Estratégia de crescimento inicial

### Gatilhos de viralização
- resumo mensal compartilhável
- alertas realmente úteis
- onboarding com valor percebido em poucos minutos
- experiência “isso finalmente faz sentido”
- expansão futura para casal/família/consultor

### Loop inicial
1. usuário organiza a própria vida
2. sente clareza e previsibilidade
3. compartilha insight/resumo com outra pessoa
4. convida parceiro/família/amigo

---

## 16. Stack recomendada para o MVP

### Recomendação atual
- **App:** Flutter
- **Offline local:** banco local no device
- **Sync:** engine madura de offline-first/replicação
- **Backend de domínio:** API própria
- **Auth:** JWT/OAuth + biometria no device
- **Push:** Firebase Cloud Messaging + APNs

### Observação estratégica
A recomendação é **não** começar com sync totalmente customizado como base principal do produto, porque o risco de inconsistência é alto demais para um app financeiro mobile público.

---

## 17. Escopo fora do MVP
- investimentos
- open finance nativo
- múltiplas moedas
- ERP empresarial completo
- contabilidade formal
- conciliação bancária automática avançada

---

## 18. Riscos principais

1. Complexidade de sync maior que o previsto
2. Dificuldade em comunicar a diferença entre caixa e competência
3. Sobrecarga de UX se o app tentar resolver tudo no início
4. Sensibilidade do usuário a qualquer erro de saldo
5. Crescimento sem observabilidade suficiente

### Mitigações
- começar com escopo enxuto
- priorizar confiabilidade antes de features “bonitas”
- criar trilha de auditoria desde o início
- testar offline/sync de forma agressiva
- lançar para grupo controlado antes de escalar

---

## 19. Roadmap sugerido

### Fase 0 — Arquitetura
- definir stack final
- definir modelo de sync
- definir modelo de dados
- definir segurança

### Fase 1 — Foundation
- autenticação
- estrutura local
- sync base
- entidades principais

### Fase 2 — MVP utilizável
- dashboard
- lançamentos
- recorrentes
- parcelamentos
- visão caixa/competência
- alertas básicos

### Fase 3 — Diferencial
- importação de faturas
- insights
- IA
- compartilhamento

---

## 20. Decisões abertas
- qual engine de sync será adotada
- como será a política de conflitos
- qual será o hook viral principal do lançamento
- se o produto será pessoal primeiro ou multiusuário desde o início
- como será a estratégia de monetização inicial

---

## 21. Próximos passos recomendados

1. Fechar a arquitetura técnica
2. Definir o hook principal do MVP
3. Converter este PRD em backlog priorizado
4. Criar wireframes das telas centrais
5. Escrever contratos de dados e eventos de sync
