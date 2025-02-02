import { SocketException } from "../utils/SocketException";
import { isGuidValid } from "../utils/validation";

// XR-IT's permission model is based on Labs -- i.e. sub-locations / networks that comprise 
// an XR-IT network. Here, user permissions are inherited from the Lab that they belong to.
// Users have permissions over all Nodes / Services of Labs whose ids are in the 'lab_permissions'
// array of the Lab which they belong to.
export interface ILab {
  id: string;
  name: string;
  lab_permissions: string[];
}

export class Lab implements ILab {
  id: string;
  name: string;
  lab_permissions: string[];

  constructor(base: ILab) {
    if (!isGuidValid(base.id)) throw new SocketException(`${base.id} is not a valid GUID.`);
    if (!base.lab_permissions || base.lab_permissions.some((p: string) => !isGuidValid(p))) {
      throw new SocketException(`${base.lab_permissions} has an invalid GUID(s).`);
    }

    this.id = base.id;
    this.name = base.name;
    this.lab_permissions = base.lab_permissions;
  }

  static serialize(lab: ILab) {
    return {
      id: lab.id,
      name: lab.name,
      lab_permissions: lab.lab_permissions,
    };
  }
}