import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CompoundPage } from './pages/CompoundPage';
import { LoanPage } from './pages/LoanPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { NotFound } from './pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="juros-compostos" element={<CompoundPage />} />
        <Route path="financiamento" element={<LoanPage />} />
        <Route path="reserva-de-emergencia" element={<EmergencyPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// HashRouter evita 404 ao recarregar rotas internas em hospedagem estática (GitHub Pages).
export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
