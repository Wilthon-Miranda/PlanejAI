import type { SimulationRecord } from '@/data/simulation'
import { parseCurrency } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'

const RESPONSE_SCHEMA = `{
  "feasibility": {
    "status": "viable" | "needs_adjustment" | "unfeasible",
    "content": "<Análise objetiva sobre se a meta é atingível no prazo com o valor disponível. Mencione os números relevantes.>"
  },
  "diagnosis": {
    "content": "<Diagnóstico focado no comprometimento do orçamento: quanto % da renda está comprometida com gastos e dívidas, e o que isso representa para a saúde financeira.>"
  },
  "suggestions": {
    "items": ["<Sugestão prática e concreta para reduzir gastos ou reorganizar o orçamento>"]
  },
  "extraIncome": {
    "items": ["<Ideia prática para gerar renda extra compatível com a realidade brasileira>"]
  },
  "investment": {
    "items": ["<Sugestão de investimento acessível para o perfil apresentado, com foco em atingir a meta>"]
  },
  "motivation": {
    "content": "<Mensagem final motivacional e personalizada, citando a meta pelo nome.>"
  }
}`

export function buildAIPrompt(simulation: SimulationRecord) {
  const { income, expenses, debts, goalName, goalAmount, goalDeadline } =
    simulation

  const monthlySavings = calcMonthlySavings(simulation)
  const monthlySavingsNeeded =
    parseCurrency(goalAmount) / parseInt(goalDeadline)

  return `Você é um educador financeiro especializado em finanças pessoais. Analise os dados abaixo e gere um diagnóstico financeiro personalizado com linguagem clara, didática e encorajadora, voltado para pessoas sem conhecimento financeiro. O diagnóstico será exibido diretamente ao usuário no app, fale sempre em segunda pessoa ("você tem...", "sua meta...").

Dados da simulação:
- Renda mensal bruta: ${income}
- Custos fixos essenciais: ${expenses}
- Dívidas e parcelas mensais: ${debts}
- Valor disponível por mês: ${monthlySavings} reais
- Meta: ${goalName}
- Custo da meta: ${goalAmount}
- Prazo desejado: ${goalDeadline} meses
- Economia mensal necessária para atingir a meta no prazo: ${monthlySavingsNeeded} reais
- Saldo após reserva para a meta: ${monthlySavings - monthlySavingsNeeded} reais

Retorne APENAS um JSON válido, sem texto adicional, sem blocos de código, neste formato exato:

${RESPONSE_SCHEMA}

Regras:
- Todos os textos em português do Brasil
- Máximo de 4 itens por lista
- Seja específico ao citar valores calculados
- Não repita informações entre seções
- Nunca use markdown dentro dos valores do JSON
- Para o campo "feasibility.status", use os seguintes critérios:
  - "viable": saldo após reserva para a meta é maior ou igual a 0
  - "needs_adjustment": saldo negativo de até 20% do valor da economia mensal necessária
  - "unfeasible": saldo negativo superior a 20% do valor da economia mensal necessária`
}

export function buildFollowUpPrompt(
  simulation: SimulationRecord,
  insight: Record<string, unknown>,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  question: string,
) {
  const basePrompt = buildAIPrompt(simulation)

  return `${basePrompt}

Contexto adicional para a conversa:
- Este é um acompanhamento do insight já gerado para o usuário.
- O insight atual, em formato JSON, está abaixo e deve servir como base para respostas personalizadas:
${JSON.stringify(insight, null, 2)}

Histórico da conversa:
${
  history
    .map(
      (message) =>
        `${message.role === 'user' ? 'Usuário' : 'Assistente'}: ${message.content}`,
    )
    .join('\n') || 'Nenhuma mensagem anterior.'
}

Pergunta atual do usuário:
${question}

Instruções para a resposta:
- Responda em português do Brasil.
- Mantenha a análise financeira personalizada e continue a conversa sem apagar o diagnóstico original.
- Use o insight atual como contexto e adapte a resposta à pergunta do usuário.
- Quando a dúvida impactar a meta, cite valores e proponha um ajuste prático.
- Retorne APENAS um JSON válido no mesmo formato exato da estrutura anterior, preservando todos os campos e ajustando os textos conforme a pergunta.
- Não use markdown dentro dos valores do JSON.`
}
