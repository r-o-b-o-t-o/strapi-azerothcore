import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";

export interface IGeneralSettings {
	allowLinkingExistingGameAccount: boolean;
}

export interface IDatabaseSettings {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

export interface ISoapSetings {
	host: string;
	port: number;
	username: string;
	password: string;
}

export interface IRealmSettings {
	name: string;
	charactersDatabase: IDatabaseSettings;
	soap: ISoapSetings;
}

export interface ISettings {
	general: IGeneralSettings;
	authDatabase: IDatabaseSettings;
	realms: { [key: number]: IRealmSettings };
}

export interface IPermissionEntry {
	id?: number;
	action: string;
	role: {
		id?: number;
		name?: string;
		type: string;
	};
}

export interface IPermissionsCheck {
	extra: IPermissionEntry[];
	missing: IPermissionEntry[];
}

export class SettingsService {
	private strapi: Strapi;

	public constructor(strapi: Strapi) {
		this.strapi = strapi;
	}

	private getPluginStore() {
		return this.strapi.store?.({
			environment: "",
			type: "plugin",
			name: AzerothCorePlugin.pluginId(),
		});
	}

	private defaultSettings(): ISettings {
		return {
			general: {
				allowLinkingExistingGameAccount: false,
			},
			authDatabase: {
				host: "localhost",
				port: 3306,
				user: "acore",
				password: "",
				database: "acore_auth",
			},
			realms: { 1: this.defaultRealmSettings() },
		};
	}

	private defaultRealmSettings(): IRealmSettings {
		return {
			name: "AzerothCore",
			charactersDatabase: {
				host: "localhost",
				port: 3306,
				user: "acore",
				password: "",
				database: "acore_characters",
			},
			soap: {
				host: "localhost",
				port: 7878,
				username: "soapaccount",
				password: "",
			},
		};
	}

	private async createDefaultSettings() {
		const settings = this.defaultSettings();
		await this.getPluginStore()?.set({
			key: "settings",
			value: settings,
		});
		return settings;
	}

	public async getSettings() {
		let settings = (await this.getPluginStore()?.get({ key: "settings" })) as ISettings;
		if (!settings) {
			settings = await this.createDefaultSettings();
		}
		return settings;
	}

	public async setSettings(settings: ISettings) {
		await this.getPluginStore()?.set({ key: "settings", value: settings });
	}

	public async setGeneralSettings(data: IGeneralSettings) {
		const settings = await this.getSettings();
		settings.general = data;
		await this.setSettings(settings);
	}

	public async setAuthDbSettings(data: IDatabaseSettings) {
		const settings = await this.getSettings();
		settings.authDatabase = data;
		await this.setSettings(settings);
	}

	public async getRealmSettings(id: number) {
		const settings = await this.getSettings();
		return settings.realms[id];
	}

	public async getRealms() {
		const settings = await this.getSettings();
		return settings.realms;
	}

	public async setRealmSettings(id: number, data: IRealmSettings) {
		const settings = await this.getSettings();
		if (!settings.realms) {
			settings.realms = {};
		}
		if (id < 0 || id == undefined || isNaN(id)) {
			id = Math.max(...Object.keys(settings.realms).map((key) => parseInt(key)), 0) + 1;
		}
		settings.realms[id] = data;
		await this.setSettings(settings);
		return id;
	}

	public async deleteRealm(id: number) {
		const settings = await this.getSettings();
		if (!settings.realms) {
			settings.realms = {};
		} else {
			delete settings.realms[id];
		}
		await this.setSettings(settings);
	}

	public async checkPermissions(): Promise<IPermissionsCheck> {
		const authenticatedRole = await this.strapi
			.query("plugin::users-permissions.role")
			.findOne({ where: { type: "authenticated" } });
		const publicRole = await this.strapi
			.query("plugin::users-permissions.role")
			.findOne({ where: { type: "public" } });
		if (!authenticatedRole) {
			throw new Error("Could not find authenticated role");
		}
		if (!publicRole) {
			throw new Error("Could not find public role");
		}

		const toDelete = [
			{ action: "plugin::users-permissions.auth.callback", role: { type: "public" } },
			{ action: "plugin::users-permissions.auth.changePassword", role: { type: "public" } },
			{ action: "plugin::users-permissions.auth.connect", role: { type: "public" } },
			{ action: "plugin::users-permissions.auth.register", role: { type: "public" } },
			{ action: "plugin::users-permissions.auth.resetPassword", role: { type: "public" } },

			{ action: "plugin::users-permissions.auth.callback", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.changePassword", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.connect", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.emailConfirmation", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.forgotPassword", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.register", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.resetPassword", role: { type: "authenticated" } },
			{ action: "plugin::users-permissions.auth.sendEmailConfirmation", role: { type: "authenticated" } },

			{ action: "plugin::strapi-azerothcore.auth.changeEmail", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.auth.changePassword", role: { type: "public" } },

			{ action: "plugin::strapi-azerothcore.auth.login", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.auth.register", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.auth.resetPassword", role: { type: "authenticated" } },

			{ action: "plugin::strapi-azerothcore.user-activity.create", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.user-activity.delete", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.user-activity.find", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.user-activity.findOne", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.user-activity.update", role: { type: "public" } },

			{ action: "plugin::strapi-azerothcore.user-activity.create", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.user-activity.delete", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.user-activity.findOne", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.user-activity.update", role: { type: "authenticated" } },
		];

		const toCreate = [
			{ action: "plugin::users-permissions.auth.forgotPassword", role: { type: "public" } },
			{ action: "plugin::users-permissions.auth.sendEmailConfirmation", role: { type: "public" } },

			{ action: "plugin::strapi-azerothcore.auth.login", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.auth.register", role: { type: "public" } },
			{ action: "plugin::strapi-azerothcore.auth.resetPassword", role: { type: "public" } },

			{ action: "plugin::strapi-azerothcore.realms.getRealms", role: { type: "public" } },

			{ action: "plugin::strapi-azerothcore.auth.changeEmail", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.auth.changePassword", role: { type: "authenticated" } },

			{ action: "plugin::strapi-azerothcore.characters.getMyCharacters", role: { type: "authenticated" } },
			{ action: "plugin::strapi-azerothcore.characters.getMyGuilds", role: { type: "authenticated" } },

			{ action: "plugin::strapi-azerothcore.user-activity.find", role: { type: "authenticated" } },
		];
		if (await AzerothCorePlugin.authService().isEmailConfirmationEnabled()) {
			toCreate.push({ action: "plugin::users-permissions.auth.emailConfirmation", role: { type: "public" } });
		} else {
			toDelete.push({ action: "plugin::users-permissions.auth.emailConfirmation", role: { type: "public" } });
		}

		let missing: IPermissionEntry[] = [];
		for (const entry of toCreate) {
			const rows = await this.strapi.entityService.findMany("plugin::users-permissions.permission", {
				filters: entry,
			});
			if (rows.length === 0) {
				missing.push(entry);
			}
		}

		return {
			extra: (await this.strapi.entityService.findMany("plugin::users-permissions.permission", {
				filters: {
					$or: toDelete,
				},
				populate: "role",
			})) as IPermissionEntry[],
			missing,
		};
	}
}

export default ({ strapi }: { strapi: Strapi }) => new SettingsService(strapi);
