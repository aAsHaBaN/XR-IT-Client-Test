Notes for Mina as she integrates the XR-IT Front End with the Orchestrator ahead of the Helsinki demo.

Once the front end is ready for integration, we can use the [damir/feature/JulySpring-Presentation](https://dev.azure.com/TransRealities/XR-IT/_git/XR-IT?path=%2Fnode-socket-mock&version=GBdamir%2Ffeature%2FJulySpring-Presentation) branch which contains premade orchestrator configurations as well as mock code for testing and integration.

This documents using and integrating the XR-IT Back End step by step (hopefully!) making integration as clearly as possible.

@<B29B8DBD-98DF-695B-BE2E-B4352DA95ADA> if you find any of this unclear, please let me know!

---

### 0. Requirements

You will have to create a [Windows VM on your machine](https://developer.microsoft.com/en-us/windows/downloads/virtual-machines/). The VM will also need [Node.js](https://nodejs.org/en/download/package-manager/current), [Git](https://git-scm.com/downloads), and of course [the repository](https://dev.azure.com/TransRealities/_git/XR-IT).

---

### 1. Starting the Orchestrator

There are two scripts which can be used to start the orchestrator: <br/>
`npm run start` and `npm run start-demo`

The second script `start-demo` contains autoconfiguration of VPN. Since all the machines will be run from your localhost, we do not need to worry about VPNs for integration.

Therefore, to start the orchestrator from the base directory, navigate to the orchestrator, install requirements and run the start script.

```
cd orchestrator-backend/
npm i
npm run start
```
---

###2. Mocking the Nodes

The aforementioned branch contains two Node.js indexes which can be used to mock connections from two Nodes:
- `index-dae1.js` Mocks DAE-UNO running MVN
- `index-dae3.js` Mocks DAE-THREE running Unreal Engine

As above, install the dependencies and the following start scripts can be used to run them on separate CLIs.

```
cd node-socket-mock 
npm i
npm run start-uno
npm run start-three
```
If you return to the CLI where you ran the Orchestrator, you should console logs that confirm both Nodes have connected.

---

###3. Connecting to the Orchestrator from the Front-End interface

You are now ready to connect to the Orchestrator to the interface! It is important to note, that we running a single socket (default port 2222) with two namespaces (allowing us to manage a single Socket I/O instance, but subdivide logic). Therefore, when you connect to the Orchestrator from the interface, <b>make sure to connect via the interfaces namespace.</b> 

You can do this as follows:

```
import { io } from "socket.io-client";

const socket = io("http://localhost:2222/interfaces", {
    reconnectionDelayMax: 10000
});

socket.connect();
```

As is with the Nodes, you should see a console log from the Orchestrator confirming that an interface has connected.

---

###4. Request for initial config, what it would look like

Once you have connected to the Orchestrator, you can request an initial config (so as to load the interface correctly). To do this properly, you will need to wait until the socket connection is established.

Once that happens, you can emit the corresponding command. The Orchestrator will then emit a command in response, providing you with the config state. It will look something like this.

```
const onConnection = () => {
  // Connection is established, so you can now request a config
  socket.emit("config:get-orchestrator-config");
};

const onConfigReceived = (config) => {
  // Do something with the config
}

// Assigning functions to received messages
socket.on('connect', onConnection);
socket.on('config:orchestrator-config', onConfigReceived);
```

We are using a preconfigured initial config, which will also be used for the demo. You should receive the following config from the orchestrator.

```
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
            "configurations": [],
            "isOnline": true
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
            ],
            "isOnline": true
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
            ],
            "isOnline": true
        }
    ]
}
```

---

###5. Emit MVN add network target and resulting config

The next step will be to emit a command to <b>DAE-UNO</b> to add a network stream to <b>DAE-THREE</b>. The two variables needed here are DAE-UNO's id and a networkTarget variable with DAE-THREE's id, local ip and a port for the stream. 

Once you emit the message to add this network stream, the DAE-UNO mock should log, confirming that it received this command (in place of actually adding the stream). The Orchestrator will then emit a state change with a config that reflects this new stream. 

```
const daeUnoId = '6925669e-043e-4654-af79-d36c8518ee43';
const networkTarget = {
  ip: "192.168.20.205",                              // DAE-THREE IP
  port: 5643,
  targetNode: "f2690fd1-3f31-4727-a8df-b2fc86945209" // DAE-THREE ID
};

const onConfigUpdate = (config) => {
  // Do something with the new config
};

socket.on('config:orchestrator-config-updated', onConfigUpdate);
socket.emit('node:mvn:add-network-stream', daeUnoId, networkTarget);
```

Given that everything works, you should receive the following config in response:

```
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
            "configurations": [],
            "isOnline": true
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
                    "network-streaming-targets": [
                        {
                            "ip": "192.168.20.205",
                            "port": 5643,
                            "targetNode": "f2690fd1-3f31-4727-a8df-b2fc86945209"
                        }
                    ]
                }
            ],
            "isOnline": true
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
            ],
            "isOnline": true
        }
    ]
}
```

---

###6. Emit Unreal Engine add LiveLink stream

At the same time, we will also need to emit a message to DAE-THREE to accept the incoming stream via the Unreal Plugin. 

Two notes:

<b>(1) I am still waiting on Arjo on what exactly this looks like. The interface is implemented, but will not do anything to Unreal until I talk to Arjo.</b>

<b>(2) I recognize now, that implementing it this way will cause the `'config:orchestrator-config-updated'` message to be sent twice. Let's do it this way now and implement a more clever way on the back end after the sprint. </b>

All together it will look something like this:

```
const daeUnoId = "6925669e-043e-4654-af79-d36c8518ee43";
const daeThreeId = "f2690fd1-3f31-4727-a8df-b2fc86945209";

const mvnNetworkTarget = {
  ip: "192.168.20.205", // DAE-THREE IP
  port: 5643,
  targetNode: daeThreeId
};

const liveLinkStream = {
  // Waiting on Arjo
}

const onConfigUpdate = (config) => {
  // Do something with the new config
};

socket.on('config:orchestrator-config-updated', onConfigUpdate);
socket.emit('node:mvn:add-network-stream', daeUnoId, networkTarget);
socket.emit('node:unreal-engine:add-livelink-stream', daeThreeId, liveLinkStream);
```

Finally, the last config you receive should look like this!

```
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
            "configurations": [],
            "isOnline": true
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
                    "network-streaming-targets": [
                        {
                            "ip": "192.168.20.205",
                            "port": 5643,
                            "targetNode": "f2690fd1-3f31-4727-a8df-b2fc86945209"
                        }
                    ]
                }
            ],
            "isOnline": true
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
                    "live_link_streams": [
                        {
                            // Waiting on Arjo
                        }
                    ]
                }
            ],
            "isOnline": true
        }
    ]
}
```


---

##Good luck!