import { NavLink, Outlet } from 'react-router-dom';
import { AdSlot } from './AdSlot';

const links = [
  { to: '/juros-compostos', label: 'Juros compostos' },
  { to: '/financiamento', label: 'Financiamento' },
  { to: '/reserva-de-emergencia', label: 'Reserva de emergência' },
];

export function Layout() {
  return (
    <div className="app">
      <header className="header">
        <NavLink to="/" className="brand">
          SimulaFinanças
        </NavLink>
        <nav aria-label="Simuladores">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <AdSlot format="banner" />
      <footer className="footer">
        <p>
          Simulações com fins educativos. Os resultados são estimativas e não constituem recomendação de
          investimento.
        </p>
        <p className="version">v{__APP_VERSION__}</p>
      </footer>
    </div>
  );
}
