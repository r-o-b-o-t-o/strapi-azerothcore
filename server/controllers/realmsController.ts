import { Context, Next } from "koa";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";

export default ({ strapi }: { strapi: Strapi }) => ({
	async getRealms(ctx: Context, next: Next) {
		const realms = await AzerothCorePlugin.settingsService().getRealms();
		ctx.body = Object.keys(realms).map((id) => ({
			id: parseInt(id),
			name: realms[id].name,
		}));
	},
});
