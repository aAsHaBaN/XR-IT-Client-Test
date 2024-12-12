A working document to drill down into the targeted requirements to complete the Finland conference on July 23. As a prerequisite to these requirements Mina will investigate which React library we will use for diagraming.

Mina, Arjo, Ian, Zak: feel free to add, remove, or update any of the notes below. I have also left some question / discussion points for Mina, Arjo and Zak.

We can use this as a live document to define interfaces between our work.
<h4>Orchestrator Network management</h4>
<b>FRONT END: Orchestration interface</b>

This interface represents the main XR-IT web interface for orchestration management. Our goal here is that the interface will show two Nodes connected. Node 1 will be running MVN and a xSens suit, while Node 2 will be running Unreal Engine.

To save time, this configuration file will be preconfigured and saved to the Orchestrator. For this initial test then, we will want to add a stream from MVN of this suit (Node 1) to Unreal Engine (Node 2).

The web interface then will then need to:

1. List Nodes and their status (online / offline)
2. Map the xSens suit from Node 1 to the specified port in Unreal on Node 2:
   This will require two emits, one to each Node. 
   1. To Node 1 instructing MVN to add a network stream target to the specified port on Node 2.
   2. To Node 2 instructing Unreal Engine to open this specified port accept the MVN stream.

<b>BACK END (Orchestrator)</b>

0. Orchestrator architecture, node connections and configuration management
   
   I will first need to setup a skeleton for the Orchestrator architecture. This means allocating ports for connections from Nodes as well as launching those connections and also for hosting a dummy configuration that shows Unreal and MVN as resources on each machines.

1. Emit orchestrator configuration updates
   
   The orchestrator will emit the command 'orchestrator-config-updated' whenever the configuration for XR-IT is changed. This happens, for example, a new node connects to the system, a node goes offline, or new software is added to the system. To request the configuration, the front-end can also emit 'get-orchestrator-configs'
   
*<b>DISCUSS DAMIR-MINA: We will use this for now, but in the future, should this emit specify the node that updates occur within or should it just push the entire updated config?</b>*

```
// Connecting to Orchestrator via interfaces namespace
// Please note the below port and interface endpoint

import { io } from "socket.io-client";

const socket = io("http://localhost:2222/interfaces", {
    reconnectionDelayMax: 10000
});

socket.connect();

// Force orchestrator to load config
socket.emit("config:get-orchestrator-config");

// On load
socket.on('config:orchestrator-config', (configs) => {
	...do something
})


// On update
socket.on('config:orchestrator-config-updated, (updatedConfigs) => {
	...do something
})
```

```
// Example orchestrator configuration return (subject to update)
{
    "id": "8bfa88c3-6a34-4ca6-a229-ccc66fde82a6",
    "vpn_config_id": "d38018b8-8e53-4eaa-be98-2aac5820922a",
    "configuration_name": "TRL Config 1",
    "virtual_hub_id": "471236d0-714d-42ef-9e6a-63edf5a07417",
    "labs": [
        {
            "id": "b4972f36-3fb2-4905-87cc-55dc8caa11a9",
            "name": "TRL-VLAB1",
            "lab_permissions": [
                "24a94d66-7a55-4536-8684-0e541a60773f"
            ]
        },
        {
            "id": "24a94d66-7a55-4536-8684-0e541a60773f",
            "name": "TRL-VLAB2",
            "lab-permissions": []
        }
    ],
    "nodes": [
        {
            "id": "d38018b8-8e53-4eaa-be98-2aac5820922a",
            "labId": "b4972f36-3fb2-4905-87cc-55dc8caa11a9",
            "machine_alias": "DELL-RACK",
            "role": "orchestrator",
            "local_ip": "10.10.10.1",
            "socket_port": 8080,
            "configurations": []
        },
        {
            "id": "6925669e-043e-4654-af79-d36c8518ee43",
            "labId": "b4972f36-3fb2-4905-87cc-55dc8caa11a9",
            "machine_alias": "DAE-UNO",
            "role": "client",
            "local_ip": "192.168.20.201",
            "socket_port": 8080,
            "configurations": [
                {
                    "software_id": "MVN",
                    "port": 6004,
                    "hardware": [
                        {
                            "id": "4740e255-674b-4402-a36b-9c4e9767e0f6",
                            "hardware_id": "XSENSE_SUIT"
                        }
                    ],
                    "network-streaming-targets": []
                }
            ]
        },
        {
            "id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
            "machine_alias": "DAE-THREE",
            "labId": "24a94d66-7a55-4536-8684-0e541a60773f",
            "role": "client",
            "local_ip": "192.168.20.205",
            "socket_port": 8080,
            "configurations": [
                {
                    "software_id": "UNREAL_ENGINE",
                    "live_link_streams": []
                }
            ]
        }
    ]
}
```
   
2. Add MVN network stream on Node 1

   The interface for adding a network streaming target for MVN. On success, the orchestrator config update will be triggered.
    
```
const nodeId = "6925669e-043e-4654-af79-d36c8518ee43",
const networkStreamTarget = {
	ip: "192.168.20.205",
	port: 5643,
	targetNode: "f2690fd1-3f31-4727-a8df-b2fc86945209"
}


socket.emit("node:mvn:add-network-stream", command);

socket.on('config:orchestrator-config-updated, (updatedConfigs) => {
	...do something
})
```
      

3. Accept stream on Unreal on Node 2

   Will create an interface for accepting a stream on LiveLink. This will be passed to the XR-IT Unreal Engine plugin. On success, 'orchestrator-config-update' will be emitted with the updated values.
   
    <b>*TO DO ARJO: Determine fields needed to set in LiveLink.*</b>
    
```
const nodeId = "6925669e-043e-4654-af79-d36c8518ee43"
const liveLinkSettings = {
	// awaiting Arjo to know required fields
}


socket.emit("node:unreal-engine:create-livelink-stream");

socket.on('config:orchestrator-config-updated, (updatedConfigs) => {
	...do something
})
```
      

<b>BACK END (Node)</b>

Nodes will receive the corresponding actions from the Orchestrator, from this it will allocate/update resources appropriately. To do this we will need to:

- Add network target on Node 1 <b> [COMPLETE] </b>
- Communicate to XR-IT UE Plugin to accept stream on Node 2
  
<b>Unreal Engine XR-IT Plugin</b>

The Unreal Engine will need to support the following two actions. 

1. Connect to the XR-IT Node running on the machine
2. Accepting a command from the XR-IT to Node and thereafter setting up LiveLink to ingest MVN streams on the specified port

<b>*TO DO ARJO-DAMIR: Define the protocol through which the Node and Plugin communicate e.g socket.io, datagram, etc*</b>

*<b>DISCUSSION POINT ZAK-ARJO: do we also want to map the stream to an avatar in Unreal Engine? For now, we will not filter streams so this is not an issue.</b>*