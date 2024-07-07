import { factories } from "@strapi/strapi";

export default factories.createCoreController("plugin::strapi-azerothcore.user-activity", ({ strapi }) => ({
	async find(ctx) {
		// validateQuery throws an error if any of the query params used are inaccessible to ctx.user
		// That is, trying to access private fields, fields they don't have permission for, wrong data type, etc
		await this.validateQuery(ctx);

		// sanitizeQuery silently removes any query params that are invalid or the user does not have access to
		// It is recommended to use sanitizeQuery even if validateQuery is used, as validateQuery allows
		// a number of non-security-related cases such as empty objects in string fields to pass, while sanitizeQuery
		// will remove them completely
		const sanitizedQueryParams = await this.sanitizeQuery(ctx);

		// Perform whatever custom actions are needed
		const { user } = ctx.state;
		const { results, pagination } = await strapi.service("plugin::strapi-azerothcore.user-activity").find({
			filters: {
				user: {
					id: user.id,
				},
			},
			sort: sanitizedQueryParams.sort,
			pagination: sanitizedQueryParams.pagination,
		});

		// sanitizeOutput removes any data that was returned by our query that the ctx.user should not have access to
		const sanitizedResults = await this.sanitizeOutput(results, ctx);

		// transformResponse correctly formats the data and meta fields of your results to return to the API
		return this.transformResponse(sanitizedResults, { pagination });
	},
}));
