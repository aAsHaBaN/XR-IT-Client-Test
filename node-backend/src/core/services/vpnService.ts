import axios from "axios";
import { SoftEtherClient } from "../models/SoftEther.js";
import { getArguments } from "../utils/arguments.js";
import { constants } from "../utils/constants.js";
import runPowershell from "../utils/powershell.js";

const {
  EXPRESS_BASE_URL,
  SOFTETHER_CREATE_VPN_ADAPTER_SCRIPT_PATH,
  SOFTETHER_CREATE_VPN_ACCOUNT_SCRIPT_PATH,
  SOFTETHER_REMOVE_VPN_ACCOUNT_SCRIPT_PATH,
  SOFTETHER_STARTUP_VPN_SCRIPT_PATH,
  SOFTETHER_SHUTDOWN_VPN_SCRIPT_PATH,
  SOFTETHER_REMOVE_VPN_ADAPTER_SCRIPT_PATH
} = constants;

/*
  VPN Service functions which manage the SoftEther VPN Client on this machine. Note, 
  given that these scripts manage the Windows machine that the XR-IT node is running on,
  we must use powershell scripts to manage these applications. If this application is running
  in development mode, we can run the scripts directly. Otherwise, we must contact the node-middleman
  application through an express client as this application will be running in a Docker container.
*/

// Creates a new VPN setting in SoftEther VPN Client
export async function createVPNSetting(vpn: SoftEtherClient) {
  try {
    var response;
    if (getArguments().is_dev) {
      response = await _createVPNSetting(vpn);
      console.log('VPN setting created\n');
    } else {
      response = await axios.post(`${EXPRESS_BASE_URL}/vpn`, { vpn });
      console.log('VPN setting created:', response.data);
    }

  } catch (error: any) {
    console.error('Error creating VPN setting:', error.message);
  }
}

// Removes a VPN setting in SoftEther VPN Client
export async function removeVPNSetting(vpnName: string) {
  try {
    if (getArguments().is_dev) {
      await _removeVPNSetting(vpnName);
      console.log('VPN setting removed\n');
    } else {
      const response = await axios.delete(`${EXPRESS_BASE_URL}/vpn`, { data: { vpnName } });
      console.log('VPN removed:', response.data);
    }

  } catch (error: any) {
    console.error('Error starting VPN:', error.message);
  }
}

// Removes a VPN adapter in the network settings on this machine
export async function removeVPNAdapter(adapterName: string) {
  try {
    if (getArguments().is_dev) {
      await _removeVPNAdapter(adapterName);
      console.log('VPN adapter removed\n');
    } else {
      const response = await axios.post(`${EXPRESS_BASE_URL}/vpn/remove-addapter`, { adapterName });
      console.log('VPN adapter removed:', response.data);
    }
  } catch (error: any) {
    console.error('Error starting VPN:', error.message);
  }
}

// Starts a VPN client connection
export async function startupVPN(vpnName: string) {
  try {
    var response;
    if (getArguments().is_dev) {
      response = await _startupVPN(vpnName);
      console.log('VPN started\n');
    } else {
      const response = await axios.post(`${EXPRESS_BASE_URL}/vpn/start`, { vpnName });
      console.log('VPN started:', response.data);
    }
  } catch (error: any) {
    console.error('Error starting VPN:', error.message);
  }
}

// Shuts down a VPN client connection
export async function shutdownVPN(vpnName: string) {
  try {
    if (getArguments().is_dev) {
      await _shutdownVPN(vpnName);
      console.log('VPN setting shutdown\n');
    } else {
      const response = await axios.post(`${EXPRESS_BASE_URL}/vpn/stop`, { vpnName });
      console.log('VPN shutdown:', response.data);
    }
  } catch (error: any) {
    console.error('Error starting VPN:', error.message);
  }
}

// INTERNAL POWERSHELL HELPER FUNCTIONS BELOW

// Runs a powershell script which leverages the SoftEther VPN Client's vpncmd CLI to create
// a new VPN client setting. Additionally it creates a new VPN adapter in the machine's network
// settings, so the machine can use a static IP within the VPN network.
async function _createVPNSetting (vpn: SoftEtherClient) {
  const create_adapter_args = [
    { name: "adapterName", val: vpn.adapter.name },
    { name: "adapterIP", val: vpn.adapter.ip },
    { name: "subnetMask", val: vpn.adapter.subnet },
  ];

  await runPowershell(SOFTETHER_CREATE_VPN_ADAPTER_SCRIPT_PATH, create_adapter_args);

  const create_vpn_args = [
    { name: "username", val: vpn.username },
    { name: "password", val: vpn.password }, // Remove password when certificates are implemented
    { name: "accountName", val: vpn.name },
    { name: "hostName", val: `${vpn.ip}:${vpn.port}` },
    { name: "hubName", val: vpn.name },
    { name: "adapterName", val: vpn.adapter.name },
  ];

  await runPowershell(SOFTETHER_CREATE_VPN_ACCOUNT_SCRIPT_PATH, create_vpn_args);
};

// Runs a powershell script which leverages the SoftEther VPN Client's vpncmd CLI to remove
// a VPN client setting
async function _removeVPNSetting(vpn_name: string) {
  const remove_vpn_args = [{ name: "accountName", val: vpn_name }];
  await runPowershell(SOFTETHER_REMOVE_VPN_ACCOUNT_SCRIPT_PATH, remove_vpn_args);
};

// Runs a powershell script which leverages the SoftEther VPN Client's vpncmd CLI to remove
// a VPN adapter
async function _removeVPNAdapter(adapter_name: string) {
  const remove_vpn_args = [{ name: "adapterName", val: adapter_name }];
  await runPowershell(SOFTETHER_REMOVE_VPN_ADAPTER_SCRIPT_PATH, remove_vpn_args);
};

// Runs a powershell script which leverages the SoftEther VPN Client's vpncmd CLI to start
// a VPN client connection
async function _startupVPN(vpn_name: string) {
  const startup_args = [{ name: "accountName", val: vpn_name }];
  await runPowershell(SOFTETHER_STARTUP_VPN_SCRIPT_PATH, startup_args);
};

// Runs a powershell script which leverages the SoftEther VPN Client's vpncmd CLI to stop
// a VPN client connection
async function _shutdownVPN(vpn_name: string) {
  const shutdown_args = [{ name: "accountName", val: vpn_name }];
  await runPowershell(SOFTETHER_SHUTDOWN_VPN_SCRIPT_PATH, shutdown_args);
};