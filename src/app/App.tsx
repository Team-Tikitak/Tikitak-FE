import './styles/index.css';
import { LoginPage } from '@/pages/login';
import { QueryProviders } from './providers/QueryProviders';

function App() {
  return (
    <QueryProviders>
      <LoginPage />
    </QueryProviders>
  );
}

export default App;
