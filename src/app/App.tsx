import './styles/index.css';
import { RouterProvider } from 'react-router';
import { GlobalErrorBoundary } from '@/pages/error/GlobalErrorBoundary';
import { PostHogConsentSync } from './PostHogConsentSync';
import { QueryProviders } from './providers/QueryProviders';
import { router } from './routes';

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryProviders>
        <PostHogConsentSync />
        <RouterProvider router={router} />
      </QueryProviders>
    </GlobalErrorBoundary>
  );
}

export default App;
