<h3> Beyond scope </h3>
Below are the end-to-end requirements for the features we have defined. These are out of scope for July, but are listed here for future use.
<h4>Node VPN connection configuration</h4>
<b>FRONT END: Local Node interface </b>

We will need a small interface which runs locally in XR-IT nodes which allows users to create new VPN configurations so as to connect to an XR-IT network / project. This interface will need to support:

1. Input VPN configurations via form and save
2. List VPN configurations
3. Start button which launches the VPN and connection to XR-IT orchestrator


<b>BACK END: Node Configuration and VPN management [COMPLETE]</b> 

The backend interface for this feature is complete. Below are the interfaces:

1. Load configuration <b>[COMPLETE]</b>
   
   Loading configuration is done through emitting 'get-vpn-configs'. The Node will use the same command to emit a list of configurations. You will receive an 'exception' command on failure.
   
```
// Client-side request
socket.emit("get-vpn-configs");

// Client-side receive:
socket.on("get-vpn-configs", (configs) => { ...do something });
```

```
// Configuration response example
[
	{
		"id": "6925669e-043e-4654-af79-d36c8518ee43",
		"machine_name": "DAE-UNO",
		"vpn_name": "Trans Realities Lab 1 VPN"
		"account": {
			"ip": "192.87.95.201",
			"port": "5555",
			"username": "damika",
			"password": "test",
			"accountName": "XRIT 1",
			"hubName": "XRIT",			
		},
		"vpn_adater": {
			"local_ip": "192.168.20.201",
			"name": "VPN20"
		}
	}
]
```


2. Write configurations <b>[COMPLETE]</b>
   
   Configurations will be written via the "create-vpn-setting" emit. It will return the new config along with its generated ID. You will receive an 'exception' command on failure.
   
```
// Client-side request
var config = {
	"machine_name": "DAE-UNO",
	"vpn_name": "Trans Realities Lab 1 VPN"
	"account": {
		"ip": "192.87.95.201",
		"port": "5555",
		"username": "damika",
		"password": "test",
		"accountName": "XRIT 1",
		"hubName": "XRIT",			
	},
	"vpn_adater": {
		"local_ip": "192.168.20.201",
		"name": "VPN20"
	}
}

socket.emit("create-vpn-config", config);

// Client-side receive:
socket.on("get-configs", (newConfig) => { ...do something });
```

```
// Node response on success
{
	"id": "6925669e-043e-4654-af79-d36c8518ee43",
	"machine_name": "DAE-UNO",
	"vpn_name": "Trans Realities Lab 1 VPN"
	"account": {
		"ip": "192.87.95.201",
		"port": "5555",
		"username": "damika",
		"password": "test",
		"accountName": "XRIT 1",
		"hubName": "XRIT",			
	},
	"vpn_adater": {
		"local_ip": "192.168.20.201",
		"name": "VPN20"
	}
}
```


3. Start VPN configuration <b>[COMPLETE]</b>
   
   Starting an orchestrator connection can be initiated via the 'start-orchestrator-connection' command. It will return true if the connection is correctly initiated. You will receive an 'exception' command on failure.

```
// Client-side request
var id = "6925669e-043e-4654-af79-d36c8518ee43";
socket.emit("start-orchestrator-connection", id);

// Client-side receive:
socket.on("start-orchestrator-connection", (success) => { ...do something });
```

<h4>Orchestrator Node configuration</h4>
<b>FRONT END: Simplified orchestrator interface</b>

As discussed, we will have two tabs/interfaces for the orchestration configuration. Node configuration represents one of these. It will be a simpler view for managing the nodes which are connected to the network as well as configuring the resources they are responsible for. For this sprint, this interface will need to support the following:

1. Listing nodes and their status (online / offline)
2. Adding MVN and Unreal Engine as supported softwares and Xsens MoCap suit as supported hardware
	- We will have a total of two nodes in this system
	- Node 1 will be responsible for MVN and an Xsens suit
	- Node 2 will be responsible for Unreal Engine


<b>BACK END: Orchestrator</b>

0. Orchestrator architecture, node connections and configuration management
   
   The first development that will need to be completed is to setup a skeleton for the Orchestrator architecture. This allocating ports for connections from Nodes as well as launching those connections and serving/updating Orchestrator configurations.

1. Emit orchestrator configuration updates
   
   The orchestrator will need to emit updates to the Orchestrator configuration to the Front End when, for example, a new node connects to the system, a node goes offline, or new software is added to the system. We will use the 'orchestrator-config-update' command in this case.
   
*<b>DISCUSS DAMIR-MINA: Should this emit specify the node that updates occur within or should it just push the entire updated config?</b>*

*<b>DISCUSS DAMIR-ZAK: Should the xSens suit be specified at this level? Or should 'sub-resources' (in this case xSens suit being a subresource of MVN) be defined in the more detailed Orchestration management page?</b>*

```
// Force orchestrator to load configs
socket.emit("get-orchestrator-configs");

// On load
socket.on('get-orchestrator-configs', (configs) => {
	...do something
})


// On update
socket.on('orchestrator-config-update, (updatedConfigs) => {
	...do something
})
```

```
// Example orchestrator configuration return (subject to update)

{
	"id": "8bfa88c3-6a34-4ca6-a229-ccc66fde82a6"
	"public_ip": "192.87.95.201",
	"local_ip": "10.10.10.1",
	"nodes": [
		{
			"id": "6925669e-043e-4654-af79-d36c8518ee43",
			"machine_name": "DAE-UNO",
			"local_ip": "192.168.20.201",
			"socket_port": "8080",
			"isConnected": true,
			"configurations": [
				{
					"software": "MVN",
					"isRunning": "true",
					"port": 6004,
					"network-streaming-targets": [
						{
							ip: "192.168.20.205",
							port: 5643,
							targetNode: "f2690fd1-3f31-4727-a8df-b2fc86945209"
						}
					]
				}
			]
		},
		{
			"id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
			"machine_name": "DAE-THREE",
			"local_ip": "192.168.20.205",
			"socket_port": "8080",
			"isConnected": false,
			"configurations": [
				{
					"software": "UNREAL_ENGINE",
					"isRunning": "false",
					"livelink-streams": [
						{
							"originNode": "6925669e-043e-4654-af79-d36c8518ee43",
							"originIP": "192.168.20.201",
							"port": 5643
						}
					]
				}
			]
		}
	]
}
```

2. Add resources to Nodes
   
   In this case we will need to support adding MVN and Unreal Engine to Node 1 and Node 2 respectively. For now we will use the 'node:add-resource' command.

*<b>DISCUSS DAMIR-MINA: See discussion point above about whether updates to configs should emit the entire config update or just the node.</b>*
   
```
const command = {
	nodeId: "6925669e-043e-4654-af79-d36c8518ee43",
	softwareId: "MVN"
}

socket.emit('node:add-resource', command);
```

<h4>Orchestrator Network management</h4>
<b>FRONT END: Orchestration interface</b>

This interface represents the main XR-IT web interface for orchestration management. Our goal here is that the interface will show two Nodes connected. Node 1 will be running MVN and a xSens suit, while Node 2 will be running Unreal Engine.

To save time, this configuration file will be preconfigured and saved on the Orchestrator. Our for this initial test then, is to add a stream from MVN of this suit (Node 1) to Unreal Engine (Node 2).

The web interface then will then need to:

1. List nodes and their status (online / offline)
2. Scan if MVN and Unreal are launched as well as if the Unreal plugin is installed in Unreal.
3. Add an xSens suit to Node 1 MVN
4. Map xSens suit from Node 1 to the specified port in Unreal on Node 2

<b>BACK END (Orchestrator)</b>

1. Scan service discovery
   
   The backend will have an endpoint to scan which listed resources are live on each node. 
   
   <b>*TO DO DAMIR: Need to figure out what this interface interaction will look like.*</b>

```
socket.emit("orchestrator:service-discovery");

socket.on('orchestrator-config-update, (updatedConfigs) => {
	...do something
})
```

   
2. Add xSens suit to MVN
   
   Will create an interface for adding xSens suits as a resource to MVN.
   
    <b>*TO DO DAMIR: Need to figure out what this interface interaction will look like.*</b>
    
```
const command = {
	nodeId: "6925669e-043e-4654-af79-d36c8518ee43",
	suit-config: { } // need to decide
}

socket.emit("node:mvn:add-xSense");

socket.on('orchestrator-config-update, (updatedConfigs) => {
	...do something
})
```
      
   
4. Add MVN network stream on Node 1

   The interface for adding a network streaming target for MVN. On success, the orchestrator config update will be triggered.
    
```
const command = {
	nodeId: "6925669e-043e-4654-af79-d36c8518ee43",
	network-stream-target: {
		ip: "192.168.20.205",
		port: "5643",
		targetNode: "f2690fd1-3f31-4727-a8df-b2fc86945209"
	}
}

socket.emit("mvn:add-network-stream", command);

socket.on('orchestrator-config-update, (updatedConfigs) => {
	...do something
})
```
      

5. Accept stream on Unreal on Node 2

   Will create an interface for accepting a stream on LiveLink. This will be passed to the XR-IT Unreal Engine plugin. On success, 'orchestrator-config-update' will be emitted with the updated values.
   
    <b>*TO DO ARJO: Determine fields to set in LiveLink.*</b>
    
```
const command = {
	nodeId: "6925669e-043e-4654-af79-d36c8518ee43",
	livelink-settings: {
		// awaiting Arjo to know required fields
	}
}

socket.emit("n:unreal-engine:create-livelink-stream");

socket.on('orchestrator-config-update, (updatedConfigs) => {
	...do something
})
```

<b>BACK END (Node)</b>

Nodes will receive the appropriate actions from the Orchestrator and update resources appropriately.

- Add network target on Node 1 (done)
- Communicate to XR-IT UE Plugin to accept stream on Node 2
  
<b>Unreal Engine XR-IT Plugin</b>

The Unreal Engine will need to support the following two actions. 

1. Connect to the XR-IT Node running on the machine
2. Accepting a command from the XR-IT to Node and thereafter setting up LiveLink to accept MVN streams on the specified port

<b>*TO DO ARJO-DAMIR: Define the protocol through which the Node and Plugin communicate e.g socket.io, datagram, etc*</b>

*<b>DISCUSSION POINT ZAK-ARJO: do we also want to map the stream to an avatar in Unreal Engine?</b>*