<h4>Startup<h4>

Once the perquisites for running this software are complete you are ready to use the XR-IT software!

First thing to do is to open the command line and navigate to the client directory. If your XR-IT repository sits in Documents, it would look like this:

```
cd C:\Documents\XR-IT\client
```

To start the software simply run the following npm (Node Package Manager) command.

```
npm run start
```
The Client CLI should now start!

You will now be prompted with following options, type one of the following to execute those scripts.

<h4>START VPN</h4>

This is likely the script you will be using most frequently. It initiates VPN connection with the XR-IT Server machine. In our case this the Dell Server in VLAB1.

*Note: to complete this script, you must first be added as a 'user' to the Virtual Hub on the Dell Server's VPN. To do this, ask Damir to do so or see the 'ADD USER' section in '2_USING_XR-IT_Server_VPN_CLI' to do this yourself on this machine.*

You will be prompted for a number of different values. The username corresponds to which user you are trying to log into the VPN with.

The rest, can be set if you are trying to log into a VPN other than that of VLAB1, otherwise they can be left blank as the defaults are already preconfigured.

Example values:

![[1_Example_START_VPN.png]]

Once the script is executed the success or failure logs will be displayed.

<h4>SHUTDOWN VPN</h4>

Use this to shutdown an active VPN connection

Example values:

![[1_Example_SHUTDOWN_VPN.png]]

<h4>REMOVE VPN </h4>

This deletes settings for a saved VPN connection you have made based on their IP and Port. If that VPN connection is active, it will shut it down first for you.

Example values:

![[1_Example_REMOVE_VPN.png]]

<h4>MESSAGING SERVICE</h4>

Used to initiate a SocketIO connection with another XR-IT client. Will be developed further soon.

