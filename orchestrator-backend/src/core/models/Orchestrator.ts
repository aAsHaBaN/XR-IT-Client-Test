import { XRITError } from "./XRITError";

// Base Orchestrator settings used for identifying its configuration
export interface IBaseOrchestratorSettings {
    id: string;
    configuration_name: string;
    errors?: XRITError[]
}