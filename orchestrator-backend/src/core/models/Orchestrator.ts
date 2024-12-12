import { XRITError } from "./XRITError";

export interface IBaseOrchestratorSettings {
    id: string;
    configuration_name: string;
    errors?: XRITError[]
}