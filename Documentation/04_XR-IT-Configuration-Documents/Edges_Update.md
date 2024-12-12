# Grouped Calls

Migration documentation for ‘grouped-calls’ which, for all intents and purposes, is the creation of  [Socket.IO](http://Socket.IO) endpoint for creating edges/streams in the XR-IT configuration, rather than individual service commands as we currently do here.

*Currently our logic looks something like:*

```jsx
const mvnSourceConfig = {
	//... some MVN configuration
};

const ueTargetConfig = {
  // ... some Unreal configuration
};

socket.emit('node:mvn:add-network-stream', node1Id, mvnSourceConfig);
socket.emit('node:unreal-engine:add-livelink-stream', node2Id, ueTargetConfig);
```

*The proposal is instead to transition to following:*

**Requests:**

```jsx
var source = {
  "id": "6925669e-043e-4654-af79-d36c8518ee43",
  "software_id": "MVN",
  "config": []
}

var target = {
  "id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
  "software_id": "UNREAL_ENGINE",
  "port": 8764,
  "config": []

}

socket.emit(’stream:create’, source, target);
```

**Updates:**

For now, on completion of these commands, we will continue returning the entire configuration. Eventually, as we support the backend sending updates on a Node basis, we will also be able to provide updates on an edge/stream basis as well. 

Initially, on request to create, the backend will send an (near-immediate)  initial update with a pending state and an associated ID for the stream. From there, we will provide a second update when the stream creation is completed or fails for **both source and target nodes.**

```jsx
{
  "id": "8bfa88c3-6a34-4ca6-a229-ccc66fde82a6",
  "vpn_config_id": "d38018b8-8e53-4eaa-be98-2aac5820922a",
  "configuration_name": "TRL Config 1",
  "virtual_hub_id": "471236d0-714d-42ef-9e6a-63edf5a07417",
  "labs": [
    ...
  ],
  "nodes": [
    ...
  ],
  "streams": [
    {
      "id": "4adac617-c109-4a5b-a6aa-7285a98177c0",
      "source": {
        "status": "PENDING",
        "node_id": "6925669e-043e-4654-af79-d36c8518ee43",
        "software_id": "MVN"
      },
      "target": {
        "status": "PENDING",
        "node_id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
        "software_id": "UNREAL_ENGINE",
        "port": 8764
      }
    }
  ]
}
```

**Questions for team:**

1. Do we want to support the status of streams, beyond the success/failure of their creation? (i.e. is streaming active or offline?). See this discussion:

2. Naming conventions: currently I am using edges and streams interchangeably. Zak/Ian: any issues with this? Are there connections between Nodes that fall outside the scope of a ‘stream’?
3. An underlying assumption here is that we treat each edge separately, where a bidirectional stream would actually just be two edges in different directions or a single source streamed to two different targets would similarly be treated as separate edges. I think this should suffice for any use case we want to support, but again for Zak/Ian if you can think of any wonky cases that fall outside this scope.

---

**Endpoint groupings**

With the above in mind, the [Socket.IO](http://Socket.IO) endpoints for manipulating the XR-IT graph can be broken into three categories:

1. Orchestrator operations: Highest level operations––configuration of XR-IT orchestration settings or VPN settings
2. Node operations: Think of this like adding / deleting / updating a machine as well as any services it might support such as MVN, Unreal, UltraGrid and so forth.
3. Edge/stream operations: Connections between nodes—updating ports, configurations, etc.

Arjo made a good point that we should create some kind of standardized spec for base operations that should be supported per service (startup, shutdown, add, delete, etc.). This hierarchy should made this easy. With this, the naming conventions for these three levels would look something like this:

```jsx
// socket.emit('orchestrator:<action>', var1, var2, ...);
socket.emit('orchestrator:vpn-startup', vpnConfigId);

// socket.emit('node:<action>', var1, var2, ...);
socket.emit('node:update', nodeId, settings);

// socket.emit('stream:<action>', var1, var2, ...);
socket.emit('stream:create', source, target);
```

---

Assuming we will only provide updates when the stream creation is completed or fails for both source and target nodes, operations for creating and Node updates will work as follows:

**Creating streams**

1. As aforementioned, the front end will issue the following command:
    
    ```jsx
    var source = {
      "node_id": "6925669e-043e-4654-af79-d36c8518ee43",
      "software_id": "MVN"
    }
    
    var target = {
      "node_id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
      "software_id": "UNREAL_ENGINE",
      "port": 8764
    }
    
    socket.emit(’create-edge’, source, target);
    ```
    
2. Resolver: an initial layer on the backend will resolve the corresponding services and operations that this stream / edge corresponds to
3. Validation: these services will validate that this stream is valid
4. Propagate: services will emit commands to the nodes of interest to create each side of the stream
5. State update: this stream is added to the state with a PENDING state while the Nodes are executing operations. This triggers a config update which is propagated to the front end.
    
    

**Orchestrator receives updates from Nodes**

Once receiving a status update from either Node (source or target) the order of operations is as such:

1. Parse and validate response from Node (let’s call this Node 1)
2. Set status of Node 1 as SUCCESS or FAILURE
3. Check the other status of the other Node in the stream (lets call this Node 2) 

The stream’s status is the logical product of both Nodes (if one is FAIL then the stream is FAIL, if both are either SUCCESS or PENDING, then so is the stream). There are four possible outcomes here:

1. If Node 1 returns SUCCESS and Node 2 has already also returned SUCCESS, then update the configuration with the successful stream and emit a config update. The stream creation has completed successfully.
2. If Node 1 returns SUCCESS and Node 2 has not yet finished (remains PENDING), then update the pending state with Node 1’s success. No need to emit a configuration update as the stream creation is still pending.
3. If Node 1 returns FAILED and Node 2 has not yet finished and is still in PENDING, then update the pending with Node 1’s failure and continue. The stream creation has failed, but we will wait until Node 2 has reported to issue results and/or cleanup.
4. If Node 1 returns SUCCESS or FAILED and Node 2 has already finished and its status is FAILED, then update the config with both Nodes status. The stream creation has failed. We can do a couple of things here: 
    1. We can cleanup ourselves, deleting the stream from the config and sending a cleanup command to the Nodes (if necessary). An error message is emitted to the front end.
    2. We return the configuration with the failed stream and its reason. This is displayed for the user and they can choose to restart or delete the service. This is likely the best option, especially in the (likely often case) that only the target or source fails. Here we will potentially need a command or endpoint for modifying an edge such that it means restarting / updated one service in an edge / stream. 

---

**XR-IT Configuration**

With the above in mind, the edges in an adjacency list feels like the most practical / cleanest solution. The full config would look like this:

```jsx
{
  "id": "8bfa88c3-6a34-4ca6-a229-ccc66fde82a6",
  "vpn_config_id": "d38018b8-8e53-4eaa-be98-2aac5820922a",
  "configuration_name": "TRL Config 1",
  "virtual_hub_id": "471236d0-714d-42ef-9e6a-63edf5a07417",
  "labs": [
    {
      "id": "b4972f36-3fb2-4905-87cc-55dc8caa11a9",
      "name": "TRL-VLAB1",
      "lab_permissions": ["24a94d66-7a55-4536-8684-0e541a60773f"]
    },
    {
      "id": "24a94d66-7a55-4536-8684-0e541a60773f",
      "name": "TRL-VLAB2",
      "lab_permissions": []
    }
  ],
  "nodes": [
    {
      "id": "d38018b8-8e53-4eaa-be98-2aac5820922a",
      "lab_id": "b4972f36-3fb2-4905-87cc-55dc8caa11a9",
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
      "isOnline": true,
      "configurations": [
        {
          "software_id": "MVN",
          "port": 6004,
          "isRunning": true
        },
        {
          "software_id": "UNREAL_ENGINE",
          "isRunning": true
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
      "isOnline": true,
      "configurations": [
        {
          "software_id": "UNREAL_ENGINE",
          "isRunning": true
        }
      ]
    }
  ],
  "streams": [
    {
      "id": "4adac617-c109-4a5b-a6aa-7285a98177c0",
      "source": {
        "status": "PENDING",
        "node_id": "6925669e-043e-4654-af79-d36c8518ee43",
        "software_id": "MVN",
        "config": []
      },
      "target": {
        "status": "PENDING",
        "node_id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
        "software_id": "UNREAL_ENGINE",
        "port": 8764,
        "config": []
      }
    },
    {
      "id": "e0943b0a-e9ea-4efe-8e9b-b569bf015428",
      "source": {
        "status": "SUCCESS",
        "node_id": "6925669e-043e-4654-af79-d36c8518ee43",
        "software_id": "MVN",
        "config": []
      },
      "target": {
        "status": "FAILURE",
        "error_message": "Unreal plugin has not been launched. Please launch and try again.",
        "node_id": "6925669e-043e-4654-af79-d36c8518ee43",
        "software_id": "UNREAL_ENGINE",
        "port": {
	        "type": "PORT",
	        "value": 8764
        },
        "config": []      
      }
    }
  ]
}
```