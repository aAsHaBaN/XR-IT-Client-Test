import { constants } from "../utils/constants";
import { writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import path from "path";
import { INode, Node } from "../models/Node";
import { IStream, Stream } from "../models/Stream";
import { ILab, Lab } from "../models/Lab";
import { IBaseOrchestratorSettings } from "../models/Orchestrator";
import { XRITError } from "../models/XRITError";
import { randomUUID } from "crypto";
import { readJSONFile, generateUniqueFileName } from "../utils/fileManagement";
import { ISoftEtherServer } from "../models/SoftEther";
import { SocketException } from "../utils/SocketException";
import { SoftEtherServer } from "./SoftEtherService";

const { XRIT_CONFIGS_DIR, XRIT_LATEST_DEVELOPMENT_CONFIG } = constants;

export class ConfigurationService {
  private static instance: ConfigurationService;
  public id: string;
  public configuration_name: string;
  public errors: XRITError[];

  private constructor(id: string, configuration_name: string) {
    this.id = id;
    this.configuration_name = configuration_name;
    this.errors = []
  }

  static getCurrentConfigurationId() {
    if (!ConfigurationService.instance) return undefined
    return ConfigurationService.instance.id;
  }

  static initialize(id: string, configuration_name: string) {
    ConfigurationService.instance = new ConfigurationService(id, configuration_name);
    return ConfigurationService.instance
  }
}

export function getConfigurations() {
  const config_maps = _loadConfigurationFiles();
  return config_maps.map(c => c.config);
}

export function getConfiguration(id: string) {
  const configs = _loadConfigurationFiles();
  const match = configs.find(c => c.config.id === id);

  if (!match) throw new Error(`No config with id '${id}' exists.`)

  return match.config;
}

// Returns Orchestrator state in clean JSON format, used for providing front end with state updates and
// for saving the Orchestrator configuration.
export function serializeState(base_settings: IBaseOrchestratorSettings, vpn: ISoftEtherServer, labs: ILab[], nodes: INode[], streams: IStream[], pending_streams: IStream[]) {
  return {
    id: base_settings.id,
    configuration_name: base_settings.configuration_name,
    vpn: SoftEtherServer.serialize(vpn),
    labs: labs.map((l) => {
      return Lab.serialize(l);
    }),
    nodes: nodes.map((n) => {
      return Node.serialize(n);
    }),
    streams: streams.map((s) => {
      return Stream.serialize(s);
    }),
    pending_streams: pending_streams.map((s) => {
      return Stream.serialize(s);
    }),
    errors: base_settings.errors
  };
}

export function uploadConfiguration(config: any): string {
  if (!config.configuration_name) throw new SocketException(`Supplied configuration is missing base configuration settings`)
  if (!config.vpn) throw new SocketException(`Supplied configuration is missing vpn settings`)
  if (!config.labs) throw new SocketException(`Supplied configuration is missing labs`)
  if (!config.nodes) throw new SocketException(`Supplied configuration is missing nodes`)
  if (!config.streams) throw new SocketException(`Supplied configuration is missing streams`);

  const preparsed_base_settings = { id: config.id, configuration_name: config.configuration_name, errors: [] }
  const { id, configuration_name, errors, vpn, labs, nodes, streams } = serializeState(preparsed_base_settings, config.vpn, config.labs, config.nodes, config.streams, [])
  const base_settings = { id: id, configuration_name: configuration_name, errors: errors }
  return saveConfiguration(base_settings, vpn, labs, nodes, streams);
}

export function saveConfiguration(config_settings: IBaseOrchestratorSettings, vpn: ISoftEtherServer, labs: ILab[], nodes: INode[], streams: IStream[]) {
  const configs = _loadConfigurationFiles();
  var match = undefined;

  if (!config_settings.id) {
    config_settings.id = randomUUID();
  } else {
    match = configs.find(c => c.config.id === config_settings.id);
  }

  if (match) {
    _saveOrchestratorConfiguration(serializeState(config_settings, vpn, labs, nodes, streams, []), match.path)
  } else {
    console.log(`\x1b[34mNo existing configuration with id ${config_settings.id} exists. Creating a new one.\n\x1b[0m`);
    const formatted_config = serializeState(config_settings, vpn, labs, nodes, streams, []) as any;
    const file_name = generateUniqueFileName(XRIT_CONFIGS_DIR, config_settings.configuration_name);
    const file_path = `${XRIT_CONFIGS_DIR}/${file_name}`
    _saveOrchestratorConfiguration(formatted_config, file_path);
  }

  return config_settings.id
}

// Loads configuration files with associated file path
function _loadConfigurationFiles(): any[] {
  const jsonsInDir = readdirSync(XRIT_CONFIGS_DIR).filter(file => path.extname(file) === '.json');
  const orchestrator_files = [];

  jsonsInDir.forEach(file => {
    const path = `${XRIT_CONFIGS_DIR}/${file}`
    orchestrator_files.push({
      config: readJSONFile(`${XRIT_CONFIGS_DIR}/${file}`),
      path: path
    });
  });

  // Latest development config is in seperate folder
  orchestrator_files.push({
    config: readJSONFile(XRIT_LATEST_DEVELOPMENT_CONFIG),
    path: XRIT_LATEST_DEVELOPMENT_CONFIG
  });

  return orchestrator_files;
}

function _saveOrchestratorConfiguration(config: any, file_path: any) {
  if (!existsSync(XRIT_CONFIGS_DIR.toString())) {
    mkdirSync(XRIT_CONFIGS_DIR.toString());
  }

  config.nodes.forEach((n: any) => {
    delete n.is_online;
    n.configurations.forEach((c: any) => {
      delete c.status
    })
  });

  config.streams.forEach((s: any) => {
    delete s.source.status;
    delete s.target.status;
  })

  delete config.pending_streams;
  const file_data = JSON.stringify(config);
  writeFileSync(file_path, file_data);
  console.log(`\x1b[32m\x1b[1mConfiguration file saved at ${file_path}\x1b[0m\n`)
}
