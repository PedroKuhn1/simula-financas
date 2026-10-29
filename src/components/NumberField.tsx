interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

export function NumberField({ id, label, value, onChange, prefix, suffix, hint }: NumberFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-input">
        {prefix && <span className="affix">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </div>
      {hint && (
        <small id={hintId} className="hint">
          {hint}
        </small>
      )}
    </div>
  );
}
