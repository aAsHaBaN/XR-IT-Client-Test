const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline-sync');

// Constants
const LOG_FILE = 'xrit-client-setup.log';
const REPO_URL = 'https://github.com/aAsHaBaN/XR-IT-Client-Test.git';
const PROJECT_DIR = 'xr-it-client';
const NODE_MIDDLEMAN_APP_DIR = 'node-middleman';
const NODE_MIDDLEMAN_PORT = 2224;
const DOCKER_COMPOSE_FILE = 'docker-compose-client.yml';


// Utility: Write log messages to a file
function logToFile(message) {
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`);
}

// Utility: Styled log for terminal output
function styledLog(message, style = 'green') {
  const styledMessage = chalk[style](message);
  logToFile(message); // Log plain message to file
  console.log(styledMessage); // Styled output to console
}

// Utility: Dependency checker
function checkDependency(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    styledLog(`${name} is installed.`, 'green');
  } catch {
    styledLog(`WARNING: ${name} is not installed or not in PATH.`, 'yellow');
  }
}

// Clone or update the project repository
function cloneOrUpdateRepo() {
  if (!fs.existsSync(PROJECT_DIR)) {
    styledLog(`Cloning the repository...`, 'blue');
    execSync(`git clone ${REPO_URL} ${PROJECT_DIR}`, { stdio: 'inherit' });
  } else {
    styledLog(`Repository already exists. Pulling the latest changes...`, 'blue');
    execSync(`git -C ${PROJECT_DIR} reset --hard HEAD`, { stdio: 'inherit' });
    execSync(`git -C ${PROJECT_DIR} pull origin main`, { stdio: 'inherit' });
  }
}

// Fix line endings to prevent platform-specific issues
function fixLineEndings() {
  styledLog(`Fixing line ending issues...`, 'blue');
  execSync(`git -C ${PROJECT_DIR} config --global core.autocrlf input`, { stdio: 'inherit' });
  execSync(`git -C ${PROJECT_DIR} rm --cached -r .`, { stdio: 'inherit' });
  execSync(`git -C ${PROJECT_DIR} reset --hard HEAD`, { stdio: 'inherit' });
}


// Track the process globally
let nodeMiddlemanProcess = null;

// Start the node-middleman service
function startNodeMiddleman() {
  styledLog(`Starting node-middleman...`, 'blue');
  const appPath = path.join(PROJECT_DIR, NODE_MIDDLEMAN_APP_DIR);

  if (!fs.existsSync(appPath)) {
    styledLog(`ERROR: node-middleman directory not found.`, 'red');
    return null;
  }

  try {
    styledLog(`Installing dependencies in node-middleman directory...`, 'cyan');
    execSync('npm install', { cwd: appPath, stdio: 'inherit' });
    styledLog(`Dependencies installed successfully.`, 'green');

    styledLog(`Starting node-middleman using npm start...`, 'cyan');
    nodeMiddlemanProcess = exec('npm start', { cwd: appPath });

    nodeMiddlemanProcess.stdout.on('data', (data) => {
      styledLog(`[node-middleman stdout]: ${data.toString().trim()}`, 'gray');
    });

    nodeMiddlemanProcess.stderr.on('data', (data) => {
      styledLog(`[node-middleman stderr]: ${data.toString().trim()}`, 'red');
    });

    nodeMiddlemanProcess.on('error', (error) => {
      styledLog(`[node-middleman error]: ${error.message}`, 'red');
    });

    nodeMiddlemanProcess.on('close', (code) => {
      styledLog(`[node-middleman exited with code]: ${code}`, 'yellow');
      nodeMiddlemanProcess = null; // Clear reference on close
    });

    styledLog(`node-middleman started successfully.`, 'green');
    return nodeMiddlemanProcess;
  } catch (err) {
    styledLog(`ERROR: Failed to start node-middleman. ${err.message}`, 'red');
    return null;
  }
}

// Stop node-middleman process
function stopNodeMiddleman() {
  if (nodeMiddlemanProcess) {
    styledLog(`Stopping node-middleman...`, 'yellow');
    try {
      // Kill the process tree to ensure clean termination
      process.kill(nodeMiddlemanProcess.pid, 'SIGTERM');
      styledLog(`node-middleman stopped successfully.`, 'green');
    } catch (err) {
      styledLog(`ERROR: Failed to stop node-middleman. ${err.message}`, 'red');
    }
    nodeMiddlemanProcess = null; // Clear reference
  } else {
    styledLog(`node-middleman is not running.`, 'yellow');
  }
}

// Launch Docker containers
function launchDockerCompose() {
  styledLog(`Launching Docker containers...`, 'blue');
  const composePath = path.join(PROJECT_DIR, DOCKER_COMPOSE_FILE);

  if (!fs.existsSync(composePath)) {
    styledLog(`ERROR: Docker Compose file not found.`, 'red');
    return false;
  }

  try {
    execSync(`docker-compose -f ${composePath} up --build -d`, { stdio: 'inherit' });
    styledLog(`Docker containers launched successfully.`, 'green');
    return true;
  } catch (err) {
    styledLog(`ERROR: Failed to launch Docker containers. ${err.message}`, 'red');
    return false;
  }
}

// Stop Docker containers
function stopDockerCompose() {
  styledLog(`Stopping Docker containers...`, 'yellow');
  const composePath = path.join(PROJECT_DIR, DOCKER_COMPOSE_FILE);

  if (fs.existsSync(composePath)) {
    try {
      execSync(`docker-compose -f ${composePath} down`, { stdio: 'inherit' });
      styledLog(`Docker containers stopped successfully.`, 'green');
    } catch (err) {
      styledLog(`ERROR: Failed to stop Docker containers. ${err.message}`, 'red');
    }
  } else {
    styledLog(`Docker Compose file not found. Skipping...`, 'yellow');
  }
}

// Verify if node-middleman is running
function verifySetup() {
  try {
    styledLog(`Verifying if node-middleman is accessible on port ${NODE_MIDDLEMAN_PORT}...`, 'cyan');
    execSync(`curl -m 30 -s http://localhost:${NODE_MIDDLEMAN_PORT}/`, { stdio: 'inherit' });
    styledLog(`node-middleman is running and verified.`, 'green');
  } catch (err) {
    styledLog(`ERROR: node-middleman verification failed. ${err.message}`, 'red');
    throw new Error('Verification failed');
  }
}

// Stop all running services
function stopServices() {
  stopNodeMiddleman();
  stopDockerCompose();
}

// Restart all services
function restartServices() {
  styledLog(`Restarting services...`, 'blue');
  stopServices();
  startServices();
}

// Main start logic
function startServices() {
  styledLog(`Starting XR-IT Manager...`, 'green');

  checkDependency('docker', 'Docker');
  checkDependency('vpncmd', 'SoftEther VPN Client');
  checkDependency('git', 'Git');

  cloneOrUpdateRepo();
  fixLineEndings();

  nodeMiddlemanProcess = startNodeMiddleman();
  if (!nodeMiddlemanProcess) {
    styledLog(`Setup failed.`, 'red');
    return;
  }

  const dockerSuccess = launchDockerCompose();
  if (dockerSuccess) {
    verifySetup();
    styledLog(`All services started successfully.`, 'green');
  }
}

function stopNodeMiddleman() {
  if (nodeMiddlemanProcess) {
    styledLog(`Stopping node-middleman...`, 'yellow');
    try {
      // Kill the process group to ensure all spawned child processes are terminated
      process.kill(-nodeMiddlemanProcess.pid, 'SIGTERM');
      styledLog(`node-middleman stopped successfully.`, 'green');
    } catch (err) {
      styledLog(`ERROR: Failed to stop node-middleman. ${err.message}`, 'red');
    } finally {
      nodeMiddlemanProcess = null; // Clear reference
    }
  } else {
    styledLog(`node-middleman is not running.`, 'yellow');
  }

  // Check and forcefully clean the port
  if (isPortInUse(NODE_MIDDLEMAN_PORT)) {
    styledLog(`Port ${NODE_MIDDLEMAN_PORT} is still in use. Attempting to release...`, 'yellow');
    try {
      // Get PID of the process occupying the port
      const result = execSync(`netstat -ano | findstr :${NODE_MIDDLEMAN_PORT}`).toString();
      const pid = result.match(/\d+$/)[0];
      execSync(`taskkill /IM ${pid} /T /F`, { stdio: 'inherit' });
      styledLog(`Port ${NODE_MIDDLEMAN_PORT} released successfully.`, 'green');
    } catch (err) {
      styledLog(`ERROR: Failed to release port ${NODE_MIDDLEMAN_PORT}. ${err.message}`, 'red');
    }
  }
}

// Exit the application forcefully
function exitApplication() {
  styledLog(`Exiting XR-IT Client Manager.`, 'yellow');
  stopServices(); // Stops node-middleman and Docker containers
  cleanupPort(NODE_MIDDLEMAN_PORT); // Clean up port if necessary
  styledLog(`Goodbye!`, 'cyan');

  process.exit(0); // Exit cleanly
}



// Display the menu
function displayMenu() {
  let shouldExit = false;

  while (!shouldExit) {
    console.clear();
    console.log(chalk.cyan(`\nXR-IT Client Manager Menu`));
    console.log(chalk.cyan(`1. Start Services`));
    console.log(chalk.cyan(`2. Stop Services`));
    console.log(chalk.cyan(`3. Restart Services`));
    console.log(chalk.cyan(`4. Exit`));

    const choice = readline.question('Select an option: ');

    switch (choice) {
      case '1':
        styledLog(`Starting services...`, 'green');
        startServices();
        break;
      case '2':
        styledLog(`Stopping services...`, 'yellow');
        stopServices();
        break;
      case '3':
        styledLog(`Restarting services...`, 'blue');
        restartServices();
        break;
      case '4':
        exitApplication(); // Call the exit function
        break; // Ensure loop is exited in case of errors
      default:
        console.log(chalk.red('Invalid option. Please select again.'));
    }

    if (!shouldExit) {
      console.log(chalk.cyan('\nPress Enter to return to the menu...'));
      readline.question();
    }
  }
}

// Main function
async function main() {
  try {
    displayMenu();
  } catch (err) {
    styledLog(`Fatal error: ${err.message}`, 'red');
    stopServices(); // Cleanup before exiting
    process.exit(1);
  }
}

main();

function isPortInUse(port) {
  try {
    execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
    return true; // Port is still in use
  } catch {
    return false; // Port is not in use
  }
}

function cleanupPort(port) {
  styledLog(`Checking port ${port} for lingering processes...`, 'yellow');
  try {
    const output = execSync(`netstat -ano | findstr :${port}`).toString();
    const pids = [...new Set(output.match(/\d+$/gm))]; // Extract PIDs
    styledLog(`Found processes on port ${port}: ${pids.join(', ')}`, 'blue');
    pids.forEach((pid) => {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
        styledLog(`Killed process ${pid} on port ${port}.`, 'green');
      } catch (err) {
        styledLog(`ERROR: Could not kill process ${pid}: ${err.message}`, 'red');
      }
    });
  } catch {
    styledLog(`No processes found on port ${port}.`, 'green');
  }
}

