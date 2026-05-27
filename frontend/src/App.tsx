import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppRouter } from '@/routes';
import { Toast } from '@/components/common/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
          <Toast />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
