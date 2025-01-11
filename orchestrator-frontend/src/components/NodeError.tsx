import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import Alert from "./Alert";
import "./NodeError.css";
import { useState } from "react";
import { createPortal } from "react-dom";

function NodeError({
  errors,
  className = "",
}: {
  errors?: IError[];
  className?: string;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const viewportElement = document.getElementById("errors-container");

  if (!errors || errors.length === 0) return null;

  return (
    <div className={`errors-icon size-7 ${className}`}>
      <ExclamationTriangleIcon
        className="size-full rounded-full bg-white p-1 text-red-700"
        onMouseEnter={() => setShowErrors(true)}
        onMouseLeave={() => setShowErrors(false)}
      />
      {createPortal(
        <div className={`errors-alert ${showErrors ? "flex" : "hidden"}`}>
          {errors?.map((error) => (
            <Alert key={error.message} type="error" withButton={false}>
              <p>
                <b>Error {error.code}</b>
                <br />
                {error.message}
              </p>
            </Alert>
          ))}
        </div>,
        viewportElement!,
      )}
    </div>
  );
}

export default NodeError;
