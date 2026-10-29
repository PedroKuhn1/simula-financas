import { useMemo, useState } from 'react';
import { NumberField } from '../components/NumberField';
import { ResultCard } from '../components/ResultCard';
import { ErrorMessage } from '../components/ErrorMessage';
import { emergencyFund, formatBRL, parseDecimal, type EmergencyResult, type JobType } from '../lib/finance';

const jobOptions: { value: JobType; label: string }[] = [
  { value: 'publico', label: 'Servidor público' },
  { value: 'clt', label: 'CLT' },
  { value: 'autonomo', label: 'Autônomo / empresário' },
];

function describeTime(months: number | null): string {
  if (months === null) return 'Defina um valor mensal para poupar';
  if (months === 0) return 'Meta atingida!';
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearText = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return rest === 0 ? yearText : `${yearText} e ${rest} ${rest === 1 ? 'mês' : 'meses'}`;
}

export function EmergencyPage() {
  const [expenses, setExpenses] = useState('3500');
  const [jobType, setJobType] = useState<JobType>('clt');
  const [savings, setSavings] = useState('5000');
  const [monthlySaving, setMonthlySaving] = useState('800');

  const outcome = useMemo((): { result: EmergencyResult } | { error: string } => {
    try {
      return {
        result: emergencyFund({
          monthlyExpenses: parseDecimal(expenses),
          jobType,
          currentSavings: parseDecimal(savings),
          monthlySaving: parseDecimal(monthlySaving),
        }),
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [expenses, jobType, savings, monthlySaving]);

  return (
    <section className="panel">
      <h1>Reserva de emergência</h1>
      <p className="lead">Quanto mais instável a renda, maior deve ser a reserva para imprevistos.</p>
      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <NumberField id="expenses" label="Gasto mensal" prefix="R$" value={expenses} onChange={setExpenses} />
        <div className="field">
          <label htmlFor="job-type">Tipo de renda</label>
          <select id="job-type" value={jobType} onChange={(event) => setJobType(event.target.value as JobType)}>
            {jobOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <NumberField id="savings" label="Já tenho guardado" prefix="R$" value={savings} onChange={setSavings} />
        <NumberField
          id="monthly-saving"
          label="Consigo poupar por mês"
          prefix="R$"
          value={monthlySaving}
          onChange={setMonthlySaving}
        />
      </form>

      {'error' in outcome ? (
        <ErrorMessage message={outcome.error} />
      ) : (
        <>
          <div className="results" aria-live="polite">
            <ResultCard label="Meta da reserva" value={formatBRL(outcome.result.target)} highlight />
            <ResultCard label="Falta guardar" value={formatBRL(outcome.result.missing)} />
            <ResultCard label="Tempo até a meta" value={describeTime(outcome.result.monthsToReach)} />
          </div>
          <p>
            Recomendação: <strong>{outcome.result.recommendedMonths} meses</strong> de despesas.
          </p>
          <div
            className="progress"
            role="progressbar"
            aria-label="Progresso da reserva"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={outcome.result.progressPct}
          >
            <div className="progress-bar" style={{ width: `${outcome.result.progressPct}%` }} />
          </div>
          <p className="hint">{outcome.result.progressPct.toLocaleString('pt-BR')}% da meta</p>
        </>
      )}
    </section>
  );
}
