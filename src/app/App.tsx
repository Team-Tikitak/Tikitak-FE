import './styles/index.css';
import { RouterProvider } from 'react-router';
import { QueryProviders } from './providers/QueryProviders';
import { router } from './routes';

function App() {
  return (
    <QueryProviders>
      <RouterProvider router={router} />
    </QueryProviders>
  );
}

export default App;
