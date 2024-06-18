import { Context, Next } from "koa";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";

export default ({ strapi }: { strapi: Strapi }) => ({
	async getMyCharacters(ctx: Context, next: Next) {
		if (!ctx.state.user) {
			return ctx.forbidden();
		}

		const realm = AzerothCorePlugin.realmsService().getRealm(parseInt(ctx.params.realm));
		if (!realm) {
			return [];
		}

		const { username } = ctx.state.user;
		const accountId = await AzerothCorePlugin.authService().db.getAccountId(username);
		if (accountId === null) {
			return [];
		}
		ctx.body = await realm.db().characters.getAccountCharacters(accountId);
	},

	async getMyGuilds(ctx: Context, next: Next) {
		if (!ctx.state.user) {
			return ctx.forbidden();
		}

		const realm = AzerothCorePlugin.realmsService().getRealm(parseInt(ctx.params.realm));
		if (!realm) {
			return [];
		}

		const { username } = ctx.state.user;
		const accountId = await AzerothCorePlugin.authService().db.getAccountId(username);
		if (accountId === null) {
			return [];
		}
		ctx.body = await realm.db().characters.getGuildsOwnedByAccount(accountId);
	},
});
