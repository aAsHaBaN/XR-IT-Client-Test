import { CheckIcon, InboxArrowDownIcon } from "@heroicons/react/24/solid";
import Button from "./Button";
import { useState } from "react";
import { saveConfiguration } from "@/services/config";

function SaveButton() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveConfiguration(() => {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    });
  }

  return (
    <Button color="secondary" onClick={handleSave}>
      {saved ? (
        <>
          <CheckIcon className="size-4" />
          <span className="text-green-500">Saved!</span>
        </>
      ) : (
        <>
          <InboxArrowDownIcon className="size-4" />
          <span>Save</span>
        </>
      )}
    </Button>
  );
}

export default SaveButton;
