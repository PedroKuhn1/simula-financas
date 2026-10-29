import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAt } from '../test/render';

function resultValue(label: string) {
  return screen.getByText(label).nextElementSibling;
}

async function setField(user: ReturnType<typeof renderAt>['user'], label: string, value: string) {
  await user.clear(screen.getByLabelText(label));
  await user.type(screen.getByLabelText(label), value);
}

describe('LoanPage', () => {
  it('usa SAC por padrão e compara com a Price', () => {
    renderAt('/financiamento');
    expect(screen.getByLabelText('SAC')).toBeChecked();
    expect(screen.getByTestId('comparison')).toHaveTextContent(/O SAC economiza R\$/);
    expect(screen.getByRole('table', { name: /SAC/ })).toBeInTheDocument();
  });

  it('troca para Price e mostra parcelas fixas', async () => {
    const { user } = renderAt('/financiamento');
    await setField(user, 'Valor financiado', '1200');
    await setField(user, 'Taxa de juros', '0');
    await setField(user, 'Prazo', '12');
    await user.click(screen.getByLabelText('Price'));
    expect(screen.getByRole('table', { name: /Price/ })).toBeInTheDocument();
    expect(resultValue('Primeira parcela')).toHaveTextContent(/R\$\s100,00/);
    expect(resultValue('Última parcela')).toHaveTextContent(/R\$\s100,00/);
  });

  it('mostra só as 12 primeiras parcelas até o usuário pedir todas', async () => {
    const { user } = renderAt('/financiamento');
    expect(screen.getAllByRole('row')).toHaveLength(13);
    await user.click(screen.getByRole('button', { name: 'Mostrar todas as 360 parcelas' }));
    expect(screen.getAllByRole('row')).toHaveLength(361);
    await user.click(screen.getByRole('button', { name: 'Mostrar menos' }));
    expect(screen.getAllByRole('row')).toHaveLength(13);
  });

  it('não mostra o botão quando o prazo cabe na prévia', async () => {
    const { user } = renderAt('/financiamento');
    await setField(user, 'Prazo', '6');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('indica empate quando não há juros', async () => {
    const { user } = renderAt('/financiamento');
    await setField(user, 'Taxa de juros', '0');
    expect(screen.getByTestId('comparison')).toHaveTextContent(/economiza R\$\s0,00/);
  });

  it('mostra erro para valor financiado zero', async () => {
    const { user } = renderAt('/financiamento');
    await setField(user, 'Valor financiado', '0');
    expect(screen.getByRole('alert')).toHaveTextContent('maior que zero');
  });
});
