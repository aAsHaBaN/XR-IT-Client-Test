import "./Button.css";

function Button({
  color,
  children,
  className,
  square = false,
  ...props
}: {
  color: string;
  children: React.ReactNode;
  className?: string;
  square?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      className={`button button--${color} ${square ? "button--square" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
