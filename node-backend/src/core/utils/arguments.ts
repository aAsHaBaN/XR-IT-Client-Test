import { constants } from '../utils/constants.js';
const { DEFAULT_CONFIG_PATH, LATEST_DISTRIBUTED_DEVELOPMENT_CONFIG, LATEST_LOCAL_DEVELOPMENT_CONFIG, FABW_TEST_CONFIG } = constants

/* 
  Arguments supported by the XR-IT orchestrator when launching it from the CLI. See README for usage.
*/
export function getArguments() {
    const is_dev = process.argv.find(a => a?.startsWith("is_dev="))?.slice("is_dev=".length) === "true"
    var default_config = process.argv.find(a => a?.startsWith("use_default="))?.slice("use_default=".length).trim().toLowerCase();
    var config_path;

    if (default_config && default_config === 'distributed') config_path = LATEST_DISTRIBUTED_DEVELOPMENT_CONFIG
    else if (default_config && default_config === 'local') config_path = LATEST_LOCAL_DEVELOPMENT_CONFIG
    else if (default_config && default_config === 'fabw-test1') config_path = FABW_TEST_CONFIG
    else config_path = DEFAULT_CONFIG_PATH

    return {
        is_dev: is_dev,
        default_config: default_config,
        config_path: config_path,
        is_local_development: default_config === 'local'
    };
}