interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
  }[]
}

const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY)
const MODEL_NAME = 'gemini-flash-latest'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const callGeminiAPI = async (
  prompt: string,
  retries = 3,
  baseDelay = 1000,
): Promise<GeminiResponse> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      })

      if (response.ok) {
        return (await response.json()) as GeminiResponse
      }

      // Erros 5xx são temporários, tentar novamente
      if (response.status >= 500) {
        if (attempt < retries - 1) {
          const waitTime = baseDelay * Math.pow(2, attempt)
          await delay(waitTime)
          continue
        }
        throw new Error(
          `Serviço indisponível. Por favor, tente novamente em alguns momentos.`,
        )
      }

      // Erros 4xx não são recuperáveis
      if (response.status === 401) {
        throw new Error(
          'Erro de autenticação. Verifique a chave de API do Gemini.',
        )
      }
      if (response.status === 429) {
        throw new Error(
          'Limite de requisições excedido. Por favor, aguarde um momento e tente novamente.',
        )
      }

      throw new Error(`Erro na requisição: ${response.status}`)
    } catch (error) {
      // Se for a última tentativa, lançar erro
      if (attempt === retries - 1) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Erro ao gerar o diagnóstico. Tente novamente.')
      }

      // Se for erro de rede, tentar novamente
      if (error instanceof TypeError) {
        const waitTime = baseDelay * Math.pow(2, attempt)
        await delay(waitTime)
        continue
      }

      // Outros erros, lançar direto
      throw error
    }
  }

  throw new Error('Erro ao gerar o diagnóstico. Tente novamente.')
}

export interface InsightMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: { content: string }
  suggestions: { items: string[] }
  extraIncome: { items: string[] }
  investment: { items: string[] }
  motivation: { content: string }
  conversation?: InsightMessage[]
}

export const summarizeInsight = (insight: InsightData) => {
  const sections = [
    `Diagnóstico financeiro: ${insight.diagnosis.content}`,
    `Sugestões práticas: ${insight.suggestions.items.join(' ')}`,
    `Como aumentar sua renda: ${insight.extraIncome.items.join(' ')}`,
    `Sugestões de investimento: ${insight.investment.items.join(' ')}`,
    `Mensagem final: ${insight.motivation.content}`,
  ]

  return sections.join(' ')
}

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt)
  const json = response.candidates[0].content.parts[0].text
  return JSON.parse(json) as InsightData
}
