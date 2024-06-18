import { Context, Next } from "koa";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";
import { SoapService } from "../services/soap/soapService";
import { DbServiceBase } from "../services/db/dbServiceBase";
import { IDatabaseSettings, IRealmSettings, ISoapSetings } from "../services/settingsService";

export default ({ strapi }: { strapi: Strapi }) => ({
	async getSettings(ctx: Context, next: Next) {
		const settings = AzerothCorePlugin.settingsService();
		ctx.body = await settings.getSettings();
	},

	async getAuthDbSettings(ctx: Context, next: Next) {
		const settings = AzerothCorePlugin.settingsService();
		ctx.body = (await settings.getSettings()).authDatabase;
	},

	async setAuthDbSettings(ctx: Context, next: Next) {
		const settings = AzerothCorePlugin.settingsService();
		const data = (ctx.request as any).body as IDatabaseSettings;
		await settings.setAuthDbSettings(data);
		await AzerothCorePlugin.load();
		ctx.status = 200;
	},

	async getRealmSettings(ctx: Context, next: Next) {
		const settings = AzerothCorePlugin.settingsService();
		const realm = await settings.getRealmSettings(parseInt(ctx.params.id));
		if (!realm) {
			return ctx.notFound();
		}
		ctx.body = realm;
	},

	async setRealmSettings(ctx: Context, next: Next) {
		const settings = AzerothCorePlugin.settingsService();
		const data = (ctx.request as any).body as IRealmSettings;
		const id = await settings.setRealmSettings(parseInt(ctx.params.id), data);
		await AzerothCorePlugin.load();
		ctx.body = { id };
	},

	async deleteRealm(ctx: Context, next: Next) {
		const settings = AzerothCorePlugin.settingsService();
		await settings.deleteRealm(parseInt(ctx.params.id));
		await AzerothCorePlugin.load();
		ctx.status = 200;
	},

	async testDbConnection(ctx: Context, next: Next) {
		const settings = (ctx.request as any).body as IDatabaseSettings;
		const db = new DbServiceBase(settings);
		try {
			await db.testConnection();
			ctx.status = 200;
		} catch (error) {
			ctx.internalServerError(error.message);
		}
	},

	async testSoapConnection(ctx: Context, next: Next) {
		const settings = (ctx.request as any).body as ISoapSetings;
		const soap = new SoapService(settings);
		try {
			await soap.testConnection();
			ctx.status = 200;
		} catch (error) {
			ctx.internalServerError(error.message);
		}
	},
});
