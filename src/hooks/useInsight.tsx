import { useCallback, useEffect, useRef, useState } from 'react'

import { buildAIPrompt, buildFollowUpPrompt } from '@/data/aiPrompt'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import {
  getInsight,
  summarizeInsight,
  type InsightData,
} from '@/services/aiService'

export const useInsight = (id: string) => {
  const isRequestPending = useRef(false)
  const { getFormData, updateSimulation } = useSimulationStorage()

  const [insight, setInsight] = useState<InsightData | null>(() => {
    const simulation = getFormData(id)

    if (simulation?.insight) {
      return simulation.insight
    }

    return null
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveInsight = useCallback(
    (simulationId: string, data: InsightData) => {
      const simulation = getFormData(simulationId)
      if (!simulation) {
        return
      }

      const nextInsight = {
        ...data,
        conversation: data.conversation ?? [
          { role: 'assistant', content: summarizeInsight(data) },
        ],
      }

      setInsight(nextInsight)
      updateSimulation(simulationId, {
        ...simulation,
        insight: nextInsight,
      } as SimulationRecord)
    },
    [getFormData, updateSimulation],
  )

  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation = getFormData(simulationId)

      if (!simulation) {
        setError('Simulação não encontrada.')
        return
      }

      isRequestPending.current = true
      setIsLoading(true)
      setError(null)

      try {
        const prompt = buildAIPrompt(simulation)
        const data = await getInsight(prompt)
        saveInsight(simulationId, data)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erro ao gerar o diagnóstico. Tente novamente.'
        setError(errorMessage)
      } finally {
        isRequestPending.current = false
        setIsLoading(false)
      }
    },
    [getFormData, saveInsight],
  )

  const askQuestion = useCallback(
    async (simulationId: string, question: string) => {
      const trimmedQuestion = question.trim()
      if (!trimmedQuestion) {
        return
      }

      const simulation = getFormData(simulationId)
      if (!simulation) {
        setError('Simulação não encontrada.')
        return
      }

      const currentInsight = insight ?? simulation.insight
      if (!currentInsight) {
        await fetchInsight(simulationId)
        return
      }

      const history = currentInsight.conversation ?? [
        { role: 'assistant', content: summarizeInsight(currentInsight) },
      ]

      const pendingConversation = [
        ...history,
        { role: 'user', content: trimmedQuestion },
      ]

      setInsight({
        ...currentInsight,
        conversation: pendingConversation,
      })

      isRequestPending.current = true
      setIsLoading(true)
      setError(null)

      try {
        const prompt = buildFollowUpPrompt(
          simulation,
          currentInsight,
          pendingConversation,
          trimmedQuestion,
        )
        const data = await getInsight(prompt)

        const nextInsight = {
          ...data,
          conversation: [
            ...pendingConversation,
            { role: 'assistant', content: summarizeInsight(data) },
          ],
        }

        saveInsight(simulationId, nextInsight)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erro ao enviar sua pergunta. Tente novamente.'
        setError(errorMessage)
        // Remove a pergunta do usuário do estado se houver erro
        setInsight((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            conversation: prev.conversation?.slice(0, -1),
          }
        })
      } finally {
        isRequestPending.current = false
        setIsLoading(false)
      }
    },
    [fetchInsight, getFormData, insight, saveInsight],
  )

  useEffect(() => {
    // Evita loop infinito de requisições para a API do Gemini
    if (insight || isLoading || error || isRequestPending.current) {
      return
    }

    fetchInsight(id)
  }, [id, insight, isLoading, error, fetchInsight])

  return { insight, isLoading, error, fetchInsight, askQuestion }
}
