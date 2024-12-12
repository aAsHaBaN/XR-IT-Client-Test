function Select({
  options,
  value,
  onChange,
  label,
  disabled = false,
}: {
  options:
    | { label: string; value: string }[]
    | { [key: string]: { label: string; value: string }[] };
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value);
  }

  return (
    <div className="pointer-events-auto flex flex-col gap-1">
      {label && <label className="text-sm text-gray-800">{label}</label>}
      <select
        onChange={handleChange}
        value={value}
        className="rounded-md border border-gray-300 p-1"
        disabled={disabled}
      >
        <option value="">Select an option</option>
        {Array.isArray(options)
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : Object.entries(options).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
      </select>
    </div>
  );
}

export default Select;
