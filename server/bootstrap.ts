import dns from "dns";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "./AzerothCorePlugin";

export default async ({ strapi }: { strapi: Strapi }) => {
	dns.setDefaultResultOrder("ipv4first"); // Prevent DNS from resolving to IPv6, which can make SOAP calls fail

	strapi.db?.lifecycles.subscribe({
		models: ["plugin::users-permissions.user"],
		async afterUpdate(event) {
			const authService = AzerothCorePlugin.authService();

			if (
				(await authService.isEmailConfirmationEnabled()) &&
				event.params.data.confirmed === true &&
				event.params.data.confirmationToken === null
			) {
				// Runs when the user clicks the confirmation link (/api/auth/email-confirmation)
				const { username } = (event as any).result;
				if (username) {
					await AzerothCorePlugin.authService().confirmAccount(username);
				}
			}
		},
	});

	await AzerothCorePlugin.load();
};
