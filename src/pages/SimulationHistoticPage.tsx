import { Historic } from '@/components/Features/SimulationHistoric/Historic'
import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

export function SimulationHistoricPage() {
  const { getAllData } = useSimulationStorage()

  const data: SimulationRecord[] = getAllData() ?? []

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:py-14">
      <PageHero
        title="Historico de simulações"
        subtitle={`Numero total de simulações: ${data ? data.length : 0}`}
      />
      {data && data.map((e) => <Historic key={e.id} record={e} />)}
    </main>
  )
}
