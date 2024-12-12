<h4>18 June 2024 Discussion Points</h4>
1. How are IPs initially allocated?
	1. The initial installation of XR-IT must ping orchestrator to allocation IP via some API. After this, we associate IPs to machines via a unique UUID, whenever a machine changes their IP, they will notify the client via this UUID. All authentication must happen via this UUID as well.

2. Orchestrator hosting the interface vs Node instances?
	1. Orchestrator will host as this keeps a single, updated version rather than having to install updates on all Node instances. 
	   
3. Delegation of responsibilities?
	1. Delegation is made by lab. All Nodes can edit any machine in their lab. 
	2. Labs can be given the ability to manage resources on other labs via the Orchestrator configuration.
	3. The XR-IT Orchestrator has a 'master key,' it can edit any and all machine configurations / resources
	   
4. Configurations are hosted on the Orchestrator machine.
	
5. Conflict management (Orchestrator makes edits while you are editing your node)
	1. Pop up that new updates are available

7. Authentication (User, Project, Necessary) --> JWT Token
	1. For now, we will designate labs as 'users,' each lab has access to all of their lab's resources as well as any resources in other labs that they have access to.
	2. Need strong authentication for socket communication, as anyone who is on the VPN will have access to all machines on the server.
	
8. XR-IT Management of softwares (does it acknowledge management that haven't been changed on the Orchestrator?)
	1. No