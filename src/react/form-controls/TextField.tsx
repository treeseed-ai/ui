import type { ChangeEvent } from "react";

type TextFieldProps = {
  id: string;
  label: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  multiline?: boolean;
  onChange?: (value: string) => void;
  error?: string;
};

export function TextField({
  id,
  label,
  value,
  defaultValue,
  placeholder,
  multiline = false,
  onChange,
  error
}: TextFieldProps) {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange?.(event.target.value);
  };

  const sharedProps = {
    id,
    value,
    defaultValue,
    placeholder,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    onChange: handleChange
  };

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea className="control textarea-control" {...sharedProps} />
      ) : (
        <input className="control" type="text" {...sharedProps} />
      )}
      {error ? (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
