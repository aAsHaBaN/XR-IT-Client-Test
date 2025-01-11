Once the prerequisites have been completed (see this page), we are ready to run the test! This can be done in four steps.

<h2>0. Opening programs</h2>

- On DAE-GREEN, open Unreal Engine with the XR-IT plugin

---

<h2>1. Launching the Orchestrator</h2>

Again, we need to decide wether we will leave this running or launch it from Splashtop. If the latter, to launch the orchestrator we will need to open a command line and navigate to the root directory of XR-IT. From there, we will run a command which launches the front and backend.

```
cd orchestrator-backend 
npm run demo
```
Because both the Frontend and Backend are running concurrently, you will see output for both here. Backend logs are prefixed with [BE] and the Frontend with [FE]

---

<h2> 2. Connecting the first node and opening the interface </h2>

Now that the Orchestrator machine is running XR-IT and the VPN server, we can now connect the Node machines (DAE-PINK and DAE-GREEN). We will need to do this on a cmd on each of these machines based on scripts that I have made respectively for each.

For DAE-PINK (the machine running MVN), navigate to node-backend directory and run the appropriate script:

```

cd node-backend/
npm run start-pink
```

Once you get a message in the CMD that it has connected you can now open the XR-IT interface from this machine at:

http://192.168.20.1:3000

You should see that DAE-PINK is connected, but DAE-GREEN is not connected.

---

<h2>3. Connecting the second node</h2>

Similarly to connect the second node, run the appropriate script for DAE-GREEN (machine running Unreal) from a cmd on that computer

```
cd node-backend 
npm run start-green
```
You should now see in the interface that DAE-GREEN has connected! If you want you can also open an interface at the same endpoint on this machine as well.

---

<h2>4. Launching MVN</h2>

Now time to run the lat part of the test. Simply click and drag from the node that says 'Stream 1' on DAE-PINK to the node that says 'Port 8764' on DAE-GREEN.

MVN should now launch on DAE-PINK and add the network stream endpoint and the LiveLink stream should be created in Unreal Engine on DAE-GREEN.