import mvnNode from "./mvnNode";
import optiTrackNode from "./optiTrackNode";
import unrealNode from "./unrealNode";
import metaNode from "./metaNode";
import ugSendNode from "./ugSendNode";
import ugReceiveNode from "./ugReceiveNode";

var mvn_node_ids = [
  "6925669e-043e-4654-af79-d36c8518ee43",
  "54029d58-1998-4ac1-ac53-0d5f3ef0a1cb",
];
var ot_node_ids = ["da300860-19da-46c1-9bff-b98d6f6dba42"];
var meta_node_ids = ["10556115-1bd3-48b3-a366-d1a6ae0d5cad"];
var unreal_node_ids = ["f2690fd1-3f31-4727-a8df-b2fc86945209"];
var ug_send_node_ids = ["64baeb74-1b48-4c44-868b-ff13cd5435b2"]
var ug_receive_node_ids = ["f3a7a69d-57ca-4e65-ab23-c98f6d2f3450"]

// Define a mapping for node types and their corresponding IDs
const nodeTypes: { [key: string]: { ids: string[]; func: any } } = {
  mvn: { ids: mvn_node_ids, func: mvnNode },
  ue: { ids: unreal_node_ids, func: unrealNode },
  optitrack: { ids: ot_node_ids, func: optiTrackNode },
  metaquest: { ids: meta_node_ids, func: metaNode },
  ultragrid_send: { ids: ug_send_node_ids, func: ugSendNode },
  ultragrid_receive: { ids: ug_receive_node_ids, func: ugReceiveNode }
};

// Check if any arguments are specified for node types
const hasArgs = process.argv.some((arg) => /^(\w+)=\d+$/.test(arg));

// Process arguments and set the number for each node type
Object.entries(nodeTypes).forEach(([type, node]) => {
  const args = process.argv.find((a) => a?.startsWith(`${type}=`));
  let num = 0;
  if (!hasArgs) {
    num = 1;
  } else {
    const argNum = args ? args.split(`${type}=`)[1]?.trim() : "0";
    num = parseInt(argNum ?? "0");
  }
  // Execute the function
  let ids = [...node.ids];
  while (ids.length > 0 && num > 0) {
    node.func(ids[0]!);
    ids = ids.slice(1);
    num--;
  }
});
