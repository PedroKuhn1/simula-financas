import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAt } from '../test/render';

function resultValue(label: string) {
  return screen.getByText(label).nextElementSibling;
}

describe('CompoundPage', () => {
  it('calcula com os valores padrão ao abrir', () => {
    renderAt('/juros-compostos');
    expect(resultValue('Total investido')).toHaveTextContent(/R\$\s37\.000,00/);
    expect(screen.getAllByRole('row')).toHaveLength(11); // cabeçalho + 10 anos
  });

  it('recalcula quando o usuário altera os campos', async () => {
    const { user } = renderAt('/juros-compostos');
    await user.clear(screen.getByLabelText('Rentabilidade anual'));
    await user.type(screen.getByLabelText('Rentabilidade anual'), '0');
    await user.clear(screen.getByLabelText('Período'));
    await user.type(screen.getByLabelText('Período'), '1');
    expect(resultValue('Valor final')).toHaveTextContent(/R\$\s4\.600,00/);
    expect(resultValue('Juros ganhos')).toHaveTextContent(/R\$\s0,00/);
  });

  it('mostra erro para valor inválido', async () => {
    const { user } = renderAt('/juros-compostos');
    await user.clear(screen.getByLabelText('Valor inicial'));
    await user.type(screen.getByLabelText('Valor inicial'), 'abc');
    expect(screen.getByRole('alert')).toHaveTextContent('O valor inicial deve ser um número');
    expect(screen.queryByText('Valor final')).not.toBeInTheDocument();
  });

  it('mostra erro para período fora do limite', async () => {
    const { user } = renderAt('/juros-compostos');
    await user.clear(screen.getByLabelText('Período'));
    await user.type(screen.getByLabelText('Período'), '100');
    expect(screen.getByRole('alert')).toHaveTextContent(/prazo deve ser/i);
  });
});
