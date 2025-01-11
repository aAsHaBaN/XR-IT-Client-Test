import { IStreamNodeData } from "@/types/diagram";

interface IUltragridReceiveConfiguration extends INodeConfiguration {
  software_id: "ULTRAGRID_RECEIVE";
  settings: IUltragridReceiveSettings;
}

interface IUltragridReceiveNodeData extends IStreamNodeData {
  settings: IUltragridReceiveSettings;
}

interface IUltragridReceiveSettings {
  video_output: string;
  audio_output: string;
}
