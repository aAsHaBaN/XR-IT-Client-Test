const base_dir_paths = {
  xrit_config: build_path("./config"),
  soft_ether_scripts: build_path("/src/core/utils/softether/"),
};

export const constants = Object.freeze({
  // Config location
  XRIT_CONFIGS_DIR: base_dir_paths.xrit_config,
  XRIT_LATEST_DEVELOPMENT_CONFIG: build_path(`${base_dir_paths.xrit_config}/sample-configs/xrit-development-config.json`),

  //Token delimiting start of JSON returned by PS script
  POWERSHELL_RETURN_START_DELIMITER: "<PS-SCRIPT-RETURN>",

  // Default ports
  DEFAULT_SOCKET_PORT: 1194,
  DEFAULT_VPN_PORT: 5555,
  IP_MIN: "192.168.20.1", // Minimum for the IP range that Nodes in this network can be assigned.
  IP_MAX: "192.168.20.255", // Maximum for the IP range that Nodes in this network can be assigned.

  // SoftEther script paths
  SOFTETHER_SCRIPTS_DIR: base_dir_paths.soft_ether_scripts,
  SOFTETHER_ADD_USER_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}"VPNServer-AddUser.ps1"`,
  SOFTETHER_CREATE_HUB_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}"VPNServer-CreateHub.ps1`,
  SOFTETHER_DELETE_HUB_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNServer-DeleteHub.ps1`,
  SOFTETHER_GET_HUB_INFO_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNServer-GetHubInfo.ps1`,
  SOFTETHER_ISSUE_CERT_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNServer-IssueCert.ps1`,
  SOFTETHER_REMOVE_USER_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNServer-RemoveUser.ps1`,
  SOFTETHER_START_HUB_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNServer-StartHub.ps1`,
  SOFTETHER_STOP_HUB_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNServer-StopHub.ps1`,
  SOFTETHER_START_CLIENT_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNClient-Startup.ps1`,
  SOFTETHER_STOP_CLIENT_SCRIPT_PATH: `${base_dir_paths.soft_ether_scripts}VPNClient-Shutdown.ps1`,
});

export function build_path(path: string) {
  if (process.platform === "win32") {
    return path.replace(/\//g, "\\");
  }
  return path;
}
