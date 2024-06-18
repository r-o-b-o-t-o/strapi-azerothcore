import { DbServiceBase } from "./dbServiceBase";

export class CharactersDbService extends DbServiceBase {
	public async getAccountCharacters(accountId: number) {
		const [rows] = await this.db.query(
			`SELECT guid, name, race, class, gender, level, online
			FROM characters
			WHERE account = ?
			ORDER BY COALESCE(\`order\`, guid)`,
			[accountId]
		);

		return (rows as any[]).map((row) => ({
			guid: row.guid,
			name: row.name,
			race: row.race,
			class: row.class,
			gender: row.gender,
			level: row.level,
			online: row.online === 1,
		}));
	}

	public async getGuildsOwnedByAccount(accountId: number) {
		const [rows] = await this.db.query(
			`SELECT guildid AS id, guild.name, EmblemStyle, EmblemColor, BorderStyle, BorderColor
			FROM guild
			INNER JOIN characters ON characters.guid = guild.leaderguid
			WHERE characters.account = ?
			ORDER BY name`,
			[accountId]
		);

		return (rows as any[]).map((row) => ({
			id: row.id,
			name: row.name,
			emblem: {
				style: row.EmblemStyle,
				color: row.EmblemColor,
			},
			border: {
				style: row.BorderStyle,
				color: row.BorderColor,
			},
		}));
	}
}
