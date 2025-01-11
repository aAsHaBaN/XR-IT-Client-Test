import NodeError from "@/components/NodeError";
import { COLORS_MAP } from "@/core/Services/constants";
import { formatServiceName } from "@/core/Services/utils";
import Button from "@/components/Button";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Select from "@/components/Select";
import { useState } from "react";
import { addService, removeService } from "@/services/config";

function LabServiceNode({ machine }: { machine: IMachine }) {
  const [isAddingService, setIsAddingService] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const handleAddService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addService(machine.id, selectedService);
    setIsAddingService(false);
    setSelectedService("");
  };

  return (
    <div
      className={`border-b border-b-black p-2 last:border-b-0 ${
        !machine.isOnline ? "custom-node--offline" : ""
      }`}
      key={machine.ip}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="font-bold">{machine.name}</h3>
        <NodeError className="relative" errors={machine.errors} />
        <span className="text-xs">{machine.ip}</span>
      </div>
      <div className="flex gap-2">
        {machine.services.length === 0 ? (
          <p className="text-zinc-500">No services available</p>
        ) : (
          machine.services.map(({ software, errors, id }) => (
            <span
              key={id}
              className={`tag bg-${COLORS_MAP[software] ?? "base"}-primary text-${COLORS_MAP[software] ?? "base"}-text`}
            >
              {formatServiceName(software)}
              <NodeError className="relative" errors={errors} />
              <button
                className="rounded-full bg-red-600 p-1 text-white shadow-sm"
                onClick={() => removeService(machine.id, id)}
              >
                <XMarkIcon className="size-2 cursor-pointer" />
              </button>
            </span>
          ))
        )}
        {isAddingService ? (
          <form className="flex items-center gap-2" onSubmit={handleAddService}>
            <Select
              options={[
                { label: "Ultragrid Send", value: "ULTRAGRID_SEND" },
                {
                  label: "Ultragrid Receive",
                  value: "ULTRAGRID_RECEIVE",
                },
                { label: "Metaquest", value: "METAQUEST" },
                { label: "Optitrack", value: "OPTITRACK" },
                { label: "Unreal Engine", value: "UNREAL_ENGINE" },
                { label: "MVN", value: "MVN" },
              ]}
              value={selectedService}
              onChange={(value) => setSelectedService(value)}
            />
            <Button color="green" type="submit" square>
              <CheckIcon className="size-4" />
            </Button>
          </form>
        ) : (
          <Button
            color="secondary"
            onClick={() => setIsAddingService(true)}
            square
          >
            <PlusIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default LabServiceNode;
