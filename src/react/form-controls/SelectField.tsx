import type { ChangeEvent } from "react";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  error?: string;
};

export function SelectField({
  id,
  label,
  name,
  value,
  defaultValue,
  options,
  onChange,
  error
}: SelectFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <select
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="control"
        defaultValue={defaultValue}
        id={id}
        name={name}
        onChange={handleChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
