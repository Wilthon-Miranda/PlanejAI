import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './components/layout/rootLayout'
import { SimulationFormPage } from './pages/SimulationFormPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <SimulationFormPage />,
      },
      {
        path: '/resultado',
        element: <SimulationFormPage />,
      },
      {
        path: '/historico',
        element: <h1>historico de Simulação</h1>,
      },
      {
        path: '*',
        element: <h1>404 Pagina Inexistente</h1>,
      },
    ],
  },
])
