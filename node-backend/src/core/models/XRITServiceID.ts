export type XRITServiceID = (typeof software_ids)[number];
const software_ids = [
    "MVN",
    "METAQUEST",
    "OPTITRACK",
    "ULTRAGRID_SEND",
    "ULTRAGRID_RECEIVE",
    "UNREAL_ENGINE",
    "UNREAL_ENGINE_CHARACTER",
    "UNREAL_ENGINE_HMD",
    "UNREAL_ENGINE_CAMERA",
    "UNREAL_ENGINE_BLACKMAGIC_SEND",
    "UNREAL_ENGINE_ULTRAGRID_SEND",
] as const;

export const isValidServiceId = (service: any) => {
    return software_ids.includes(service);
};