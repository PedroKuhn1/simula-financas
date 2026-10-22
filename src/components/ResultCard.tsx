interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function ResultCard({ label, value, highlight = false }: ResultCardProps) {
  return (
    <div className={highlight ? 'result-card highlight' : 'result-card'}>
      <span className="result-label">{label}</span>
      <strong className="result-value">{value}</strong>
    </div>
  );
}
