import pluginId from "./pluginId";
import { AuthService } from "./services/authService";
import { RealmsService } from "./services/realmsService";
import { SettingsService } from "./services/settingsService";

export class AzerothCorePlugin {
	public static plugin() {
		return strapi.plugin(pluginId);
	}

	public static pluginId() {
		return pluginId;
	}

	public static authService() {
		return this.plugin().service<AuthService>("auth");
	}

	public static realmsService() {
		return this.plugin().service<RealmsService>("realms");
	}

	public static settingsService() {
		return this.plugin().service<SettingsService>("settings");
	}

	public static async load() {
		await this.authService().load();
		await this.realmsService().load();
	}
}
