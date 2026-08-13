import { ExternalLink, Goal, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { Divider } from '@/components/shared/Divider'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { parseCurrency } from '@/utils/currency'

interface HistoricProps {
  record: SimulationRecord
}

const statusStyles = {
  viable: 'text-green-600 bg-green-100',
  needs_adjustment: 'text-yellow-600 bg-yellow-100',
  unfeasible: 'text-red-600 bg-red-100',
}

export function Historic({ record }: HistoricProps) {
  const status = record.insight?.feasibility.status
    ? (statusStyles[record.insight.feasibility.status] ?? null)
    : null

  const { deleteSimulation } = useSimulationStorage()

  const navigate = useNavigate()
  const handleDeletButton = (id: string) => {
    deleteSimulation(id)
    window.location.reload()
  }

  const handleViewButton = (id: string) => {
    navigate(`/resultado/${id}`)
  }

  return (
    <div className="bg-card text-foreground flex w-full flex-col gap-6 rounded-3xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:justify-between">
      <section className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <Goal size={52} className={['rounded-2xl p-2.5', status].join(' ')} />
      </section>
      <section className="flex flex-col items-start gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-1">
          <span className="text-foreground text-lg font-bold">
            {record.goalName}
          </span>
          <span className="text-sm font-medium text-slate-400">
            {record.dataAtual}
          </span>
        </div>
      </section>

      <section className="flex flex-1 flex-col gap-5 md:flex-row md:items-center md:justify-between md:px-8 xl:justify-evenly">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Custo da meta
          </span>
          <span className="text-foreground text-base font-bold">
            {parseCurrency(record.goalAmount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Prazo
          </span>
          <span className="text-foreground text-base font-bold">
            {record.goalDeadline} meses
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Economia mensal
          </span>
          <span className="text-foreground text-base font-bold">
            {(
              parseCurrency(record.income) -
              parseCurrency(record.expenses) -
              parseCurrency(record.debts)
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      </section>

      <div className="w-full md:hidden">
        <Divider orientation="horizontal" />
      </div>

      <section className="flex w-full flex-row items-center justify-evenly gap-4 md:w-auto md:justify-end">
        <div className="hidden h-10 md:block">
          <Divider orientation="vertical" />
        </div>

        <Button
          variant="ghost"
          icon={Trash2}
          className="text-red-500 hover:bg-red-50"
          onClick={() => handleDeletButton(record.id)}
        />

        <div className="h-8 md:hidden">
          <Divider orientation="vertical" />
        </div>

        <Button
          variant="ghost"
          icon={ExternalLink}
          className="bg-background font-medium"
          onClick={() => handleViewButton(record.id)}
        >
          Ver detalhes
        </Button>
      </section>
    </div>
  )
}
