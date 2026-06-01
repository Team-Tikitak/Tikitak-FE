import './styles/index.css';
import { RouterProvider } from 'react-router';
import { GlobalErrorBoundary } from '@/pages/error/GlobalErrorBoundary';
import { QueryProviders } from './providers/QueryProviders';
import { router } from './routes';

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryProviders>
        <RouterProvider router={router} />
      </QueryProviders>
    </GlobalErrorBoundary>
  );
}

export default App;
