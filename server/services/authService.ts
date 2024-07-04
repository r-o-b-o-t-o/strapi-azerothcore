import crypto from "crypto";
import { BigInteger } from "jsbn";
import { errors } from "@strapi/utils";
import { Strapi } from "@strapi/strapi";

import { AuthDbService } from "./db/authDbService";
import { AzerothCorePlugin } from "../AzerothCorePlugin";

const { ValidationError } = errors;

export class AuthService {
	private strapi: Strapi;
	private authDb: AuthDbService;
	private readonly confirmationBanReason = "STRAPI-AZEROTHCORE_CONFIRMATION";
	private readonly expansionWotlk = 2;

	public constructor(strapi: Strapi) {
		this.strapi = strapi;
	}

	public async load() {
		const settings = await AzerothCorePlugin.settingsService().getSettings();
		this.authDb = new AuthDbService(settings.authDatabase);
	}

	public get db() {
		return this.authDb;
	}

	public validateUsername(username: string) {
		if (username === undefined || username.length === 0) {
			throw new ValidationError("", {
				username: "Please enter your account name",
			});
		}
		if (username.length > 16) {
			throw new ValidationError("", {
				username: "Account name must be at most 16 characters",
			});
		}
		if (/[^0-9a-zA-Z_-]/.test(username)) {
			throw new ValidationError("", {
				username:
					"Account name must contain only non-accented latin letters, numbers, underscores (_) and dashes (-)",
			});
		}
		if (!/[a-zA-Z]/.test(username)) {
			throw new ValidationError("", {
				username: "Account name must contain at least one letter",
			});
		}

		return true;
	}

	public async accountExists(username: string) {
		return await this.db.isUsernameUsed(username);
	}

	public async validateEmail(email: string) {
		if (email === undefined || email.length === 0) {
			throw new ValidationError("", {
				email: "Please enter your email address",
			});
		}
		if (await this.db.isEmailUsed(email)) {
			throw new ValidationError("", {
				email: "This email address is already in use",
			});
		}

		return true;
	}

	public validatePassword(password: string, passwordRepeat: string) {
		if (password === undefined || password.length === 0) {
			throw new ValidationError("", {
				password: "Please enter your password",
			});
		}
		if (passwordRepeat === undefined || passwordRepeat.length === 0) {
			throw new ValidationError("", {
				repeatPassword: "Please repeat your password",
			});
		}
		if (password.length > 16) {
			throw new ValidationError("", {
				password: "Password must be at most 16 characters",
			});
		}
		if (/[^a-zA-Z0-9!@#\$%\^\&*\)\(\[\]~'"\\{}+=,?;:/<>._-]/.test(password)) {
			throw new ValidationError("", {
				password: "Password must contain only non-accented latin letters, numbers and special characters",
			});
		}
		if (password !== passwordRepeat) {
			throw new ValidationError("", {
				password: "Passwords do not match",
				repeatPassword: "Passwords do not match",
			});
		}

		return true;
	}

	public async verifyPassword(username: string, password: string) {
		const { salt, verifier } = await this.db.getSaltAndVerifier(username);
		return Buffer.compare(this.createVerifier(username, password, salt), verifier) === 0;
	}

	public async createAccount(username: string, password: string, email: string) {
		const salt = this.generateSalt();
		const verifier = this.createVerifier(username, password, salt);
		await this.db.createAccount(username, email, this.expansionWotlk, salt, verifier);
		if (await this.isEmailConfirmationEnabled()) {
			await this.unconfirmAccount(username);
		}
	}

	public async unconfirmAccount(username: string) {
		await this.db.banAccount(username, null, this.confirmationBanReason);
	}

	public async confirmAccount(username: string) {
		await this.db.unbanAccountForReason(username, this.confirmationBanReason);
	}

	public async isEmailConfirmationEnabled() {
		const settings: any = await this.strapi
			.store({ type: "plugin", name: "users-permissions" })
			.get({ key: "advanced" });
		return !!settings.email_confirmation;
	}

	public async deleteAccount(username: string) {
		await this.db.deleteAccount(username);
	}

	public async changePassword(username: string, newPassword: string) {
		const salt = this.generateSalt();
		const verifier = this.createVerifier(username, newPassword, salt);
		await this.db.setPassword(username, salt, verifier);
	}

	public async changeEmail(username: string, newEmail: string) {
		await this.db.setEmail(username, newEmail);

		if (await this.isEmailConfirmationEnabled()) {
			await this.unconfirmAccount(username);
		}
	}

	private createVerifier(username: string, password: string, salt?: Buffer): Buffer {
		// Based on https://gist.github.com/Treeston/db44f23503ae9f1542de31cb8d66781e

		const N = new BigInteger("894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7", 16);
		const g = new BigInteger("7", 16);
		salt = salt ?? this.generateSalt();

		// Calculate first hash
		const h1 = this.sha1(Buffer.from(`${username}:${password}`.toUpperCase(), "utf8"));

		// Calculate second hash
		const h2 = this.sha1(Buffer.concat([salt, h1])).reverse();

		// Convert to integer
		const h2bigint = new BigInteger(h2.toString("hex"), 16);

		// g^h2 mod N
		const verifierBigint = g.modPow(h2bigint, N);

		// Convert back to a buffer
		let verifier = Buffer.from(verifierBigint.toByteArray().reverse());

		// Pad to 32 bytes
		verifier = verifier.subarray(0, 32);
		if (verifier.length != 32) {
			verifier = Buffer.concat([verifier], 32);
		}

		return verifier;
	}

	private sha1(data: Buffer): Buffer {
		const hash = crypto.createHash("sha1");
		hash.update(data);
		return hash.digest();
	}

	private generateSalt(): Buffer {
		return crypto.randomBytes(32);
	}
}

export default ({ strapi }: { strapi: Strapi }) => new AuthService(strapi);
