import { SoftEtherClient } from "../models/SoftEther.js";
import { constants } from "../utils/constants.js";
import runPowershell from "../utils/powershell/runPowershell.js";

const {
  SOFTETHER_CREATE_VPN_ADAPTER_SCRIPT_PATH,
  SOFTETHER_CREATE_VPN_ACCOUNT_SCRIPT_PATH,
  SOFTETHER_REMOVE_VPN_ACCOUNT_SCRIPT_PATH,
  SOFTETHER_STARTUP_VPN_SCRIPT_PATH,
  SOFTETHER_SHUTDOWN_VPN_SCRIPT_PATH,
  SOFTETHER_REMOVE_VPN_ADAPTER_SCRIPT_PATH
} = constants;

const createVPNSetting = async (vpn: SoftEtherClient) => {
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

const removeVPNSetting = async (vpn_name: string) => {
  const remove_vpn_args = [{ name: "accountName", val: vpn_name }];
  await runPowershell(SOFTETHER_REMOVE_VPN_ACCOUNT_SCRIPT_PATH, remove_vpn_args);
};

const removeVPNAdapter = async (adapter_name: string) => {
  const remove_vpn_args = [{ name: "adapterName", val: adapter_name }];
  await runPowershell(SOFTETHER_REMOVE_VPN_ADAPTER_SCRIPT_PATH, remove_vpn_args);
};

const startupVPN = async (vpn_name: string) => {
  const startup_args = [{ name: "accountName", val: vpn_name }];
  await runPowershell(SOFTETHER_STARTUP_VPN_SCRIPT_PATH, startup_args);
};

const shutdownVPN = async (vpn_name: string) => {
  const shutdown_args = [{ name: "accountName", val: vpn_name }];
  await runPowershell(SOFTETHER_SHUTDOWN_VPN_SCRIPT_PATH, shutdown_args);
};

export {
  createVPNSetting,
  removeVPNSetting,
  startupVPN,
  shutdownVPN,
  removeVPNAdapter
};
