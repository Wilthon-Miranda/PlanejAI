import { ArrowUp } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { type InsightData, type InsightMessage } from '@/services/aiService'

interface ContentProps {
  insight: InsightData
  isSending: boolean
  onSubmit: (question: string) => void
}

const statusStyles = {
  viable: {
    label: 'Meta viável no prazo',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  needs_adjustment: {
    label: 'Ajuste necessário',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  unfeasible: {
    label: 'Meta inviável no prazo',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

const getConversationMessages = (insight: InsightData): InsightMessage[] => {
  return insight.conversation ?? []
}

export function Content({ insight, isSending, onSubmit }: ContentProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [draft, setDraft] = useState('')
  const status = statusStyles[insight.feasibility.status] ?? null
  const messages = getConversationMessages(insight)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages.length, isSending, insight])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const question = draft.trim()
    if (!question || isSending) {
      return
    }

    onSubmit(question)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="border-border flex items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
            ✨ Insight Financeiro Personalizado
          </span>
        </div>
        {status && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[440px] space-y-4 overflow-y-auto pr-1"
      >
        {messages.map((message, index) => {
          const isUser = message.role === 'user'

          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[92%] rounded-2xl border p-3',
                  isUser
                    ? 'border-primary/20 bg-primary/10 text-foreground'
                    : 'border-border bg-card text-foreground',
                ].join(' ')}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
                    {isUser ? 'Você' : 'Resposta da IA'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-current">
                  {message.content}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-border mt-2 flex items-center gap-2 rounded-2xl border bg-transparent p-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Quais são os investimentos mais seguros que posso usar para aumentar minha renda?"
          className="text-foreground placeholder:text-muted-foreground h-12 flex-1 bg-transparent px-3 text-sm outline-none"
          aria-label="Pergunte à IA sobre seu insight financeiro"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-2xl transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Enviar pergunta"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  )
}
