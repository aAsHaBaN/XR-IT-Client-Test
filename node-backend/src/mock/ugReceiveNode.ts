import { io } from "socket.io-client";

export default (id: string) => {
  const ULTRAGRID_RECEIVE_SERVICE_ID = "ULTRAGRID_RECEIVE";
  const ip = "localhost"; // OR "192.87.95.201" for remote testing
  const port = 1194;
  const socket = io(`http://${ip}:${port}/nodes`, {
    reconnectionDelayMax: 10000,
  });

  const onConnection = () => {
    console.log(`ULTRAGRID RECEIVE MOCK: Connected to orchestrator @ ${ip}:${port}.\n`);
    socket.emit("node-identifier", id);
  };

  const onDisconnect = () => {
    console.log("ULTRAGRID RECEIVE MOCK: You have been disconnected.\n");
  };

  const launchUltraGridReceive = async (configuration_id: string) => {
    console.log("ULTRAGRID RECEIVE MOCK: Recieved a command from the orchestrator to launch UltraGrid Receive.\n");

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID RECEIVE MOCK: UltraGrid Receive launched.\n");
    socket.emit(`${ULTRAGRID_RECEIVE_SERVICE_ID}:initialized`, configuration_id);
  };

  const onAddUltraGridVideoStream = async (stream_id: string , source_ip: string, video_output: string) => {
    console.log("ULTRAGRID RECEIVE MOCK: Recieved a command from the orchestrator to video stream to UltraGrid Receive.\n");
    console.log(`IP: ${source_ip}`);
    console.log(`Video output: ${video_output}`);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID RECEIVE MOCK: New UltraGrid Receive video streaming source created.\n");
    socket.emit(`${ULTRAGRID_RECEIVE_SERVICE_ID}:video-stream-source-added`, stream_id);
  };

  const onRemoveUltraGridVideoStream = async (stream_id: string , source_ip: string) => {
    console.log("ULTRAGRID RECEIVE MOCK: Recieved a command from the orchestrator to remove a video stream from UltraGrid Receive.");
    console.log(`IP: ${source_ip}`);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID RECEIVE MOCK: New UltraGrid Receive video streaming source removed.\n");
    socket.emit(`${ULTRAGRID_RECEIVE_SERVICE_ID}:video-stream-source-removed`, stream_id);
  };

  const onAddUltraGridAudioStream = async (stream_id: string, source_ip: string, audio_output: string) => {
    console.log("ULTRAGRID RECEIVE MOCK: Recieved a command from the orchestrator to add an audio stream to UltraGrid Receive.\n");
    console.log(`IP: ${source_ip}`);
    console.log(`Audio output: ${audio_output}`);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID RECEIVE MOCK: New UltraGrid Receive audio streaming source created.\n");
    socket.emit(`${ULTRAGRID_RECEIVE_SERVICE_ID}:audio-stream-source-added`, stream_id);
  };

  const onRemoveUltraGridAudioStream = async (stream_id: string , source_ip: string) => {
    console.log("ULTRAGRID RECEIVE MOCK: Recieved a command from the orchestrator to remove an audio stream from UltraGrid Receive.");
    console.log(`IP: ${source_ip}`);

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID RECEIVE MOCK: New UltraGrid Receive audio streaming source remove.\n");
    socket.emit(`${ULTRAGRID_RECEIVE_SERVICE_ID}:audio-stream-source-removed`, stream_id);
  };

  socket.on("connect", onConnection);
  socket.on("disconnect", onDisconnect);
  socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:launch`, launchUltraGridReceive);
  socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:add-video-stream-source`, onAddUltraGridVideoStream);
  socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:add-audio-stream-source`, onAddUltraGridAudioStream);
  socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:remove-video-stream-source`, onRemoveUltraGridVideoStream);
  socket.on(`${ULTRAGRID_RECEIVE_SERVICE_ID}:remove-audio-stream-source`, onRemoveUltraGridAudioStream);

  console.log(`ULTRAGRID RECEIVE MOCK: attempting to connect to ${ip}:${port}\n`);
  socket.connect();
};
