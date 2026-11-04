import { useMemo, useState } from 'react';
import { NumberField } from '../components/NumberField';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoanResults } from '../components/LoanResults';
import { amortize, parseDecimal, type AmortizationSystem, type LoanResult } from '../lib/finance';

export function LoanPage() {
  const [principal, setPrincipal] = useState('200000');
  const [rate, setRate] = useState('11');
  const [months, setMonths] = useState('360');
  const [system, setSystem] = useState<AmortizationSystem>('sac');

  const outcome = useMemo((): { sac: LoanResult; price: LoanResult } | { error: string } => {
    try {
      const base = {
        principal: parseDecimal(principal),
        annualRatePct: parseDecimal(rate),
        months: parseDecimal(months),
      };
      return { sac: amortize({ ...base, system: 'sac' }), price: amortize({ ...base, system: 'price' }) };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [principal, rate, months]);

  return (
    <section className="panel">
      <h1>Simulador de financiamento</h1>
      <p className="lead">
        No <abbr title="Sistema de Amortização Constante">SAC</abbr> as parcelas começam maiores e diminuem; na tabela
        Price elas são fixas.
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
        <LoanResults sac={outcome.sac} price={outcome.price} system={system} />
      )}
    </section>
  );
}
