import { Context, Next } from "koa";
import { errors } from "@strapi/utils";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "../AzerothCorePlugin";
import { UserActivityAction } from "../services/userService";

const { ValidationError, ApplicationError, ForbiddenError } = errors;

export default ({ strapi }: { strapi: Strapi }) => ({
	async register(ctx: Context, next: Next) {
		const { username, email, password, repeatPassword } = (ctx.request as any).body;
		const auth = AzerothCorePlugin.authService();

		if (await AzerothCorePlugin.userService().findByUsernameOrEmail(email)) {
			return (ctx as any).badRequest("", {
				email: "This email address is already in use",
			});
		}

		if (await AzerothCorePlugin.userService().findByUsernameOrEmail(username)) {
			return (ctx as any).badRequest("", {
				username: "This account name is already in use",
			});
		}

		try {
			auth.validateUsername(username);
			await auth.validateEmail(email);
			auth.validatePassword(password, repeatPassword);
		} catch (error) {
			return (ctx as any).badRequest(error.message, error.details);
		}

		const link = await auth.accountExists(username);
		if (link) {
			const settings = await AzerothCorePlugin.settingsService().getSettings();
			if (!settings.general?.allowLinkingExistingGameAccount) {
				return (ctx as any).badRequest("", {
					username: "This account name is already in use",
				});
			}

			if (!(await auth.verifyPassword(username, password))) {
				return (ctx as any).badRequest("", {
					password: "Invalid password",
				});
			}
		} else {
			try {
				await auth.createAccount(username, password, email); // Create the AzerothCore account
			} catch (error) {
				console.error("Account creation failed.", error);
				return ctx.internalServerError("Account creation failed");
			}
		}

		try {
			const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
			await strapiAuthController.register(ctx, next); // Create the Strapi user with the regular auth controller
		} catch (error) {
			if (!link) {
				await auth.deleteAccount(username); // Rollback the AzerothCore account creation
			}
			console.error("Account creation failed.", error);
			return (ctx as any).internalServerError(error.message, error.details);
		}

		// Update the account row with the email address
		await auth.db.setRegEmail(username, email);
		await auth.db.setEmail(username, email);
	},

	async login(ctx: Context, next: Next) {
		const { identifier, password } = (ctx.request as any).body;
		if (!identifier?.trim()) {
			return (ctx as any).badRequest("", {
				identifier: "Please enter your account name or email address",
			});
		}
		if (!password?.trim()) {
			return (ctx as any).badRequest("", {
				password: "Please enter your password",
			});
		}

		try {
			const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
			await strapiAuthController.callback(ctx, next);
		} catch (error) {
			if (error.name === ValidationError.name) {
				await AzerothCorePlugin.userService().saveActivity(
					identifier,
					UserActivityAction.LoginFailed,
					ctx.request
				);
				return (ctx as any).badRequest(error.message, error.details);
			}
			if (error.name === ApplicationError.name) {
				return ctx.internalServerError(error.message);
			}
			if (error.name === ForbiddenError.name) {
				return ctx.forbidden(error.message);
			}
			console.error("Login failed", error);
			return ctx.internalServerError("Could not log in");
		}

		await AzerothCorePlugin.userService().saveActivity(identifier, UserActivityAction.LoggedIn, ctx.request);
	},

	async resetPassword(ctx: Context, next: Next) {
		const { password, passwordConfirmation, code } = (ctx.request as any).body;

		const auth = AzerothCorePlugin.authService();
		try {
			auth.validatePassword(password, passwordConfirmation);
		} catch (error) {
			return (ctx as any).badRequest(error.message, error.details);
		}

		const user = await strapi
			.query("plugin::users-permissions.user")
			.findOne({ where: { resetPasswordToken: code } });

		const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
		await strapiAuthController.resetPassword(ctx, next);

		await auth.changePassword(user.username, password);
		await AzerothCorePlugin.userService().saveActivity(user, UserActivityAction.PasswordReset, ctx.request);
	},

	async changePassword(ctx: Context, next: Next) {
		const { password, passwordConfirmation } = (ctx.request as any).body;
		const { user } = ctx.state;

		const auth = AzerothCorePlugin.authService();
		try {
			auth.validatePassword(password, passwordConfirmation);
		} catch (error) {
			return (ctx as any).badRequest(error.message, error.details);
		}

		const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
		await strapiAuthController.changePassword(ctx, next);

		await auth.changePassword(user.username, password);
		await AzerothCorePlugin.userService().saveActivity(user, UserActivityAction.ChangedPassword, ctx.request);
	},

	async changeEmail(ctx: Context, next: Next) {
		const email: string = (ctx.request as any).body.email?.trim();
		const { user } = ctx.state;

		if (!email) {
			return (ctx as any).badRequest("", {
				email: "Please enter the new email address",
			});
		}
		if (email === user.email) {
			return (ctx as any).badRequest("", {
				email: "The new email address must be different from your current email address",
			});
		}

		const auth = AzerothCorePlugin.authService();
		try {
			await auth.validateEmail(email);
		} catch (error) {
			return (ctx as any).badRequest(error.message, error.details);
		}

		if (await AzerothCorePlugin.userService().findByUsernameOrEmail(email)) {
			return (ctx as any).badRequest("", {
				email: "This email address is already in use",
			});
		}

		if (await auth.isEmailConfirmationEnabled()) {
			const strapiAuthController = strapi.controller("plugin::users-permissions.auth");
			await strapiAuthController.sendEmailConfirmation(ctx, next);

			await strapi.plugin("users-permissions").service("user").edit(user.id, {
				confirmed: false,
			});
			await auth.unconfirmAccount(user.username);
		}
		await strapi.plugin("users-permissions").service("user").edit(user.id, {
			email,
		});
		await auth.changeEmail(user.username, email);

		await AzerothCorePlugin.userService().saveActivity(user, UserActivityAction.ChangedEmail, ctx.request);
	},
});
