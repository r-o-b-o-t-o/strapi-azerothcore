import dns from "dns";
import { Strapi } from "@strapi/strapi";

import { AzerothCorePlugin } from "./AzerothCorePlugin";

export default async ({ strapi }: { strapi: Strapi }) => {
	dns.setDefaultResultOrder("ipv4first"); // Prevent DNS from resolving to IPv6, which can make SOAP calls fail

	await AzerothCorePlugin.load();
};
