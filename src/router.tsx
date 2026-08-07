import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from './components/layout/rootLayout'

export const router = createBrowserRouter([
  {
    errorElement: (
      <h1>
        Pagina inexistente
        <a href="/"> Redirecionar</a>
      </h1>
    ),
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <>
            <h1 className="font-bold text-blue-500">Formulario de Simulação</h1>
          </>
        ),
      },
      {
        path: '/resultado',
        element: <h1>resultado de Simulação</h1>,
      },
      {
        path: '/historico',
        element: <h1>historico de Simulação</h1>,
      },
    ],
  },
])
