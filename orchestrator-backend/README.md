# XR-IT - Orchestrator Backend

## Install dependencies

First, install the dependencies:
```bash
npm install
```

## Orchestrator configuration files

XR-IT orchestrators use configuration files stored on the orchestrator to manage vpn settings, connected notes, streams and so forth. These configuration files are stored in: 

```
orchestrator-backend > config
```

For development purposes, XR-IT comes with a default 'working configuration.' If you wish to develop using this configuration file, no additional steps are needed. Alternatively, you can create your own configuration file manually (front-end support for configuration management is currently being developed). [To do this, please reference the configuration documentation.](https://www.notion.so/Configurations-3ada50b762c3401e8f8cd2d54b14eaab?pvs=4)


## Running XR-IT on a single machine

If you would like to develop for XR-IT on a single machine (you are using mock nodes or your nodes are on the same machine as the Orchestrator), this requires no additional setup. To run using the default XR-IT development config, run:

```bash
npm run dev
```

If you have created a unique configuration for your setup, specify the configuration file in the npm script as follows:

```bash
npm run dev config_file=file_name_here.json
```

## Running with live Nodes

Running a live instance of XR-IT (nodes across machines and / or networks) requires a few additional steps.

### VPN install

To run with with live Nodes you will need to setup a VPN server on a Windows machine or VM. We are using SoftEther, so you will need to install SoftEther Server, Client, and command line tools on this machine:

https://www.softether-download.com/en.aspx?product=softether

### Configuration file

If you are using the Dell Rack in the Trans Realities Lab, you can use the pre-made VPN configuration file in ```/config/sample-configs/xrit-development-config.json``` and you can skip this step.

Otherwise, running a distributed instance requires manually creating a configuration file and launching the VPN on app load as we do not yet support VPN management in the interface. To do this, please [reference this configuration documentation when creating your configuration file.](https://www.notion.so/Configurations-3ada50b762c3401e8f8cd2d54b14eaab?pvs=4). Similarly, you can find [in-depth documentation for running a live environment here.](https://www.notion.so/tdn-trl-dae/Running-a-live-environment-in-TRL-6bf3ea624e304be8a72e1008806743d7?pvs=4). 

### Running the Orchestrator

You should now run the Orchestrator with the script below and the VPN will be auto-configured, make sure to run the server with Administrator privileges to allow creation of a VPN adapter on your machine. You will need to specify that you are running the vpn in the script

```bash
npm run dev start_vpn=true
```

As above, if you have created a unique configuration for your setup, specify the configuration file in the npm script as follows:

```bash
npm run dev start_vpn=true config_file=file_name_here.json
```