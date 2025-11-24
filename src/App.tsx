import React, { useEffect } from 'react';
import { useQMSStore, useBranchStore, useCategoryStore } from './stores';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  const { initialize: initQMS } = useQMSStore();
  const { fetchBranches } = useBranchStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    initQMS();
    fetchBranches();
    fetchCategories();
  }, []);

  return (
    <AppRoutes />
  );
};

export default App;
