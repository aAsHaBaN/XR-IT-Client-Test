<h2>0. Downloads </h2>

We will be running three machines for this test. All will need to have the following:

- [XR-IT repository](https://dev.azure.com/TransRealities/_git/XR-IT)
- [SoftEther VPN Client and CLI](https://www.softether.org/5-download)
- [Node.js](https://nodejs.org/en/download/package-manager/current)
- [Git](https://git-scm.com/downloads)

<h3>Orchestrator (Dell Rack) – <i>already configured</i></h3>

The first (Orchestrator) will be running in the lab on the Dell Rack. This machine will be preconfigured and running, but it would be good to have Splashtop access to make sure we can ensure everything is running properly.

- [SoftEther VPN Server](https://www.softether.org/5-download)
- [Splashtop](https://www.splashtop.com/downloads)

<h3>DAE-PINK</h3>

One of two machines that we are taking to Finland. This machine will be running MVN.

- [MVN Animate](https://www.movella.com/support/software-documentation)

<h3>DAE-GREEN</h3>

Second machine that we are taking to Finlad. This machine will be running Unreal Engine and the XR-IT Plugin.

- [Unreal Engine](https://www.unrealengine.com/en-US/download)
<br/><br/>
---
<h2>1. Repository setup</h2>

Once you have downloaded all the prerequisites, we will need to checkout the correct branch of the XR-IT repository which contains the source code specific to the Finland test.

In a command line navigate to the root directory of the XR-IT repository and checkout the correct branch using git. The command will be as follows:

```
git checkout damir/feature/JulySpring-Presentation
```

We will now need to install the dependencies for each repository.

<b>Orchestrator</b>

This should be done on the orchestrator, but incase, you will want to execute the following commands from the root directory:

```
cd orchestrator-frontend 
npm i 
cd ../orchestrator-backend 
npm i
```

<b> Nodes </b>

For each of the node you will want to install the dependencies for the Node backend. To do this, from the root directory:

```
cd node-backend 
npm i
```
<br/>

---

<h2>Configuration files</h2>


Finally, we will have to update the VPN configuration files as we are using them outside the lab. I have preset these, but the VPN configurations for DAE-GREEN and DAE-PINK are as follows:

```
[
    {
        "id": "6925669e-043e-4654-af79-d36c8518ee43",
        "account": {
            "name": "XRIT",
            "ip": "192.87.95.201",
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
    },
    {
        "id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
        "account": {
            "name": "XRIT",
            "ip": "192.87.95.201",
            "port": 5555,
            "username": "damika",
            "password": "test"
        },
        "adapter": {
            "ip": "192.168.20.205",
            "name": "VPN20"
        },
        "orchestrator_socket": {
            "ip": "192.168.20.1",
            "port": 2222
        }
        
    }
][
    {
        "id": "6925669e-043e-4654-af79-d36c8518ee43",
        "account": {
            "name": "XRIT",
            "ip": "192.87.95.201",
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
    },
    {
        "id": "f2690fd1-3f31-4727-a8df-b2fc86945209",
        "account": {
            "name": "XRIT",
            "ip": "192.87.95.201",
            "port": 5555,
            "username": "damika",
            "password": "test"
        },
        "adapter": {
            "ip": "192.168.20.205",
            "name": "VPN20"
        },
        "orchestrator_socket": {
            "ip": "192.168.20.1",
            "port": 2222
        }
        
    }
]
```