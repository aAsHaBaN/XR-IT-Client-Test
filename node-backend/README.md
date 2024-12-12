# XR-IT - Node Backend

## Getting Started

First, install the dependencies:
```bash
npm install
```

## Running mocked Nodes instances

Running with mocked Nodes requires no additional setup. This will spawn a single Unreal Engine, Mock, UltraGrid Send, UltraGrid Receive, MetaQuest, and OptiTrack node.

```bash
npm run mocks
```

## Running XR-IT Nodes on a single machine

For development purposes, XR-IT comes with two nodes to develop with on your local machine. We have one MVN node and on Unreal Engine node. These nodes correspond to two nodes defined in the default development configuration found in the Orchestrator backend repository. Running these Nodes locally, requires no additional steps. There are two script arguments here:

```
use_default=local
config_id=[NODE ID HERE]
```

config_id: string -- specifies which node you would like to launch<br>
use_default: local | destributed -- specifies a default development configuration. Selecting distributed also autolaunches the VPN. We have two default configurations, one for local development (local) and one for development across machines and networks (distributed). These configurations can be found at:

node-backend > config > sample-configs > local-development-config.json

In this configuration the ids correspond to the following nodes:
```
mvn node: 6925669e-043e-4654-af79-d36c8518ee43
unreal node: f2690fd1-3f31-4727-a8df-b2fc86945209
```

To launch the XR-IT node, please run
```bash
npm run dev use_default=local config_id=[NODE ID HERE]
```


## Running Nodes across network(s)

Running live XR-IT Nodes across multiple machines and networks requires some additional setup.

### Install VPN

First, you will need to setup a VPN client on a Windows machine or VM. We are using SoftEther, so you will need to install SoftEther Client, and command line tools on this machine:

https://www.softether-download.com/en.aspx?product=softether

### Configuration files

The easiest thing to do here is to run Nodes with the default configuration files provided with XR-IT. If you are doing this, you can skip this step.

Otherwise, please refer to [this documentation for creating XR-IT configuration files.](https://www.notion.so/Configurations-3ada50b762c3401e8f8cd2d54b14eaab?pvs=4). Moreover, you can find [detailed instructions on running a live XR-IT environment here.](https://www.notion.so/tdn-trl-dae/Running-a-live-environment-in-TRL-6bf3ea624e304be8a72e1008806743d7?pvs=4)

### Run XR-IT Node

You should now be able to run your XR-IT node. The arguments are as such:

```
use_default=distributed
config_id=[NODE ID HERE]
```

Replace [NODE ID HERE] with your node id. If you are using the default XR-IT development configuration, the ids are as such:
```
mvn node: 6925669e-043e-4654-af79-d36c8518ee43
unreal node: f2690fd1-3f31-4727-a8df-b2fc86945209
```

Make sure to run the server with Administrator privileges to allow creation of a VPN adapter on your machine.

```bash
npm run dev use_default=distributed config_id=[NODE ID HERE]
```

If the orchestrator is already running, this should auto launch and configure the VPN connection to the Orchestrator.