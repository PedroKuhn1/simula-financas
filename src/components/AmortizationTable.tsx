import { useState } from 'react';
import { formatBRL, type AmortizationSystem, type LoanResult } from '../lib/finance';

const PREVIEW_ROWS = 12;

interface AmortizationTableProps {
  loan: LoanResult;
  system: AmortizationSystem;
}

export function AmortizationTable({ loan, system }: Readonly<AmortizationTableProps>) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? loan.rows : loan.rows.slice(0, PREVIEW_ROWS);
  const toggleLabel = showAll ? 'Mostrar menos' : `Mostrar todas as ${loan.rows.length} parcelas`;

  return (
    <>
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
      {loan.rows.length > PREVIEW_ROWS && (
        <button type="button" className="button-secondary" onClick={() => setShowAll((value) => !value)}>
          {toggleLabel}
        </button>
      )}
    </>
  );
}
