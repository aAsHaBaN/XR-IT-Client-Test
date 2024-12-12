import { inspect } from "node:util";
import { io } from "socket.io-client";

export default (id: string) => {
  const ULTRAGRID_SEND_SERVICE_ID = "ULTRAGRID_SEND";
  const ip = "localhost"; // OR "192.87.95.201" for remote testing
  const port = 1194;
  const socket = io(`http://${ip}:${port}/nodes`, {
    reconnectionDelayMax: 10000,
  });

  const onConnection = () => {
    console.log(`ULTRAGRID SEND MOCK: Connected to orchestrator @ ${ip}:${port}.\n`);
    socket.emit("node-identifier", id);
  };

  const onDisconnect = () => {
    console.log("ULTRAGRID SEND MOCK: You have been disconnected.\n");
  };

  const launchUltraGridSend = async (configuration_id: string) => {
    console.log("ULTRAGRID SEND MOCK: Recieved a command from the orchestrator to launch UltraGrid Send.\n");

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID SEND MOCK: UltraGrid Send launched.\n");
    socket.emit(`${ULTRAGRID_SEND_SERVICE_ID}:initialized`, configuration_id);
  };

  const onAddUltraGridVideoStream = async (stream_id: string , target_ip: string, video_settings: any) => {
    console.log("ULTRAGRID SEND MOCK: Recieved a command from the orchestrator to video stream to UltraGrid Send.\n");
    console.log(`IP: ${target_ip}`);
    console.log(`Settings: ${inspect(video_settings)}`);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID SEND MOCK: New UltraGrid Send video streaming target created.\n");
    socket.emit(`${ULTRAGRID_SEND_SERVICE_ID}:video-stream-target-added`, stream_id);
  };

  const onRemoveUltraGridVideoStream = async (stream_id: string , target_ip: string) => {
    console.log("ULTRAGRID SEND MOCK: Recieved a command from the orchestrator to remove a video stream from UltraGrid Send.");
    console.log(`IP: ${target_ip}`);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID SEND MOCK: New UltraGrid Send video streaming target removed.\n");
    socket.emit(`${ULTRAGRID_SEND_SERVICE_ID}:video-stream-target-removed`, stream_id);
  };

  const onAddUltraGridAudioStream = async (stream_id: string, target_ip: string, audio_settings: any) => {
    console.log("ULTRAGRID SEND MOCK: Recieved a command from the orchestrator to add an audio stream to UltraGrid Send.\n");
    console.log(`IP: ${target_ip}`);
    console.log(`Settings ${inspect(audio_settings)}`);
    console.log();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID SEND MOCK: New UltraGrid Send audio streaming target created.\n");
    socket.emit(`${ULTRAGRID_SEND_SERVICE_ID}:audio-stream-target-added`, stream_id);
  };

  const onRemoveUltraGridAudioStream = async (stream_id: string , target_ip: string) => {
    console.log("ULTRAGRID SEND MOCK: Recieved a command from the orchestrator to remove an audio stream from UltraGrid Send.");
    console.log(`IP: ${target_ip}`);

    await new Promise((resolve) => setTimeout(resolve, 2500));
    console.log("ULTRAGRID SEND MOCK: New UltraGrid Send audio streaming target removed.\n");
    socket.emit(`${ULTRAGRID_SEND_SERVICE_ID}:audio-stream-target-removed`, stream_id);
  };

  socket.on("connect", onConnection);
  socket.on("disconnect", onDisconnect);
  socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:launch`, launchUltraGridSend);
  socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:add-video-stream-target`, onAddUltraGridVideoStream);
  socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:add-audio-stream-target`, onAddUltraGridAudioStream);
  socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:remove-video-stream-target`, onRemoveUltraGridVideoStream);
  socket.on(`${ULTRAGRID_SEND_SERVICE_ID}:remove-audio-stream-target`, onRemoveUltraGridAudioStream);

  console.log(`ULTRAGRID SEND MOCK: attempting to connect to ${ip}:${port}\n`);
  socket.connect();
};
