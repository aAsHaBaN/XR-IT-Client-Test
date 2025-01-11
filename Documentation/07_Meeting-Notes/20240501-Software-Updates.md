<h4>VPN setup and XR-IT software/scripts</h4>

1. [Documentation can be found here.](obsidian://open?vault=Documentation&file=03_XR-IT-Application%2F0_XR-IT_Software_and_VPN_Prerequisites)
2. Making it easier for now: going to use password auth for now (hardcoded password) as we do not have a client interface, rather than certificate authentication
3. Will switch over to certificate authentication when the interface is developed (code is commented out)

#### Messaging

Messaging works within the same VLAB (VLAB1), need to test from outside the VLAB and VLAB2.
<h4> Perforce </h4>

1. [Documentation can be found here.](obsidian://open?vault=Documentation&file=05_Linked-Software%2FBackend%2FPerforce%2FPerforce_Setup)
2. Works from in and outside lab––outside the lab only works with VPN100 Virtual Private Adapter, need to enable file sharing for VPN20.
3. Limit of 5 users and 20 workspaces in total. 
	1. Tentative: I have subdivided the users into four groups: admin, trl_vlab1, trl_vlab2, external.
	2. Our users, Zak, Arjo can create workspaces within those labs
	3. Want to discuss this organization further.
4. This week: read documentation on Perforce, to understand how to best administrate and organize.

<h4>NAS</h4>
1. Connecting to the NAS currently works from within VLAB1. The Dell Server has access to it and the NAS is currently setup with RAID10.
2. SoftEther is unsupported on NAS, using OpenVPN
3. Trying to enable OpenVPN on the NAS, but requires port-forwarding.

<h4> Communications workflow / MongoDB </h4>
1. [Proposal for XR-IT messaging and service discover](obsidian://open?vault=Documentation&file=03_XR-IT-Application%2FProposed%20XR-IT%20application%20workflow.canvas)
2. Started to implement MongoDB
3. Example Server DB document
4. Example Client DB document

<h4>Initial test</h4>
1. MVN Animate as next test for messaging
2. MVN UDP to Unreal UDP, with XR-IT hood on both
3. Can be hardcoded with workflow and later we can generalize

<h4>Important discussion points</h4>
1. How are we going to allow / define client to client connections. Do we:
	1. Allow any client connect to any client?
	2. Have rule sets / configurations?

2. How do we identify clients, if private IPs are non-static? Local configuration document that identifies the machine / device? Or is there a safer way to do this as users as unreliable

<h4>Important blockers</h4>
1. Cannot connect VLAB2 to VLAB1
2. SplashTop access
3. Password manager invite