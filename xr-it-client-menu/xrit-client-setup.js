#!/usr/bin/env node

const { execSync, spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Constants
const LOG_FILE = 'xrit-client-setup.log';
const REPO_URL = 'https://github.com/aAsHaBaN/XR-IT-Client-Test.git';
const PROJECT_DIR = 'xr-it-client';
const NODE_MIDDLEMAN_APP_DIR = 'node-middleman';
const NODE_MIDDLEMAN_PORT = 2224;
const DOCKER_COMPOSE_FILE = 'docker-compose-client.yml';

function log(message) {
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`);
  console.log(message);
}

function checkDependency(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    log(`${name} is installed.`);
  } catch {
    log(`WARNING: ${name} is not installed.`);
  }
}

function cloneOrUpdateRepo() {
  if (!fs.existsSync(PROJECT_DIR)) {
    log(`Cloning the repository...`);
    execSync(`git clone ${REPO_URL} ${PROJECT_DIR}`, { stdio: 'inherit' });
  } else {
    log(`Repository already exists. Pulling the latest changes...`);
    execSync(`git -C ${PROJECT_DIR} reset --hard HEAD`, { stdio: 'inherit' });
    execSync(`git -C ${PROJECT_DIR} pull origin main`, { stdio: 'inherit' });
  }
}

function fixLineEndings() {
  log(`Fixing line ending issues...`);
  execSync(`git -C ${PROJECT_DIR} config --global core.autocrlf input`, { stdio: 'inherit' });
  execSync(`git -C ${PROJECT_DIR} rm --cached -r .`, { stdio: 'inherit' });
  execSync(`git -C ${PROJECT_DIR} reset --hard HEAD`, { stdio: 'inherit' });
}

function startNodeMiddleman() {
  log(`Starting node-middleman...`);
  const appPath = path.join(PROJECT_DIR, NODE_MIDDLEMAN_APP_DIR);

  if (!fs.existsSync(appPath)) {
    log(`ERROR: node-middleman directory not found.`);
    return null;
  }

  execSync('npm install npm -g', { cwd: appPath, stdio: 'inherit' });
  execSync('npm install', { cwd: appPath, stdio: 'inherit' });

  const child = spawn('npm', ['start'], { cwd: appPath, detached: true, stdio: 'ignore' });
  child.unref();
  return child;
}

function launchDockerCompose() {
  log(`Launching Docker containers...`);
  const composePath = path.join(PROJECT_DIR, DOCKER_COMPOSE_FILE);

  if (!fs.existsSync(composePath)) {
    log(`ERROR: Docker Compose file not found.`);
    return null;
  }

  execSync(`docker-compose -f ${composePath} up --build -d`, { stdio: 'inherit' });
}

function verifySetup() {
  try {
    execSync(`curl -m 10 -s http://localhost:${NODE_MIDDLEMAN_PORT}/`, { stdio: 'ignore' });
    log(`Verification successful: node-middleman is running.`);
  } catch {
    log(`ERROR: node-middleman failed to start within timeout.`);
    throw new Error('Verification failed');
  }
}

function cleanUp(child) {
  if (child) {
    log(`Stopping node-middleman...`);
    process.kill(-child.pid);
  }

  log(`Stopping Docker containers...`);
  execSync(`docker-compose -f ${path.join(PROJECT_DIR, DOCKER_COMPOSE_FILE)} down`, { stdio: 'inherit' });
}

async function main() {
  log(`Starting XR-IT Manager...`);
  checkDependency('docker', 'Docker');
  checkDependency('vpncmd', 'SoftEther VPN Client');
  checkDependency('git', 'Git');

  cloneOrUpdateRepo();
  fixLineEndings();

  const nodeMiddlemanChild = startNodeMiddleman();
  if (!nodeMiddlemanChild) {
    log(`Setup failed.`);
    return;
  }

  try {
    launchDockerCompose();
    verifySetup();
    log(`All services started successfully.`);
  } catch (err) {
    log(err.message);
    cleanUp(nodeMiddlemanChild);
  }

  log(`Exiting XR-IT Manager.`);
  process.on('SIGINT', () => cleanUp(nodeMiddlemanChild));
}

main();
