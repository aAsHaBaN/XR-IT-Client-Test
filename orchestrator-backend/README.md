This page covers dependency installation and usage of the XR-IT Orchestrator.

### Dependencies

To use the Orchestrator backend please install the following dependencies:

- [SoftEther Server AND SoftEther Client](https://www.softether-download.com/en.aspx?product=softether)
- [Node.js](https://nodejs.org/en)
- [PostgresSQL (once authentication functionality is complete)](https://www.postgresql.org/)

Once these software dependencies are installed, please open a command prompt within the Orchestrator backend directory and install the npm dependencies, using the following command:

```bash
npm install
```

### .env

To use authentication in this application you will need to reate a .env file in the /orchestrator-backend and have the contents:
```
DB_USER="postgres"
DB_HOST="localhost"
DB_PASSWORD="(your password)"
DB_PORT=5432
```

### Allow PowerShell scripts to run

By default, Windows machines prohibit PowerShell scripts from being run automatically be external programs. XR-IT uses PowerShell scripts to interface with a number of Windows settings and manage SoftEther VPN. To bypass this, open PowerShell **as an administrator** and run the following command:

```powershell
Set-ExecutionPolicy remotesigned
```

If you would like to reset this after you are done with XR-IT, run the following command in an PowerShell app with administrator privileges:

```powershell
Set-ExecutionPolicy restricted
```

### Usage

The Orchestrator backend supports arguments when launched through the command-line. These are defined in the following file:

```powershell
orchestrator-backend/src/core/utils/arguments.ts
```

Currently the supported arguments are as follows:

```tsx
/* Toggles whether VPN management scripts are executed. 
A value of false would be assigned if the XR-IT network is being run
on a single machine rather than across a network, for development or testing.
If argument is not provided, a default value of false is assigned. */
start_vpn: boolean

/* Toggles whether authentication and PostGresDB is enabled when using the XR-IT
netowkr. NOTE: That if authentication is NOT enabled then we use hardcoded
values when registering a new Node with XR-IT. The current hardcoded values
correspond to registering a new node with the XR-IT Development Configuration.
If you are using a different configuration, use authentication or change the hardcoded
value, otherwise you will run into issues. Please refer to the file below for more info:

orchestrator-backend > src > core > controllers > nodes.ts
*/
use_auth: boolean
```

### Starting the Orchestrator

To start the Orchestrator, run the following command at the root of the Orchestrator directory:

```powershell
npm run dev start_vpn=<true|false>
```