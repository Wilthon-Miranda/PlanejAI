import { useCallback, useEffect, useRef, useState } from 'react'

import { buildAIPrompt, buildFollowUpPrompt } from '@/data/aiPrompt'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import {
  getInsight,
  type InsightData,
  type InsightMessage,
  summarizeInsight,
} from '@/services/aiService'

const pendingFetches = new Map<string, Promise<InsightData>>()

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
        ...(data.conversation ? { conversation: data.conversation } : {}),
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

        let promise = pendingFetches.get(simulationId)
        if (!promise) {
          promise = getInsight(prompt)
          pendingFetches.set(simulationId, promise)
        }

        const data = await promise
        saveInsight(simulationId, data)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erro ao gerar o diagnóstico. Tente novamente.'
        setError(errorMessage)
      } finally {
        pendingFetches.delete(simulationId)
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

      const history = (currentInsight.conversation ?? []) as InsightMessage[]

      const pendingConversation: InsightMessage[] = [
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
          currentInsight as unknown as Record<string, unknown>,
          pendingConversation,
          trimmedQuestion,
        )
        const data = await getInsight(prompt)

        const nextInsight: InsightData = {
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
    if (insight || isLoading || error || isRequestPending.current) {
      return
    }

    fetchInsight(id)
  }, [id, insight, isLoading, error, fetchInsight])

  return { insight, isLoading, error, fetchInsight, askQuestion }
}
