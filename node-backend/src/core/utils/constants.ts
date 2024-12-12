const baseDirPaths = {
  xritConfig: build_path("./config"),
  softEtherScripts: build_path("/src/core/utils/softether/"),
};

export const constants = Object.freeze({
  // Default socket port for interface
  DEFAULT_ORCHESTRATOR_PORT: 1194,
  DEFAULT_SOCKET_PORT: 2223,
  
  // Config location
  CONFIG_DIR: baseDirPaths.xritConfig,
  DEFAULT_CONFIG_PATH: build_path(`${baseDirPaths.xritConfig}/xrit-node-config.json`),
  LATEST_LOCAL_DEVELOPMENT_CONFIG: build_path(`${baseDirPaths.xritConfig}/sample-configs/local-development-config.json`),
  LATEST_DISTRIBUTED_DEVELOPMENT_CONFIG: build_path(`${baseDirPaths.xritConfig}/sample-configs/distributed-development-config.json`),
  FABW_TEST_CONFIG: build_path(`${baseDirPaths.xritConfig}/sample-configs/trl-x-fabw-test-config.json`),

  //Token delimiting start of JSON returned by PS script
  POWERSHELL_RETURN_START_DELIMITER: "<PS-SCRIPT-RETURN>",

  // Soft Ether script paths
  SOFTETHER_SCRIPTS_FOLDER: baseDirPaths.softEtherScripts,
  SOFTETHER_GET_VPN_INFO_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-GetAccountInfo.ps1`,
  SOFTETHER_CREATE_VPN_ACCOUNT_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-CreateAccount.ps1`,
  SOFTETHER_CREATE_VPN_ADAPTER_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-CreateAdapter.ps1`,
  SOFTETHER_STARTUP_VPN_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-Startup.ps1`,
  SOFTETHER_SHUTDOWN_VPN_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-Shutdown.ps1`,
  SOFTETHER_REMOVE_VPN_ACCOUNT_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-RemoveAccount.ps1`,
  SOFTETHER_REMOVE_VPN_ADAPTER_SCRIPT_PATH: `${baseDirPaths.softEtherScripts}VPNClient-RemoveAdapter.ps1`,
});

export function build_path(path: string) {
  if (process.platform === "win32") {
    return path.replace(/\//g, "\\");
  }
  return path;
}
