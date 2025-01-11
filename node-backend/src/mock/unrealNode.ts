import { inspect } from "node:util";
import { io } from "socket.io-client";

export default (id: string) => {
  const UE_SERVICE_ID = "UNREAL_ENGINE";
  const ip = "localhost"; // OR "192.87.95.201" for remote testing
  const port = 1194;
  const socket = io(`http://${ip}:${port}/nodes`, {
    reconnectionDelayMax: 10000,
  });

  const onConnection = () => {
    console.log(`UNREAL MOCK: Connected to orchestrator @ ${ip}:${port}.\n`);
    socket.emit("node-identifier", id);
  };

  const onDisconnect = () => {
    console.log("UNREAL MOCK: You have been disconnected.\n");
  };

  const launchUE = async (configuration_id: string, settings: any) => {
    console.log("UNREAL MOCK: Recieved a command from the orchestrator to launch Unreal Engine.\n");
    console.log(inspect(settings, false, null, true));
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    socket.emit(`${UE_SERVICE_ID}:initialized`, configuration_id, settings);
  };

  const addLiveLinkSource = async (change_id: string, config: any) => {
    console.log("UNREAL MOCK: Recieved a command from the orchestrator to update config Unreal.");
    console.log(config);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("UNREAL MOCK: UE Config updated...");
    console.log("UNREAL MOCK: New UE config sent.\n");
    socket.emit(`${UE_SERVICE_ID}:stream-source-added`, change_id);
  };

  const removeLiveLinkSource = async (change_id: string, config: any) => {
    console.log("UNREAL MOCK: Recieved a command from the orchestrator to update config Unreal.");
    console.log(config);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("UNREAL MOCK: UE Config updated...");
    console.log("UNREAL MOCK: New UE config sent.\n");
    socket.emit(`${UE_SERVICE_ID}:stream-source-removed`,change_id);
  };

  console.log(`UNREAL MOCK: attempting to connect to localhost on port 1194\n`);

  socket.on("connect", onConnection);
  socket.on("disconnect", onDisconnect);
  socket.on(`${UE_SERVICE_ID}:launch`, launchUE);
  socket.on(`${UE_SERVICE_ID}:add-stream-source`, addLiveLinkSource);
  socket.on(`${UE_SERVICE_ID}:remove-stream-source`, removeLiveLinkSource);
  socket.connect();
};
