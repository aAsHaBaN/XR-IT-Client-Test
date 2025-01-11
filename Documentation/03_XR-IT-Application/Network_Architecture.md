<h4>XR-IT Network Architecture</h4>
Each XR-IT Network consists of a series of Nodes and single Orchestrator. 

Each Node corresponds to a server which hosts a series of applications of interest (Unreal Engine, MVN, UltraGrid and so forth.). Clusters of Nodes and the resources they represent will be designated under the labs that they belong to. Each Node will be able to manage resources they have access to (their lab and potentially per XR-IT permissions) via XR-IT.

The Orchestrator is the server that is responsible for managing the VPN, XR-IT network permissions as well as has access to launching applications in individual nodes.
<h4>XR-IT Node</h4>
XR-IT Nodes are a single child server in the XR-IT network. Nodes comprise the XR-IT backend software which manage the applications of interest that run on the server via commands from the XR-IT orchestrator via socket communication. 

In addition the machine running the Node will have the following:

<b>XR-IT Node interface</b>

This Node interface will allow for the creation of new VPN configuration, connecting to previously configured VPNs as well as export/import of VPNs. The VPN can also be launched or shutdown from this interface. Once it is launched from XR-IT and they have successfully connected to the orchestrator, they are navigated to the Orchestrator Interface.

<b>VPN configuration file</b>

Stores previous XR-IT configuration settings. Important to note that the Node's UUID will be stored here. 

More documentation [here](obsidian://open?vault=Documentation&file=04_XR-IT-Configs%2FConfiguration_Management_Working_Document).

<h4>XR-IT Orchestrator</h4>
The Orchestrator can be seen as the parent of all Nodes in the XR-IT Network. Critically before orchestrating the allocation of resources, the Orchestrator is also responsible for the configuration of the XR-IT network itself, including what individual labs have access to, allocating IPs, system status (heartbeat), and authentication.

From there, the Orchestrator is responsible for emitting commands to Nodes in order to manage the resources of interest.

<b>Orchestration configuration file</b>

Much like the VPN configuration file on individual Nodes, the Orchestrator will save a configuration file for each XR-IT network configuration. This allows for a plug and play, where an Orchestrator can import/export configurations or be used in multiple lab setups.

More documentation [here](obsidian://open?vault=Documentation&file=04_XR-IT-Configs%2FConfiguration_Management_Working_Document).

#### XR-IT Orchestrator Interface

The XR-IT Orchestrator will have a corresponding web interface, that will be hosted on the XR-IT orchestrator machine. After connecting to the network via the local/VPN interface, users on individual Nodes, users will be navigated to this interface.

<b>Delegation of responsibilities</b>

Each lab will be responsible for managing the resources that belong to their lab. E.g. a user in lab 1 can launch / edit any software on any machine that belongs to their lab. Additionally, some labs can be granted access control over resources belonging to another lab. The orchestrator machine will be granted control over all resources across all labs.

<b>Authentication</b>

We will need robust authentication (likely JWT for all socket communications) as once a machine has access to the VPN, depending on permissions, they may have access to resources on all machines connected to the network.