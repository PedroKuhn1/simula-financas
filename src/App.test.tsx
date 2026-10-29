import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { renderAt } from './test/render';

describe('navegação', () => {
  it('a home lista os três simuladores e espaços publicitários', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /decisões financeiras/i })).toBeInTheDocument();
    const tools = screen.getByRole('region', { name: 'Simuladores disponíveis' });
    expect(tools.querySelectorAll('a.tool-card')).toHaveLength(3);
    expect(screen.getAllByTestId('ad-slot').length).toBeGreaterThanOrEqual(2);
  });

  it('navega da home para um simulador', async () => {
    const { user } = renderAt('/');
    await user.click(screen.getByRole('link', { name: /financiamento sac e price/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'Simulador de financiamento' })).toBeInTheDocument();
  });

  it('marca o link ativo no menu', () => {
    renderAt('/juros-compostos');
    const nav = screen.getByRole('navigation', { name: 'Simuladores' });
    expect(nav.querySelector('a.active')).toHaveTextContent('Juros compostos');
  });

  it('mostra página de não encontrado para rota inexistente', () => {
    renderAt('/rota-que-nao-existe');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar para o início/i })).toHaveAttribute('href', '/');
  });

  it('exibe a versão da aplicação no rodapé', () => {
    renderAt('/');
    expect(screen.getByText(/^v\d+\.\d+\.\d+$/)).toBeInTheDocument();
  });

  it('a aplicação completa renderiza com o HashRouter', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'SimulaFinanças' })).toBeInTheDocument();
  });
});
