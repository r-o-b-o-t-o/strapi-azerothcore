import { Context, Next } from "koa";
import { errors } from "@strapi/utils";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";

const { ValidationError, ApplicationError, ForbiddenError } = errors;

export default ({ strapi }: { strapi: Strapi }) => ({
	async register(ctx: Context, next: Next) {
		const { username, email, password, repeatPassword } = (ctx.request as any).body;
		const auth = AzerothCorePlugin.authService();

		try {
			await auth.validateUsername(username);
			await auth.validateEmail(email);
			auth.validatePassword(password, repeatPassword);
		} catch (error) {
			return ctx.badRequest(error);
		}

		try {
			await auth.createAccount(username, password, email); // Create the AzerothCore account
		} catch (error) {
			console.error("Account creation failed.", error);
			return ctx.internalServerError("account creation failed");
		}

		try {
			const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
			await strapiAuthController.register(ctx, next); // Create the Strapi user with the regular auth controller
		} catch (error) {
			await auth.deleteAccount(username); // Rollback the AzerothCore account creation
			console.error("Account creation failed.", error);
			return ctx.internalServerError("account creation failed");
		}

		// Update the account row with the email address
		await auth.db.setRegEmail(username, email);
		await auth.db.setEmail(username, email);
	},

	async login(ctx: Context, next: Next) {
		const { identifier, password } = (ctx.request as any).body;
		if (!identifier?.trim()) {
			return ctx.badRequest("please enter your account name or email address");
		}
		if (!password?.trim()) {
			return ctx.badRequest("please enter your password");
		}

		try {
			const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
			await strapiAuthController.callback(ctx, next);
		} catch (error) {
			if (error.name === ValidationError.name) {
				return ctx.badRequest(error.message);
			}
			if (error.name === ApplicationError.name) {
				return ctx.internalServerError(error.message);
			}
			if (error.name === ForbiddenError.name) {
				return ctx.forbidden(error.message);
			}
			console.error("Login failed", error);
			return ctx.internalServerError("could not log in");
		}
	},

	resetPassword(ctx) {
		// TODO
		ctx.body = "";
	},

	changePassword(ctx) {
		// TODO
		ctx.body = "";
	},
});
