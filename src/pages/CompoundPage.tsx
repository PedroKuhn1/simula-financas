import { useMemo, useState } from 'react';
import { NumberField } from '../components/NumberField';
import { ResultCard } from '../components/ResultCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { compoundInterest, formatBRL, parseDecimal, type CompoundResult } from '../lib/finance';

export function CompoundPage() {
  const [initial, setInitial] = useState('1000');
  const [monthly, setMonthly] = useState('300');
  const [rate, setRate] = useState('10,5');
  const [years, setYears] = useState('10');

  const outcome = useMemo((): { result: CompoundResult } | { error: string } => {
    try {
      const yearsNumber = parseDecimal(years);
      return {
        result: compoundInterest({
          initial: parseDecimal(initial),
          monthlyContribution: parseDecimal(monthly),
          annualRatePct: parseDecimal(rate),
          months: Math.round(yearsNumber * 12),
        }),
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [initial, monthly, rate, years]);

  return (
    <section className="panel">
      <h1>Simulador de juros compostos</h1>
      <p className="lead">Veja o efeito dos juros sobre juros em um investimento com aportes mensais.</p>
      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <NumberField id="initial" label="Valor inicial" prefix="R$" value={initial} onChange={setInitial} />
        <NumberField id="monthly" label="Aporte mensal" prefix="R$" value={monthly} onChange={setMonthly} />
        <NumberField
          id="rate"
          label="Rentabilidade anual"
          suffix="% a.a."
          value={rate}
          onChange={setRate}
          hint="Ex.: CDI de 10,5% ao ano"
        />
        <NumberField id="years" label="Período" suffix="anos" value={years} onChange={setYears} />
      </form>

      {'error' in outcome ? (
        <ErrorMessage message={outcome.error} />
      ) : (
        <>
          <div className="results" aria-live="polite">
            <ResultCard label="Valor final" value={formatBRL(outcome.result.finalBalance)} highlight />
            <ResultCard label="Total investido" value={formatBRL(outcome.result.totalInvested)} />
            <ResultCard label="Juros ganhos" value={formatBRL(outcome.result.totalInterest)} />
          </div>
          <table className="table">
            <caption>Evolução ano a ano</caption>
            <thead>
              <tr>
                <th scope="col">Ano</th>
                <th scope="col">Investido</th>
                <th scope="col">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {outcome.result.timeline
                .filter((point) => point.month > 0 && point.month % 12 === 0)
                .map((point) => (
                  <tr key={point.month}>
                    <td>{point.month / 12}</td>
                    <td>{formatBRL(point.invested)}</td>
                    <td>{formatBRL(point.balance)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
