import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import Select from "@/components/Select";
import { IUltragridReceiveNodeData } from "../configuration";
import audioSources from "./sources-samples/audio-sources.json";
import { getNodeDataFromId, updateService } from "@/services/config";

export type AudioSettingsNode = Node<IUltragridReceiveNodeData>;

function AudioSettingsNode({ data, parentId }: NodeProps<AudioSettingsNode>) {
  const handleSourceChange = (value: string) => {
    if (!parentId) {
      return;
    }

    const { nodeId, configurationId } = getNodeDataFromId(parentId);
    updateService(nodeId, configurationId, {
      ...data.settings,
      audio_output: value,
    });
  };

  return (
    <div className="subnode ultragrid-receive-subnode ultragrid-receive-stream-node">
      <div className="subnode__content">
        <div className="subnode__handle subnode__handle--left">
          {data.input && <BaseHandle handle={data.input} />}
        </div>
        <div className="ultragrid-receive-subnode__settings">
          <h6 className="subnode__label">Audio Settings</h6>
          <div className="flex flex-col gap-1">
            <Select
              label="Audio Local Output"
              disabled={!data.isOnline}
              options={audioSources}
              value={data.settings.audio_output}
              onChange={handleSourceChange}
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

export default AudioSettingsNode;
