import { useEffect } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppRouter } from '@/routes';
import { Toast } from '@/components/common/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SearchModalWrapper } from '@/components/search/SearchModalWrapper';
import { usePanelStore } from '@/store/usePanelStore';

function App() {
  const { searchOpen, toggleSearch } = usePanelStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
          <Toast />
          <SearchModalWrapper isOpen={searchOpen} onClose={() => toggleSearch()} />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
