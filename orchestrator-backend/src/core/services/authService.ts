import { randomUUID } from "crypto";
import { Node } from "../models/Node";
import { generatePrivateKey, genPassword as saltHashPassword, issueJWT, validPassword } from "../utils/auth";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from 'path';
import { SocketException } from "../utils/SocketException";
import pg from "pg";

const green = '\x1b[32m';
const reset = '\x1b[0m';

const file_name = fileURLToPath(import.meta.url);
const dir_name = dirname(file_name);
const key_path = path.resolve(dir_name, '../../../id_rsa_priv.pem');

/*
    The Authentication Service for XR-IT. This function describes business logic for 
    Authentication within XR-IT (as opposed to general  authentication utilities which 
    are defined in /utils/auth.ts) This Authentication service is responsible for managing
    the Users database as we as validating authentication attempts.

    This class users a singleton pattern – the reason for this is to manage a single connection
    to the PostGres database across the XR-IT application. More information on this in the
    getInstance() function below.
*/
export class AuthService {
    // A static instance of the Authentication Service. Because it is a static object, the same instance
    // is shared across ALL instances of the AuthService, where ever it is used in the application. 
    // i.e. there is only one "instance", regardless how many times AuthService is created in XR-IT.
    private static instance: AuthService;
    private client: pg.Client

    // This constructor is responsible for creating a private key for the XR-IT Orchestrator (to generate JWTs)
    // Additionally, it creates a PostGres client connection.
    constructor() {
        generatePrivateKey(key_path)
        this.client = new pg.Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
        });
    }

    // As described above, this is the implementation of the Singleton pattern for this object. 
    // Here's how it works:
    //
    // The first time that the getInstance() function is called, the "instance" of AuthService
    // has never been created. With this, we define the static variable which is shared across the
    // entire application and connect to the PostGres connection.
    //
    // The next time that the getInstance() function has been called, we have already created and
    // set the instance object. With this, we can simply return the static variable which was already
    // created.
    static async getInstance(): Promise<AuthService> {
        // If authentication instance already exists, return the static variable
        if (AuthService.instance) return AuthService.instance;

        try {
            // If authentication service has not been created do so
            AuthService.instance = new AuthService();
            // Connect to the PostGres database
            AuthService.instance.connectClient().then(() => {
                console.log(`${green}Authentication service initialized!\n${reset}`)
            })

        } catch (e) {
            throw new SocketException(`Error connecting PostGres Client: ${(e as Error).message}`);
        }

        return AuthService.instance;
    }

    // Function responsible for connecting to the PostGres database
    async connectClient() {
        try {
            await this.client.connect()
            console.log(`${green}Connected to database${reset}`);

            await this.client.query(`
              CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(36) UNIQUE NOT NULL,
                lab_id VARCHAR(36),
                salt VARCHAR(32) NOT NULL,
                hash VARCHAR(255) NOT NULL,
                configuration_id VARCHAR(36) NOT NULL,
              )
            `);
            console.log(`${green}Users table created or exists${reset}\n`);
        } catch (err) {
            console.error("Database connection error:", (err as Error).message);
        }
    }

    // Validates a username and password against what is saved in the PostGres DB.
    // If successful, a JWT token is issued.
    async getJWT(username: string, password: string) {
        if (!username || !password) {
            throw new Error("Please provide both username and password.");
        }

        console.log(`Looking for user: ${username}`);
        // Queries user from the postgres database
        let user = await this.queryUser(username);

        if (!user) {
            console.log(`User ${username} not found.\n`);
            return null
        }

        console.log(`User found or created: ${JSON.stringify(user)}`);
        console.log();

        // Calls helper function for validating password against hash / salt saved in databse
        if (!validPassword(password, user.hash, user.salt)) {
            console.log(`User password ${password} is not correct.\n`)
            return null;
        }

        return issueJWT(user, key_path);
    }

    // Creates a user based on username, password, lab_id, configuration_id
    async createUser(username: string, password: string, lab_id: string, configuration_id: string): Promise<any> {
        console.log(`Creating new user: ${username}`);
        if (!username || !password || !lab_id || !configuration_id) throw new Error('Must provide username, password, lab id and configuration id to create user')

        try {
            // Creates a salt / hash based on a password
            const { salt, hash } = saltHashPassword(password);
            // Generate a new id for the user
            const id = randomUUID();
            // Insert user to database
            const insertQuery =
                "INSERT INTO users (id, username, salt, hash, lab_id, configuration_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
            const values = [id, username, salt, hash, lab_id, configuration_id];
            const res = await this.client.query(insertQuery, values);

            console.log(`New user created: ${JSON.stringify(res.rows[0])}`);
            return res.rows[0];
        } catch (err) {
            if (err instanceof Error) {
                console.error("Error creating user:", err.message);
            } else {
                console.error("Error creating user:", err);
            }
            throw err;
        }
    }

    // Queries for a user in the table based on a username / password
    private async queryUser(username: string): Promise<any> {
        console.log(`User input: ${username}`); // test log

        try {
            const query = "SELECT * FROM users WHERE username = $1";
            const values = [username];
            const res = await this.client.query(query, values);

            if (res.rows.length > 0) {
                console.log(`User found: ${JSON.stringify(res.rows[0])}`);
                return res.rows[0];
            }

            throw new Error("User not found.");
        } catch (err) {
            if (err instanceof Error) {
                console.error("Error executing query:", err.message);
            } else {
                console.error("Error executing query:", err);
            }
            return null;
        }
    }
}