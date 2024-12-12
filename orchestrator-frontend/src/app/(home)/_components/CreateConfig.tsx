import Button from "@/components/Button";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

function CreateConfig({
  onConfigurationCreation,
}: {
  onConfigurationCreation: (
    formData: FormData,
    configuration: any,
  ) => Promise<IConfiguration | { status: "error"; message: string }>;
}) {
  const configurationCreationForm = useRef<HTMLFormElement>(null);

  async function handleConfigurationCreation(formData: FormData) {
    try {
      const configurationName = formData.get("configurationName") as string;
      const configuration = {
        configuration_name: configurationName,
        vpn: {
          public_ip: "",
          local_ip: "",
          virtual_hubs: [],
          client_hub_name: "",
          user: {
            name: "",
            pw: "",
          },
        },
        labs: [],
        nodes: [],
        streams: [],
        pending_streams: [],
      };
      const response = await onConfigurationCreation(formData, configuration);
      configurationCreationForm.current?.reset();
      if ("status" in response && response.status === "error") {
        alert(response.message);
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to import configuration.");
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-700 bg-white">
      <h3 className="w-full rounded-t-sm bg-orchestrator py-2 text-center text-lg font-bold text-white">
        Create a new configuration
      </h3>
      <form
        ref={configurationCreationForm}
        action={handleConfigurationCreation}
        className="flex flex-col gap-2 p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="configurationName" className="text-sm font-bold">
            Configuration name
          </label>
          <input
            type="text"
            id="configurationName"
            name="configurationName"
            className="rounded-md border border-gray-700 px-2 py-1"
          />
        </div>
        <Button type="submit" color="secondary">
          <PlusCircleIcon className="size-5" />
          Create
        </Button>
      </form>
    </div>
  );
}

export default CreateConfig;
