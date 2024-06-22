import { Request } from "koa";
import { Strapi } from "@strapi/strapi";
import { UAParser } from "ua-parser-js";

export enum UserActivityAction {
	LoggedIn = "loggedIn",
	LoginFailed = "loginFailed",
	PasswordReset = "passwordReset",
	ChangedPassword = "changedPassword",
	ChangedEmail = "changedEmail",
}

export class UserService {
	private strapi: Strapi;

	public constructor(strapi: Strapi) {
		this.strapi = strapi;
	}

	public async findByUsernameOrEmail(identifier: string) {
		return await this.strapi.query("plugin::users-permissions.user").findOne({
			where: {
				provider: "local",
				$or: [{ email: identifier.toLowerCase() }, { username: identifier }],
			},
		});
	}

	public async saveActivity(identifierOrUser: string | object, action: UserActivityAction, request: Request) {
		const ua = UAParser(request.headers as Record<string, string>);
		const os = [ua.os.name, ua.os.version].filter((el) => !!el).join(" ");
		const browser = [ua.browser.name, ua.browser.major ?? ua.browser.version].filter((el) => !!el).join(" ");

		const user =
			typeof identifierOrUser === "string"
				? await this.findByUsernameOrEmail(identifierOrUser)
				: identifierOrUser;
		if (!user) {
			return;
		}

		await this.strapi.service("plugin::strapi-azerothcore.user-activity").create({
			data: {
				user,
				action,
				ipAddress: request.ip,
				userAgent: `${browser} on ${os}`,
			},
		});
	}
}

export default ({ strapi }: { strapi: Strapi }) => new UserService(strapi);
