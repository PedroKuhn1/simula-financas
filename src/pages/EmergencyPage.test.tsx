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

describe('EmergencyPage', () => {
  it('calcula a meta para CLT com os valores padrão', () => {
    renderAt('/reserva-de-emergencia');
    expect(resultValue('Meta da reserva')).toHaveTextContent(/R\$\s21\.000,00/);
    expect(resultValue('Falta guardar')).toHaveTextContent(/R\$\s16\.000,00/);
    expect(resultValue('Tempo até a meta')).toHaveTextContent('1 ano e 8 meses');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '23.81');
  });

  it('ajusta a meta ao trocar o tipo de renda', async () => {
    const { user } = renderAt('/reserva-de-emergencia');
    await user.selectOptions(screen.getByLabelText('Tipo de renda'), 'autonomo');
    expect(screen.getByText('12 meses')).toBeInTheDocument();
    expect(resultValue('Meta da reserva')).toHaveTextContent(/R\$\s42\.000,00/);
  });

  // Autônomo com gasto de R$ 1.000 e nada guardado: meta e valor faltante de R$ 12.000.
  it.each([
    ['12000', '1 mês'],
    ['4000', '3 meses'],
    ['1000', '1 ano'],
    ['925', '1 ano e 1 mês'],
    ['480', '2 anos e 1 mês'],
  ])('poupando R$ %s por mês, leva %s', async (monthly, expected) => {
    const { user } = renderAt('/reserva-de-emergencia');
    await setField(user, 'Gasto mensal', '1000');
    await user.selectOptions(screen.getByLabelText('Tipo de renda'), 'autonomo');
    await setField(user, 'Já tenho guardado', '0');
    await setField(user, 'Consigo poupar por mês', monthly);
    expect(resultValue('Tempo até a meta')).toHaveTextContent(new RegExp(`^${expected}$`));
  });

  it('mostra meta atingida quando já há reserva suficiente', async () => {
    const { user } = renderAt('/reserva-de-emergencia');
    await setField(user, 'Já tenho guardado', '50000');
    expect(resultValue('Tempo até a meta')).toHaveTextContent('Meta atingida!');
  });

  it('pede um valor mensal quando nada é poupado', async () => {
    const { user } = renderAt('/reserva-de-emergencia');
    await setField(user, 'Consigo poupar por mês', '0');
    expect(resultValue('Tempo até a meta')).toHaveTextContent('Defina um valor mensal para poupar');
  });

  it('mostra erro para gasto inválido', async () => {
    const { user } = renderAt('/reserva-de-emergencia');
    await setField(user, 'Gasto mensal', '-10');
    expect(screen.getByRole('alert')).toHaveTextContent('O gasto mensal deve ser');
  });
});
