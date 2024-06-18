import mysql from "mysql2/promise";

import { IDatabaseSettings } from "../settingsService";

export class DbServiceBase {
	protected db: mysql.Pool;

	public constructor(settings: IDatabaseSettings) {
		const { host, port, user, password, database } = settings;

		this.db = mysql.createPool({
			host,
			port,
			user,
			password,
			database,
			waitForConnections: true,
			connectionLimit: 4,
			maxIdle: 4, // max idle connections, the default value is the same as `connectionLimit`
			idleTimeout: 60_000, // idle connections timeout, in milliseconds
			queueLimit: 0,
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
		});
	}

	public async testConnection() {
		await this.db.getConnection();
		return true;
	}
}
