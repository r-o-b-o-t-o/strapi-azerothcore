import { Strapi } from "@strapi/strapi";

import { SoapService } from "./soap/soapService";
import { IRealmSettings } from "./settingsService";
import { AzerothCorePlugin } from "../AzerothCorePlugin";
import { CharactersDbService } from "./db/charactersDbService";

export class RealmService {
	private soapService: SoapService;
	private charactersDbService: CharactersDbService;

	public constructor(settings: IRealmSettings) {
		this.soapService = new SoapService(settings.soap);
		this.charactersDbService = new CharactersDbService(settings.charactersDatabase);
	}

	public db() {
		return {
			characters: this.charactersDbService,
		};
	}

	public soap() {
		return {};
	}
}

export class RealmServiceBase {
	protected realm: RealmService;

	public constructor(realm: RealmService) {
		this.realm = realm;
	}
}

export class RealmsService {
	private strapi: Strapi;
	private realms: { [key: number]: RealmService };

	public constructor(strapi: Strapi) {
		this.strapi = strapi;
		this.realms = {};
	}

	public getRealm(id: number) {
		return this.realms[id];
	}

	public async load() {
		const settingsService = AzerothCorePlugin.settingsService();
		const realms = await settingsService.getRealms();
		this.realms = {};

		for (const id in realms) {
			this.realms[parseInt(id)] = new RealmService(realms[id]);
		}
	}
}

export default ({ strapi }: { strapi: Strapi }) => new RealmsService(strapi);
