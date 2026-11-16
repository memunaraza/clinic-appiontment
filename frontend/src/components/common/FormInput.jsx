const FormInput = ({
  label,
  id,
  error,
  icon: Icon,
  trailing,
  as = "input",
  className = "",
  ...props
}) => {
  const Control = as;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-ink">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <Control
          id={id}
          className={`field-control ${Icon ? "pl-10" : ""} ${trailing ? "pr-12" : ""} ${error ? "border-danger focus:border-danger focus:ring-danger/10" : ""} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <p id={`${id}-error`} className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
};

export default FormInput;
