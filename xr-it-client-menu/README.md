# XR-IT Client Manager

## Overview
XR-IT Client Manager is a script designed to streamline the initialization and management of XR-IT services, including dependency checks, repository management, and service orchestration. The script provides a user-friendly menu to start, stop, and restart XR-IT-related services.

The project includes the ability to package the script as an executable for ease of use.

---

## Features

- Clone or update the XR-IT repository.
- Fix platform-specific line ending issues.
- Install and manage dependencies for the `node-middleman` service.
- Verify if `node-middleman` is running on the expected port.
- Launch and manage Docker containers using `docker-compose`.
- Provide a menu-based interface for users to control services.

---

## Prerequisites

### For Running the Packaged `.exe`

1. **Operating System**: Windows (x64 architecture).
2. **Docker Desktop**: Ensure Docker Desktop is installed and in your system's PATH.
3. **SoftEther VPN Client**: Ensure SoftEther VPN Client is installed.
4. **Git**: Ensure Git is installed and in your system's PATH.
5. **Environment Variables**: Ensure proper paths for Docker, Git, and VPN client (if used) are set.

### For Developers

1. **Node.js**:
   - Node.js version: `<=16.x` (recommended: `16.x`).
2. **Dependencies**:
   - `chalk`
   - `child_process`
   - `fs`
   - `path`
   - `readline-sync`

---

## How to Use

### Running the Script as an Executable

1. Create a folder for xrit-client repo.
1. In the folder Download the `xrit-client-manager.exe` file.
2. Run the `.exe` file as Administrator!

### Building the Executable

If you want to build the executable yourself:

1. Install [pkg](https://www.npmjs.com/package/pkg):
   ```bash
   npm install -g pkg
   ```

2. Run the following command in the script's directory:
   ```bash
   pkg xrit-client-setup.js --output xrit-client-manager --targets node16-win-x64
   ```
   This will generate an executable file named `xrit-client-manager.exe`.

3. Distribute the generated executable to users.

### Running the Script Directly

1. Clone the repository:
   ```bash
   git clone https://github.com/aAsHaBaN/XR-IT-Client-Test.git
   cd XR-IT-Client-Test
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the script:
   ```bash
   node xrit-client-setup.js
   ```

---

## Usage Guide

### Menu Options

1. **Start Services**:
   - Checks and installs dependencies.
   - Starts the `node-middleman` service.
   - Launches Docker containers.

2. **Stop Services**:
   - Stops the `node-middleman` service.
   - Stops Docker containers.

3. **Restart Services**:
   - Stops and restarts all services.

4. **Exit**:
   - Stops all the services.
   - Exits the menu.

### Logs

Logs are stored in `xrit-client-setup.log`. Check this file for detailed logs of each operation.

---

## Developer Notes

### Editing the Script

1. Clone the repository.
2. Edit the `xrit-client-setup.js` file to adjust logic, logging, or dependency handling.

### Debugging

Run the script with Node.js for debugging:
```bash
node xrit-client-setup.js
```

### Packaging
After making changes, rebuild the executable using the provided `pkg` command.

---

## Troubleshooting

### Common Issues

1. **Command Not Found**:
   - Ensure all dependencies (Docker, Git, Node.js) are properly installed and in your PATH.

2. **Verification Failed**:
   - Check if `node-middleman` or Docker containers are running as expected.
   - Review logs in `xrit-client-setup.log` for more details.


---

## Acknowledgments

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [pkg](https://www.npmjs.com/package/pkg)

