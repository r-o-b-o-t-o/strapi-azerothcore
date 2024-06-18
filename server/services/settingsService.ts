import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";

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
	authDatabase: IDatabaseSettings;
	realms: { [key: number]: IRealmSettings };
}

export class SettingsService {
	private getPluginStore() {
		return strapi.store?.({
			environment: "",
			type: "plugin",
			name: AzerothCorePlugin.pluginId(),
		});
	}

	private defaultSettings(): ISettings {
		return {
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
}

export default ({ strapi }: { strapi: Strapi }) => new SettingsService();
