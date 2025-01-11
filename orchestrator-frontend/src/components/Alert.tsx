import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Alert({
  withButton = true,
  onClose,
  type,
  children,
}: {
  withButton?: boolean;
  onClose?: () => void;
  type?: "error" | "warning" | "info";
  children: React.ReactNode;
}) {
  let color = "";
  let textColor = "white";

  switch (type) {
    case "error":
      color = "bg-red-700";
      break;
    case "warning":
      textColor = "black";
      color = "bg-orange-400";
      break;
    case "info":
      color = "bg-blue-500";
      break;
    default:
      color = "bg-gray-500";
  }

  let Icon = ExclamationTriangleIcon;
  switch (type) {
    case "error":
      Icon = ExclamationTriangleIcon;
      break;
    case "warning":
      Icon = InformationCircleIcon;
      break;
    default:
      Icon = ExclamationTriangleIcon;
  }

  return (
    <div
      role="alert"
      className={`relative flex w-full items-center rounded-md text-left ${color} gap-2 p-3 text-sm text-${textColor} shadow-xl shadow-slate-900/40`}
    >
      <Icon className="h-5 w-5" />
      <span
        className={`flex-1 whitespace-pre-wrap ${withButton ? "mr-6" : ""}`}
      >
        {children}
      </span>
      {withButton && (
        <button
          onClick={onClose}
          className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-md text-${textColor} transition-all hover:bg-white/10 active:bg-white/10`}
          type="button"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default Alert;
