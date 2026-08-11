import { SimulationForm } from '@/components/Features/Simulation/Form'
import { SimulationHero } from '@/components/Features/Simulation/Hero'

export function SimulationFormPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <SimulationHero />
      <SimulationForm />
    </main>
  )
}
