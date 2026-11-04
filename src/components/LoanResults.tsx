import { formatBRL, type AmortizationSystem, type LoanResult } from '../lib/finance';
import { AmortizationTable } from './AmortizationTable';
import { ResultCard } from './ResultCard';

interface LoanResultsProps {
  sac: LoanResult;
  price: LoanResult;
  system: AmortizationSystem;
}

function compareSystems(sac: LoanResult, price: LoanResult): string {
  const difference = formatBRL(Math.abs(price.totalInterest - sac.totalInterest));
  return sac.totalInterest <= price.totalInterest
    ? `O SAC economiza ${difference} em juros em relação à Price.`
    : `A Price economiza ${difference} em juros em relação ao SAC.`;
}

export function LoanResults({ sac, price, system }: Readonly<LoanResultsProps>) {
  const selected = system === 'sac' ? sac : price;
  return (
    <>
      <div className="results" aria-live="polite">
        <ResultCard label="Primeira parcela" value={formatBRL(selected.firstPayment)} highlight />
        <ResultCard label="Última parcela" value={formatBRL(selected.lastPayment)} />
        <ResultCard label="Total de juros" value={formatBRL(selected.totalInterest)} />
        <ResultCard label="Total pago" value={formatBRL(selected.totalPaid)} />
      </div>
      <p className="comparison" data-testid="comparison">
        {compareSystems(sac, price)}
      </p>
      {/* key: ao trocar de sistema a tabela volta para a prévia de 12 parcelas */}
      <AmortizationTable key={system} loan={selected} system={system} />
    </>
  );
}
