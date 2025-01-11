import { constants } from "../utils/constants.js";
import * as fs from "fs";
import crypto from "crypto";
import { SocketException } from "../utils/SocketException.js";
import { INodeConfig } from "../models/NodeConfig.js";

const { CONFIG_DIR, DEFAULT_CONFIG_PATH } = constants;

/* 
  Loads and returns all Node configurations, accepts a configuration path. For development purposes, 
  rather than using a configuration file with a list of potential configurations, we have a series
  of 'development configurations.' With this, this function accepts a configuration file path, 
  if none is provided we use the default configuration location at config > xrit-node-config.json
*/
export async function getNodeConfigurations (config_path?: string): Promise<INodeConfig[]> {
  if ((!config_path || config_path === DEFAULT_CONFIG_PATH) && !fs.existsSync(DEFAULT_CONFIG_PATH)) {
    console.log("!!! No previous config exists !!!\n");

    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR);
    }

    const emptyConfigs = JSON.stringify([]);
    fs.writeFileSync(DEFAULT_CONFIG_PATH, emptyConfigs);
    console.log("Initialized new VPN configuration file\n");
    return [];
  } else {
    try {
      config_path = config_path ? config_path : DEFAULT_CONFIG_PATH
      const file_data = fs.readFileSync(config_path);
      const node_configs = JSON.parse(file_data.toString()) as INodeConfig[];
      return node_configs;
    } catch (e) {
      throw new SocketException((e as Error).message);
    }
  }
};

/* 
  Loads and a single config which matches a provided id, also accepts a configuration path 
  (used for development for default configurations) otherwise, we use the default configuration 
  location at config > xrit-node-config.json
*/
export async function getNodeConfiguration (id: string, config_path?: string): Promise<INodeConfig | undefined> {
  const vpn_configs = await getNodeConfigurations(config_path);
  const config = vpn_configs.find((c) => c.id === id);

  return config;
};

/* 
  Writes a configuration to the Node configuration path, accepts an option configuration path to write to
  (used for development for default configurations) otherwise, we use the default configuration 
  location at config > xrit-node-config.json
*/
export async function writeConfiguration (config: INodeConfig, config_path?: string): Promise<INodeConfig> {
  if (!config.id) config.id = crypto.randomUUID();;

  var node_configs = await getNodeConfigurations(config_path);
  node_configs.push(config);

  var configFile = JSON.stringify(node_configs);
  var write_path = config_path ? config_path : DEFAULT_CONFIG_PATH;

  fs.writeFileSync(write_path, configFile);

  return config;
};

/* 
  Removes a configuration to the Node configuration path, accepts an option configuration path to remove from
  (used for development for default configurations) otherwise, we use the default configuration 
  location at config > xrit-node-config.json
*/
export async function removeConfiguration (id: string, config_path?: string): Promise<Boolean> {
  const node_configs = await getNodeConfigurations(config_path);
  if(!node_configs.some(n => n.id === id)) {
    throw new SocketException(`No configuration with id ${id} exists on this node.`)
  }

  const filtered_configs = node_configs.filter((c) => c.id != id);
  const updated_file_data = JSON.stringify(filtered_configs);

  var write_path = config_path ? config_path : DEFAULT_CONFIG_PATH;
  fs.writeFileSync(write_path, updated_file_data);
  return true;
};
