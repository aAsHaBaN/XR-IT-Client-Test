import InterfacesNamespace from "../namespaces/InterfacesNamespace";
import { ConfigurationService } from "../services/ConfigurationService";
import { NodesService } from "../services/NodesService";
import { Request, Response } from "express";
import { SoftEtherServer } from "../services/SoftEtherService";

export class NodesController {
    constructor(private nodes_service: NodesService) { }

    registerNode(req: Request, res: Response) {
        /* 
          TO DO: 
          Once the database work is complete, we will check the user credentials provided by
          the Node against the PostGres DB. We will use the matching ID to determine which config and and lab we will register this
          Node with. For now, we will use these hardcoded values below.
        */
        const config_id = "8bfa88c3-6a34-4ca6-a229-ccc66fde82a6" // Configuration user belongs to
        const lab_id = "b4972f36-3fb2-4905-87cc-55dc8caa11a9" // Lab that the user belongs to

        const current_config_id = ConfigurationService.getCurrentConfigurationId();
        if (current_config_id != config_id) {
            res.status(400).send(`The XR-IT network you belong to is currently offline.`)
            return
        }

        const node = this.nodes_service.registerNode(lab_id, req.body.machine_alias, req.body.services, req.body.av_inputs, req.body.av_outputs);
        const vpn = SoftEtherServer.getConfiguration();
        const node_config = NodesService.generateNodeConfig(node, vpn);
        res.status(200).send(node_config);
        InterfacesNamespace.emitConfigUpdate();
    }
}