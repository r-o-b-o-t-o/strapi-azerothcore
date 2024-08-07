import { DbServiceBase } from "./dbServiceBase";

export class AuthDbService extends DbServiceBase {
	public async isUsernameUsed(username: string) {
		const [rows] = await this.db.query("SELECT COUNT(id) AS count FROM account WHERE username LIKE ?", [username]);
		return rows[0].count > 0;
	}

	public async isEmailUsed(email: string) {
		const [rows] = await this.db.query("SELECT COUNT(id) AS count FROM account WHERE email LIKE ?", [email]);
		return rows[0].count > 0;
	}

	public async getSaltAndVerifier(username: string) {
		const [rows] = await this.db.query("SELECT salt, verifier FROM account WHERE username LIKE ?", [username]);
		if ((rows as any[]).length === 0) {
			return null;
		}
		return {
			salt: rows[0].salt as Buffer,
			verifier: rows[0].verifier as Buffer,
		};
	}

	public async setEmail(username: string, email: string) {
		await this.db.query("UPDATE account SET email = ? WHERE username LIKE ?", [email, username]);
	}

	public async setRegEmail(username: string, email: string) {
		await this.db.query("UPDATE account SET reg_mail = ? WHERE username LIKE ?", [email, username]);
	}

	public async setPassword(username: string, salt: Buffer, verifier: Buffer) {
		await this.db.query("UPDATE account SET salt = ?, verifier = ? WHERE username LIKE ?", [
			salt,
			verifier,
			username,
		]);
	}

	public async createAccount(username: string, email: string, expansion: number, salt: Buffer, verifier: Buffer) {
		await this.db.query(
			"INSERT INTO account (username, email, reg_mail, salt, verifier, expansion, joindate) VALUES(UPPER(?), ?, ?, ?, ?, ?, NOW())",
			[username, email, email, salt, verifier, expansion]
		);
		await this.db.query(
			"INSERT INTO realmcharacters (realmid, acctid, numchars) SELECT realmlist.id, account.id, 0 FROM realmlist LEFT JOIN account ON account.username LIKE ?",
			[username]
		);
	}

	public async deleteAccount(username: string) {
		const [rows] = await this.db.query("SELECT id FROM account WHERE username LIKE ?", [username]);
		if ((rows as any[]).length === 0) {
			throw new Error(`Could not find account ${username}`);
		}
		const { id } = rows[0];
		await this.db.query("DELETE FROM realmcharacters WHERE acctid = ?", [id]);
		await this.db.query("DELETE FROM account WHERE id = ?", [id]);
	}

	public async getAccountId(username: string) {
		const [rows] = await this.db.query("SELECT id FROM account WHERE username LIKE ?", [username]);
		if ((rows as any[]).length === 0) {
			return null;
		}
		const { id } = rows[0];
		return id as number;
	}

	public async getAccountEmail(username: string) {
		const [rows] = await this.db.query("SELECT email FROM account WHERE username LIKE ?", [username]);
		if ((rows as any[]).length === 0) {
			return null;
		}
		const { email } = rows[0];
		return email as string;
	}

	public async getAccountNameWithEmail(email: string) {
		const [rows] = await this.db.query("SELECT username FROM account WHERE email LIKE ?", [email]);
		if ((rows as any[]).length === 0) {
			return null;
		}
		const { username } = rows[0];
		return username as string;
	}

	public async banAccount(username: string, unbanDate?: Date, reason?: string) {
		const accountId = await this.getAccountId(username);
		if (!accountId) {
			return;
		}

		const dateToTimestamp = (date: Date) => Math.round(date.getTime() / 1000);
		const now = new Date();
		const banTimestamp = dateToTimestamp(now);
		const unbanTimestamp = dateToTimestamp(unbanDate ?? now);

		await this.db.query(
			"INSERT INTO account_banned (id, bandate, unbandate, bannedby, banreason, active) VALUES (?, ?, ?, '', ?, 1)",
			[accountId, banTimestamp, unbanTimestamp, reason ?? ""]
		);
	}

	public async unbanAccountForReason(username: string, reason: string) {
		const accountId = await this.getAccountId(username);
		if (!accountId) {
			return;
		}

		await this.db.query("DELETE FROM account_banned WHERE id = ? AND banreason = ?", [accountId, reason ?? ""]);
	}
}
