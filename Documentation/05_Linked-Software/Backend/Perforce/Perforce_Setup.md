<h4>Prerequisites</h4>

1. Install the [P4V Client](https://www.perforce.com/downloads/helix-visual-client-p4v)
2. Connect to the Dell Server via VPN, [following the steps found here](obsidian://open?vault=Documentation&file=05_Linked-Software%2FBackend%2FVPN%2FUsing_SoftEther_Client) or [using the XR-IT VPN scripts.
](obsidian://open?vault=Documentation&file=03_XR-IT-Application%2F1_Using_XR-IT_Client_VPN_CLI)

<h4></h4>
<h4>Connecting</h4>
Once connected to the VPN, use 192.168.100.1 of the Dell Server and port 1666 to connect to the Perforce depot. Due to the limitation of 5 users per account, users are currently distributed across labs (trl_vlab1, trl_vlab2, EXTERNAL). Workspaces can be created within these accounts for each user in the lab.

Login example:

