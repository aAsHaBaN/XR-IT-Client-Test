import {
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import Alert from "./Alert";
import { useState } from "react";

function GlobalErrors({ errors }: { errors: IError[] }) {
  const [showErrors, setShowErrors] = useState(false);

  const toggleErrors = () => setShowErrors((prev) => !prev);

  if (errors.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        className="text-md flex w-fit items-center gap-2 rounded-full bg-red-700 px-3 py-2 font-semibold text-white shadow-xl shadow-slate-900/40"
        onClick={toggleErrors}
      >
        <ExclamationTriangleIcon className="size-6" />
        Errors
        <ChevronDownIcon
          className={`size-5 transition-all duration-300 ${showErrors ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        className={`flex flex-col gap-2 ${showErrors ? "visible" : "invisible h-0"} transition-all duration-200`}
      >
        {errors.length > 0 &&
          errors.map((error, index) => (
            <Alert key={index + "-error"} type="error" withButton={false}>
              <span>{error.message}</span>
            </Alert>
          ))}
      </div>
    </div>
  );
}

export default GlobalErrors;
