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
			guid: row.guid as number,
			name: row.name as string,
			race: row.race as number,
			class: row.class as number,
			gender: row.gender as number,
			level: row.level as number,
			online: row.online === 1,
		}));
	}

	public async getCharacter(characterId: number) {
		const [rows] = await this.db.query(
			`SELECT account, name, race, class, gender, level, online
			FROM characters
			WHERE guid = ?`,
			[characterId]
		);
		if ((rows as any[]).length === 0) {
			return null;
		}

		const char = rows[0];
		return {
			account: char.account as number,
			name: char.name as string,
			race: char.race as number,
			class: char.class as number,
			gender: char.gender as number,
			level: char.level as number,
			online: char.online === 1,
		};
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
