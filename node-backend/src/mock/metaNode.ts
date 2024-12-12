import { io } from "socket.io-client";

export default (id: string) => {
  const METAQUEST_SERVICE_ID = "METAQUEST";
  const ip = "localhost"; // OR "192.87.95.201" for remote testing
  const port = 1194;
  const socket = io(`http://${ip}:${port}/nodes`, {
    reconnectionDelayMax: 10000,
  });

  const onConnection = () => {
    console.log(`METAQUEST MOCK: Connected to orchestrator @ ${ip}:${port}.\n`);
    socket.emit("node-identifier", id);
  };

  const onDisconnect = () => {
    console.log("METAQUEST MOCK: You have been disconnected.\n");
  };

  const launchMetaquest = async (configuration_id: string) => {
    console.log("METAQUEST MOCK: Recieved a command from the orchestrator to launch Metaquest.\n");

    await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log("METAQUEST MOCK: Metaquest launched.\n");
    socket.emit(`${METAQUEST_SERVICE_ID}:initialized`, configuration_id);
  };

  socket.on("connect", onConnection);
  socket.on("disconnect", onDisconnect);
  socket.on(`${METAQUEST_SERVICE_ID}:launch`, launchMetaquest);

  console.log(`METAQUEST MOCK: attempting to connect to ${ip}:${port}\n`);
  socket.connect();
};
