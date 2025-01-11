import { revalidatePath } from "next/cache";
import Home from "./_components/Home";

const baseUrl = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost:8080";
const apiUrl = `${baseUrl}/configurations`;

async function HomePage() {
  let data;
  try {
    data = await fetch(apiUrl);
  } catch (error) {
    console.error("Fetch failed during build:", error);
  }

  let configurations: IConfiguration[] = data ? await data.json() : [];

  const handleConfigurationSelection = async (configurationId: string) => {
    "use server";
    try {
      if (!configurationId) {
        return {
          status: "error",
          message: "No configuration ID provided.",
        };
      }
      const response = await fetch(`${apiUrl}/${configurationId}/launch`, {
        method: "POST",
      });
      if (!response.ok) {
        return {
          status: "error",
          message: await response.text(),
        };
      }
      return response.json();
    } catch (error: any) {
      console.error(error);
      return {
        status: "error",
        message:
          error.cause.code === "ECONNREFUSED"
            ? "Failed to connect to the server."
            : "An error occurred while launching the configuration.",
      };
    }
  };

  const handleConfigurationImport = async (
    formData: FormData,
    config: IConfiguration,
  ) => {
    "use server";
    try {
      if (!config) {
        return {
          status: "error",
          message: "No configuration provided.",
        };
      }
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        return {
          status: "error",
          message: await response.text(),
        };
      }
      revalidatePath("/");
      return response.json();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfigurationExport = async (configurationId: string) => {
    "use server";
    try {
      if (!configurationId) {
        return {
          status: "error",
          message: "No configuration ID provided.",
        };
      }
      const response = await fetch(`${apiUrl}/${configurationId}`, {
        method: "GET",
      });

      if (!response.ok) {
        return {
          status: "error",
          message: await response.text(),
        };
      }

      const configuration = await response.json();

      return configuration;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-full bg-primary/10">
      <Home
        allConfigurations={configurations}
        handleConfigurationSelection={handleConfigurationSelection}
        handleConfigurationExport={handleConfigurationExport}
        handleConfigurationImport={handleConfigurationImport}
      />
    </div>
  );
}

export default HomePage;
