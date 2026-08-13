import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './components/layout/rootLayout'
import { SimulationFormPage } from './pages/SimulationFormPage'
import { SimulationHistoricPage } from './pages/SimulationHistoticPage'
import { SimulationResultsPage } from './pages/SimulationResultsPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <SimulationFormPage />,
      },
      {
        path: '/resultado/:id',
        element: <SimulationResultsPage />,
      },
      {
        path: '/historico',
        element: <SimulationHistoricPage />,
      },
      {
        path: '*',
        element: <h1>404 Pagina Inexistente</h1>,
      },
    ],
  },
])
