import { Lab } from "../models/Lab";
import { Node } from "../models/Node";
import { SocketException } from "../utils/SocketException";
import { isGuidValid } from "../utils/validation";

// Service which maintains and manages the state of an Orchestrator's Labs.
export class LabService {
    labs: Lab[];

    constructor(labs: any[]) {
        this.labs = labs.map((l: any) => new Lab(l))
    }

    // Returns the permissions associated with a Node
    getLabPermissions(node: Node) {
        let permissions;
        if (node.lab_id) {
            const lab = this.labs.find(l => l.id === node.lab_id);

            const list_permitted_lab_names = [lab?.name];
            if (lab?.lab_permissions) {
                for (let permitted_lab_id of lab?.lab_permissions) {
                    let permitted_lab_name = this.labs.find(l => l.id === permitted_lab_id)?.name;
                    list_permitted_lab_names.push(permitted_lab_name);
                }
            }

            permissions = {
                lab: lab,
                permitted_labs: list_permitted_lab_names
            }
        } else {
            permissions = {
                lab: undefined,
                permitted_labs: []
            }
        }

        return permissions;
    }

    addLab(lab: Lab) {
        if (isGuidValid(lab.id) || !lab.name) {
            throw new SocketException(`Lab must contain a valid id and name.`)
        }

        lab.lab_permissions.forEach((p => {
            if (!isGuidValid(p) || !this.labs.some(l => l.id === p)) {
                throw new SocketException('Lab permissions must consist of ids belonging to other this.labs in this XR-IT network.')
            }
        }));

        this.labs.push(lab)
        return lab;
    }

    updateLab(id: string, lab: Lab) {
        const current_lab_index = this.labs.findIndex(l => l.id === id)
        if (current_lab_index < 0) {
            throw new SocketException(`No lab with id ${lab.id} exists on this Orchestrator`)
        }

        this.labs.splice(current_lab_index, 1);
        lab.id = id;
        this.addLab(lab);

        return lab;
    }

    removeLab(id: string) {
        // In the future we will need to delete all users in the database associated with this lab.
        return this.labs.filter(l => l.id != id)[0];
    }
}