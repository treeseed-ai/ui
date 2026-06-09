import type { ChangeEvent } from "react";

type CheckboxFieldProps = {
  id: string;
  label: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function CheckboxField({
  id,
  label,
  name,
  checked,
  defaultChecked,
  onChange
}: CheckboxFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <label className="checkbox-field" htmlFor={id}>
      <input
        checked={checked}
        className="checkbox-control"
        defaultChecked={defaultChecked}
        id={id}
        name={name}
        onChange={handleChange}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}
