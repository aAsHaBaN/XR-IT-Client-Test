import { io } from "socket.io-client";

export default (id: string) => {
  const MVN_SERVICE_ID = "MVN";
  const ip = "localhost"; // OR "192.87.95.201" for remote testing
  const port = 1194;
  const socket = io(`http://${ip}:${port}/nodes`, {
    reconnectionDelayMax: 10000,
  });

  const onConnection = () => {
    console.log(`MVN MOCK: Connected to orchestrator @ ${ip}:${port}.\n`);
    socket.emit("node-identifier", id);
  };

  const onDisconnect = () => {
    console.log("MVN MOCK: You have been disconnected.\n");
  };

  const launchMVN = async (configuration_id: string) => {
    console.log("MVN MOCK: Recieved a command from the orchestrator to launch MVN.\n");

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("MVN MOCK: MVN launched.\n");
    socket.emit(`${MVN_SERVICE_ID}:initialized`, configuration_id);
  };

  const onAddMvnStream = async (stream_id: string, stream: any) => {
    console.log("MVN MOCK: Recieved a command from the orchestrator to add a network stream to MVN.");
    console.log(stream);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("MVN MOCK: New MVN streaming target created.\n");
    socket.emit(`${MVN_SERVICE_ID}:stream-target-added`, stream_id);
  };

  const onRemoveMvnStream = async (stream_id: string, stream: any) => {
    console.log("MVN MOCK: Recieved a command from the orchestrator to remove a network stream from MVN.");
    console.log(stream);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("MVN MOCK: New MVN streaming target removed.\n");
    socket.emit(`${MVN_SERVICE_ID}:stream-target-removed`, stream_id);
  };

  socket.on("connect", onConnection);
  socket.on("disconnect", onDisconnect);
  socket.on(`${MVN_SERVICE_ID}:launch`, launchMVN);
  socket.on(`${MVN_SERVICE_ID}:add-stream-target`, onAddMvnStream);
  socket.on(`${MVN_SERVICE_ID}:remove-stream-target`, onRemoveMvnStream);

  console.log(`MVN MOCK: attempting to connect to ${ip}:${port}\n`);
  socket.connect();
};
