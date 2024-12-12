import { Socket } from "socket.io";
import { LabService } from "../../services/LabService";
import { randomUUID } from "crypto";
import { ILab, Lab } from "../../models/Lab";
import InterfacesNamespace from "../../namespaces/InterfacesNamespace";
import { SocketException } from "../../utils/SocketException";
import { NodesService } from "../../services/NodesService";
import { inspect } from "util";

export default (socket: Socket, lab_service: LabService, nodes_service: NodesService) => {
    const onAddLab = function (lab_config: ILab) {
        try {
            console.log(`\x1b[36mReceived request to add lab to this Orchestrator.\x1b[0m\n`)
            if (!lab_config) throw new SocketException(`Must define a lab to add to the Orchestrator.`)

            lab_config.id = randomUUID();
            const lab = new Lab(lab_config);
            lab_service.addLab(lab);

            InterfacesNamespace.emitConfigUpdate();
            console.log(`\x1b[4m\x1b[32mAdded a new lab to this Orchestrator.'\x1b[0m`)
            console.log(`${inspect(lab, false, null, true)}`)
            console.log()
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    const onUpdateLab = function (id: string, lab_config: ILab) {
        try {
            console.log(`\x1b[36mReceived request to update lab on this Orchestrator.\x1b[0m\n`)
            if (!id) throw new SocketException(`Must provide the id of the lab to update.`)
            if (!lab_config) throw new SocketException(`Must define a lab to add to the Orchestrator.`)

            const lab = new Lab(lab_config);
            lab_service.updateLab(id, lab);
            InterfacesNamespace.emitConfigUpdate()

            console.log(`\x1b[4m\x1b[32mUpdated lab ${lab.name} from this Orchestrator.'\x1b[0m`)
            console.log(`${inspect(lab, false, null, true)}`)
            console.log()
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    const onRemoveLab = function (id: string) {
        try {
            console.log(`\x1b[36mReceived request to remove lab on this Orchestrator.\x1b[0m\n`)

            if (!id) throw new SocketException(`Must provide the id of the lab to update.`)
            const lab_contains_nodes = nodes_service.nodes.some(n => n.lab_id === id);
            if (lab_contains_nodes) {
                throw new SocketException(`Cannot delete lab as some Nodes belong to this lab. Please delete them first before completing this operation.`)
            }

            lab_service.removeLab(id);
            InterfacesNamespace.emitConfigUpdate()

            console.log(`\x1b[33mRemoved lab with '${id}' from this Orchestrator.'\x1b[0m\n`)
        } catch (e) {
            socket.emit('error', (e as SocketException).message);
        }
    }

    socket.on("add-lab", onAddLab);
    socket.on("remove-lab", onRemoveLab);
    socket.on("update-lab", onUpdateLab);
}