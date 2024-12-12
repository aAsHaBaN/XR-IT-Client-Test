import { Node, NodeProps } from "@xyflow/react";
import BaseHandle from "@/core/handles/BaseHandle";
import { IUltragridSendNodeData } from "../configuration";
import Select from "@/components/Select";
import videoSources from "./sources-samples/video-sources.json";
import { getNodeDataFromId, updateService } from "@/services/config";

export type VideoSettingsNode = Node<IUltragridSendNodeData>;

function VideoSettingsNode({ data, parentId }: NodeProps<VideoSettingsNode>) {
  const handleSourceChange = (value: string) => {
    if (!parentId) {
      return;
    }

    const { nodeId, configurationId } = getNodeDataFromId(parentId);
    updateService(nodeId, configurationId, {
      ...data.settings,
      video: {
        ...data.settings.video,
        source_name: value,
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
          <h6 className="subnode__label">Video Settings</h6>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Select
                label="Video Source"
                disabled={!data.isOnline}
                options={videoSources}
                value={data.settings.video.source_name || ""}
                onChange={handleSourceChange}
              />
            </div>
          </div>
        </div>
        <div className="subnode__handle subnode__handle--right">
          {data.output && <BaseHandle handle={data.output} />}
        </div>
      </div>
    </div>
  );
}

export default VideoSettingsNode;
