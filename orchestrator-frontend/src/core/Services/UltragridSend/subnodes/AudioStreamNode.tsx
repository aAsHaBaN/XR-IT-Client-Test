import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import Select from "@/components/Select";
import { IUltragridSendNodeData } from "../configuration";
import audioCompression from "./audio-compression.json";
import audioCodecs from "./audio-codecs.json";
import { getNodeDataFromId, updateService } from "@/services/config";

export type AudioStreamNode = Node<IUltragridSendNodeData>;

function AudioStreamNode({ data, parentId }: NodeProps<AudioStreamNode>) {
  const handleChange = (property: string, value: string) => {
    if (!parentId) {
      return;
    }

    const { nodeId, configurationId } = getNodeDataFromId(parentId);
    updateService(nodeId, configurationId, {
      ...data.settings,
      audio: {
        ...data.settings.audio,
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
          <h6 className="subnode__label">Audio Stream</h6>
          <div className="flex flex-col gap-1">
            <Select
              label="Compression"
              disabled={!data.isOnline}
              options={audioCompression}
              value={data.settings.audio.compression || ""}
              onChange={(value) => handleChange("compression", value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Select
              label="Codec"
              disabled={!data.isOnline}
              options={audioCodecs}
              value={data.settings.audio.codec || ""}
              onChange={(value) => handleChange("codec", value)}
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

export default AudioStreamNode;
