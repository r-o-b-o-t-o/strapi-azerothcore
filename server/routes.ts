export default {
	auth: {
		type: "content-api",
		routes: [
			{
				method: "POST",
				path: "/auth/register",
				handler: "auth.register",
				config: {
					policies: [],
					auth: false,
				},
			},
			{
				method: "POST",
				path: "/auth/login",
				handler: "auth.login",
				config: {
					policies: [],
					auth: false,
				},
			},
			{
				method: "POST",
				path: "/auth/reset-password",
				handler: "auth.resetPassword",
				config: {
					policies: [],
					auth: false,
				},
			},
			{
				method: "POST",
				path: "/auth/change-password",
				handler: "auth.changePassword",
				config: {
					policies: [],
				},
			},
			{
				method: "POST",
				path: "/auth/change-email",
				handler: "auth.changeEmail",
				config: {
					policies: [],
				},
			},

			{
				method: "GET",
				path: "/realms",
				handler: "realms.getRealms",
				config: {
					policies: [],
					auth: false,
				},
			},
			{
				method: "GET",
				path: "/characters/:realm/mine",
				handler: "characters.getMyCharacters",
				config: {
					policies: [],
				},
			},
			{
				method: "GET",
				path: "/guilds/:realm/mine",
				handler: "characters.getMyGuilds",
				config: {
					policies: [],
				},
			},
		],
	},

	settings: {
		type: "admin",
		routes: [
			{
				method: "GET",
				path: "/settings",
				handler: "settings.getSettings",
			},
			{
				method: "GET",
				path: "/settings/general",
				handler: "settings.getGeneralSettings",
			},
			{
				method: "PUT",
				path: "/settings/general",
				handler: "settings.setGeneralSettings",
			},
			{
				method: "GET",
				path: "/settings/authdb",
				handler: "settings.getAuthDbSettings",
			},
			{
				method: "PUT",
				path: "/settings/authdb",
				handler: "settings.setAuthDbSettings",
			},
			{
				method: "GET",
				path: "/settings/realm/:id",
				handler: "settings.getRealmSettings",
			},
			{
				method: "PUT",
				path: "/settings/realm/:id?",
				handler: "settings.setRealmSettings",
			},
			{
				method: "DELETE",
				path: "/settings/realm/:id",
				handler: "settings.deleteRealm",
			},
			{
				method: "POST",
				path: "/settings/test-db-connection",
				handler: "settings.testDbConnection",
			},
			{
				method: "POST",
				path: "/settings/test-soap-connection",
				handler: "settings.testSoapConnection",
			},
		],
	},
};
