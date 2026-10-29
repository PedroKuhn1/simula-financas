import { useMemo, useState } from 'react';
import { NumberField } from '../components/NumberField';
import { ResultCard } from '../components/ResultCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { amortize, formatBRL, parseDecimal, type AmortizationSystem, type LoanResult } from '../lib/finance';

const PREVIEW_ROWS = 12;

export function LoanPage() {
  const [principal, setPrincipal] = useState('200000');
  const [rate, setRate] = useState('11');
  const [months, setMonths] = useState('360');
  const [system, setSystem] = useState<AmortizationSystem>('sac');
  const [showAll, setShowAll] = useState(false);

  const outcome = useMemo((): { sac: LoanResult; price: LoanResult } | { error: string } => {
    try {
      const base = { principal: parseDecimal(principal), annualRatePct: parseDecimal(rate), months: parseDecimal(months) };
      return { sac: amortize({ ...base, system: 'sac' }), price: amortize({ ...base, system: 'price' }) };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [principal, rate, months]);

  const selected = 'error' in outcome ? null : outcome[system];
  const rows = selected ? (showAll ? selected.rows : selected.rows.slice(0, PREVIEW_ROWS)) : [];

  return (
    <section className="panel">
      <h1>Simulador de financiamento</h1>
      <p className="lead">
        No <abbr title="Sistema de Amortização Constante">SAC</abbr> as parcelas começam maiores e diminuem; na
        tabela Price elas são fixas.
      </p>
      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <NumberField id="principal" label="Valor financiado" prefix="R$" value={principal} onChange={setPrincipal} />
        <NumberField id="loan-rate" label="Taxa de juros" suffix="% a.a." value={rate} onChange={setRate} />
        <NumberField id="months" label="Prazo" suffix="meses" value={months} onChange={setMonths} />
        <fieldset className="field">
          <legend>Sistema de amortização</legend>
          <div className="segmented">
            {(['sac', 'price'] as const).map((option) => (
              <label key={option} className={system === option ? 'active' : undefined}>
                <input
                  type="radio"
                  name="system"
                  value={option}
                  checked={system === option}
                  onChange={() => setSystem(option)}
                />
                {option === 'sac' ? 'SAC' : 'Price'}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      {'error' in outcome ? (
        <ErrorMessage message={outcome.error} />
      ) : (
        <>
          <div className="results" aria-live="polite">
            <ResultCard label="Primeira parcela" value={formatBRL(selected!.firstPayment)} highlight />
            <ResultCard label="Última parcela" value={formatBRL(selected!.lastPayment)} />
            <ResultCard label="Total de juros" value={formatBRL(selected!.totalInterest)} />
            <ResultCard label="Total pago" value={formatBRL(selected!.totalPaid)} />
          </div>
          <p className="comparison" data-testid="comparison">
            {outcome.sac.totalInterest <= outcome.price.totalInterest
              ? `O SAC economiza ${formatBRL(outcome.price.totalInterest - outcome.sac.totalInterest)} em juros em relação à Price.`
              : `A Price economiza ${formatBRL(outcome.sac.totalInterest - outcome.price.totalInterest)} em juros em relação ao SAC.`}
          </p>
          <table className="table">
            <caption>Tabela de amortização ({system === 'sac' ? 'SAC' : 'Price'})</caption>
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col">Parcela</th>
                <th scope="col">Juros</th>
                <th scope="col">Amortização</th>
                <th scope="col">Saldo devedor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatBRL(row.payment)}</td>
                  <td>{formatBRL(row.interest)}</td>
                  <td>{formatBRL(row.amortization)}</td>
                  <td>{formatBRL(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {selected!.rows.length > PREVIEW_ROWS && (
            <button type="button" className="button-secondary" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Mostrar menos' : `Mostrar todas as ${selected!.rows.length} parcelas`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
