import { useEffect, useState } from "react";
import { Node } from "@xyflow/react";
import { IServiceNodeData } from "@/types/diagram";
import { SERVICE_TYPES_MAP, SERVICES } from "@/core/Services/constants";
import Filters from "./Filters";

function Sidebar({ nodes, labs }: { nodes: Node[]; labs: ILab[] }) {
  const [groupedNodes, setGroupedNodes] = useState<{ [key: string]: Node[] }>(
    {},
  );
  const [filteredLabs, setFilteredLabs] = useState<ILab[]>(labs);
  const [filters, setFilters] = useState<{
    service: (typeof SERVICES)[number] | "";
    lab: string;
  }>({
    service: "",
    lab: "",
  });

  useEffect(() => {
    function filterNodes(nodes: Node[]) {
      return nodes.filter(
        (node) =>
          (!filters.service || node.type === filters.service) &&
          (!filters.lab || node.data.lab === filters.lab),
      );
    }

    function groupNodesByLab(nodes: Node[]) {
      const groupedNodes: { [key: string]: Node[] } = {};
      const filteredNodes = filterNodes(nodes);
      filteredNodes.forEach((node) => {
        const data = node.data as IServiceNodeData;
        if (!data.lab) {
          return;
        }
        const lab = data.lab;
        if (!groupedNodes[lab]) {
          groupedNodes[lab] = [];
        }
        groupedNodes[lab].push(node);
      });
      return groupedNodes;
    }

    setGroupedNodes(groupNodesByLab(nodes));
  }, [nodes, filters]);

  useEffect(() => {
    setFilteredLabs(
      labs.filter((lab) => !filters.lab || lab.name === filters.lab),
    );
  }, [labs, filters]);

  function onDragStart(event: React.DragEvent<HTMLDivElement>, node: Node) {
    event.dataTransfer.setData("application/reactflow", node.id);
    event.dataTransfer.effectAllowed = "move";
  }

  function selectLab(lab: string) {
    setFilters((previousFilters) => ({ ...previousFilters, lab }));
  }

  function selectService(service: string) {
    setFilters((previousFilters) => ({ ...previousFilters, service }));
  }

  return (
    <div>
      <aside
        className={`sidebar z-100 fixed left-0 top-14 w-52 overflow-y-auto border-r border-gray-200 bg-white px-2 py-2`}
      >
        <div className="mb-3 flex flex-col gap-1">
          <h4 className="block text-lg font-bold text-primary">Services</h4>
          <p className="text-left text-xs text-gray-500">
            Drag and drop a service to the diagram to configure it.
          </p>
        </div>
        <Filters
          selectService={selectService}
          selectLab={selectLab}
          labs={labs}
        />
        <div className="flex flex-col">
          {filteredLabs.map((lab) => (
            <div
              key={lab.id}
              className="my-2 rounded border-2 border-lab/10 bg-lab/10"
            >
              <h5 className="rounded-t bg-lab px-2 py-1 font-bold text-white">
                {lab.name}
              </h5>
              <div className="flex flex-col gap-2 p-2">
                {!groupedNodes[lab.name] ? (
                  <h5 className="text-sm italic text-gray-800">
                    No services available
                  </h5>
                ) : (
                  groupedNodes[lab.name].map((node) => {
                    if (!node.type) {
                      return null;
                    }
                    const Component = SERVICE_TYPES_MAP[node.type];
                    const data = {
                      ...node.data,
                      minified: true,
                    } as IServiceNodeData;

                    return (
                      <div
                        onDragStart={(event: React.DragEvent<HTMLDivElement>) =>
                          onDragStart(event, node)
                        }
                        draggable
                        className="cursor-move"
                        key={node.id}
                      >
                        <Component data={data} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
          {labs.length === 0 && (
            <h5 className="text-sm italic text-gray-700">No labs connected</h5>
          )}
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;
