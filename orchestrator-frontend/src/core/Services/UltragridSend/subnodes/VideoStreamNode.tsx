import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import Select from "@/components/Select";
import { IUltragridSendNodeData } from "../configuration";
import videoResolution from "./video-resolution.json";
import videoCompression from "./video-compression.json";
import videoCodecs from "./video-codecs.json";
import videoFrameRate from "./video-frame-rate.json";
import { getNodeDataFromId, updateService } from "@/services/config";

export type VideoStreamNode = Node<IUltragridSendNodeData>;

function VideoStreamNode({ data, parentId }: NodeProps<VideoStreamNode>) {
  const handleChange = (property: string, value: string) => {
    if (!parentId) {
      return;
    }

    const { nodeId, configurationId } = getNodeDataFromId(parentId);
    updateService(nodeId, configurationId, {
      ...data.settings,
      video: {
        ...data.settings.video,
        [property]: value,
      },
    });
  };

  return (
    <div className="subnode ultragrid-send-subnode ultragrid-send-stream-node">
      <div className="subnode__content">
        <div className="subnode__handle subnode__handle--left">
          {data.input && <BaseHandle handle={data.input} />}
        </div>
        <div className="ultragrid-send-subnode__settings">
          <h6 className="subnode__label">Video Stream</h6>
          <div className="flex flex-col gap-1">
            <Select
              label="Resolution"
              disabled={!data.isOnline}
              options={videoResolution}
              value={data.settings.video.resolution ?? ""}
              onChange={(value) => handleChange("resolution", value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Select
              label="Compression"
              disabled={!data.isOnline}
              options={videoCompression}
              value={data.settings.video.compression ?? ""}
              onChange={(value) => handleChange("compression", value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Select
              label="Codec"
              disabled={!data.isOnline}
              options={videoCodecs}
              value={data.settings.video.codec ?? ""}
              onChange={(value) => handleChange("codec", value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Select
              label="Frame Rate"
              disabled={!data.isOnline}
              options={videoFrameRate}
              value={data.settings.video.frame_rate ?? ""}
              onChange={(value) => handleChange("frame_rate", value)}
            />
          </div>
        </div>
        <div className="subnode__handle subnode__handle--right">
          {data.output && <BaseHandle handle={data.output} />}
        </div>
      </div>
    </div>
  );
}

export default VideoStreamNode;
