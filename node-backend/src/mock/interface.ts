// Small sandbox to test socket interface commands
import { io } from "socket.io-client";

const ip = "";
const port = 1194;
const socket = io(`http://${ip}:${port}/interfaces`, {
  reconnectionDelayMax: 10000,
});

console.log(`Interface: attempting to connect to ${ip} on port ${port}\n`);

const onConnection = function () {
  console.log('Interface: front end interface to local Node.\n');

  const orchestrator_public_static_ip = '192.87.95.201';
  const this_machine_name = 'Arkans PC';
  const this_machine_services = ["MVN", "UNREAL_ENGINE"];
  const user = { name: "damika", password: "test" }

  console.log('Sending request to register new node with Orchestrator\n')

  socket.emit('register-orchestrator-connection',
    orchestrator_public_static_ip,
    this_machine_name,
    this_machine_services,
    user.name,
    user.password
  )
}

const onRegistered = function (configs: any) {
  console.log('Interface: node has been registered with the Orchestrator!');
  console.log('Interface: new Node conifugration')
  console.log(configs[configs.length - 1]);
  console.log();

  const config_id = configs[configs.length - 1].id

  console.log('Interface: sending request to connect to the Orchestrator with new configuration.')
  socket.emit('start-orchestrator-connection', config_id);
}

socket.on("connect", onConnection);
socket.on("node-configs", onRegistered)
socket.connect();
