import { io } from "socket.io-client";

export default (id: string) => {
  const OPTITRACK_SERVICE_ID = "OPTITRACK";
  const ip = "localhost"; // OR "192.87.95.201" for remote testing
  const port = 1194;
  const socket = io(`http://${ip}:${port}/nodes`, {
    reconnectionDelayMax: 10000,
  });

  const onConnection = () => {
    console.log(`OPTITRACK MOCK: Connected to orchestrator @ ${ip}:${port}.\n`);
    socket.emit("node-identifier", id);
  };

  const onDisconnect = () => {
    console.log("OPTITRACK MOCK: You have been disconnected.\n");
  };

  const launchOptiTrack = async (configuration_id: string) => {
    console.log("OPTITRACK MOCK: Recieved a command from the orchestrator to launch OptiTrack.\n");

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("OPTITRACK MOCK: OptiTrack launched.\n");
    socket.emit(`${OPTITRACK_SERVICE_ID}:initialized`, configuration_id);
  };

  const onAddOptiTrackStream = async (stream_id: string , stream: any) => {
    console.log("OPTITRACK MOCK: Recieved a command from the orchestrator to add a network stream to OptiTrack.");
    console.log(stream);
    console.log()

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("OptiTrack MOCK: New OPTITRACK streaming target created.\n");
    socket.emit(`${OPTITRACK_SERVICE_ID}:stream-target-added`, stream_id);
  };

  const onRemoveOptiTrackStream = async (stream_id: string , stream: any) => {
    console.log("OPTITRACK MOCK: Recieved a command from the orchestrator to remove a stream from OptiTrack.");
    console.log(stream);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("OPTITRACK MOCK: New OptiTrack streaming target removed.\n");
    socket.emit(`${OPTITRACK_SERVICE_ID}:stream-target-removed`, stream_id);
  };

  socket.on("connect", onConnection);
  socket.on("disconnect", onDisconnect);
  socket.on(`${OPTITRACK_SERVICE_ID}:launch`, launchOptiTrack);
  socket.on(`${OPTITRACK_SERVICE_ID}:add-stream-target`, onAddOptiTrackStream);
  socket.on(`${OPTITRACK_SERVICE_ID}:remove-stream-target`, onRemoveOptiTrackStream);

  console.log(`OPTITRACK MOCK: attempting to connect to ${ip}:${port}\n`);
  socket.connect();
};
