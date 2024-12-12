Working document to define the best possible management for configuration documents in XR-IT. Likely, configuration files will be stored as a single config document, saved to the on the XR-IT Orchestrator (Server), but could also be saved to MongoDb.

This configuration file can be edited directly by the Orchestrator (Server) or updated via an API interface by XR-IT Nodes (Clients). Any changes to this configuration will then be emitted as a push notification to subscribed clients. If MongoDB is used, then all nodes of XR-IT will subscribe to the MongoDB Collection via Change Streams, which push updates to a collection or database.

<h3>Local vs Database Storage</h3>
<b>Configuration documents stored on Server (preferred)</b>

- Preferably, configurations are stored as a single file on the Orchestrator (Server)'s machine. Any updates to this file, are executed via an API on from the Orchestrators web interface or from other XR-IT Nodes (clients). Once this configuration file is updated, the Orchestrator emits an update to all nodes on this XR-IT Network.

	Pros
	- Easy import / export of configuration files
	- All XR-IT 'networks' are independent, not having to rely on an XR-IT server or MongoDB database
	- No need to support authentication other than on the VPN
	
	Cons
	- Corruption or memory failure may be catastrophic. May need to support saving the configuration file to a database backup.

<b>Configurations MongoDB Database</b>

- All XR-IT Nodes (the Orchestrator and its Clients) will write to the database by communicating with an XR-IT Server in the cloud, which in turn writes to MongoDB. From there, any changes to the database will emit updates to these nodes via [Change Streams](https://www.mongodb.com/docs/manual/changeStreams/).

	Pros
	- Easy to implement API layer
	- Configuration file is protected
	- [Functionality exists in MongoDb and looks quite simple to use](https://www.mongodb.com/docs/manual/changeStreams/)
	
	Cons
	- Extra two layers of software including: authentication, a server which manages API calls and MongoDb
	- DB management

<h3>Configuration file examples</h3>
There will be two type of JSON configuration files <i>VPN Configuration files</i> and <i>XR-IT Orchestration Configuration files</i>. Respectively, the XR-IT Orchestrator Node will have both of these files, while XR-IT Client Nodes will only have the <i>VPN Configuration files</i>. The VPN configs will look differently for XR-IT Orchestrator and Clients. 

<b> XR-IT Orchestrator VPN Configuration File </b>

```
{
	"id": "d38018b8-8e53-4eaa-be98-2aac5820922a",
	"public_ip": "192.87.95.201",
	"local_ip": "10.10.10.1",
	"user": {
		"name": "admin",
		"pw": "0perationC0re404"
	},
	"virtual_hubs": [
		{
			"id": "471236d0-714d-42ef-9e6a-63edf5a07417",
			"name": "XRIT",
			"ports": [ 443, 992, 1194, 5555, 5990, 7000 ],
			"configurations": {}
		}
	]
}
```

 <b>XR-IT Orchestrator Orchestration Configuration File</b>

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
                    "network-streaming-targets": [
                        {
                            "stream_id":"4adac617-c109-4a5b-a6aa-7285a98177c0",
                            "target_node":"f2690fd1-3f31-4727-a8df-b2fc86945209",
                            "port":8764
                        }
                    ]
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

<b> XR-IT Client Node VPN Configuration File </b>

```
[
    {
        "id": "6925669e-043e-4654-af79-d36c8518ee43",
        "account": {
            "name": "XRIT",
            "ip": "10.10.10.1",
            "port": 5555,
            "username": "damika",
            "password": "test"
        },
        "adapter": {
            "ip": "192.168.20.200",
            "name": "VPN20"
        },
        "orchestrator_socket": {
            "ip": "192.168.20.1",
            "port": 2222
        }
    }
]
```

**Open questions**

How to handle race conditions? If Server edits a node, while that node is actively making changes to itself. What to do with those changes?