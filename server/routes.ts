import userActivity from "./routes/userActivityRoutes";

export default {
	content: {
		type: "content-api",
		routes: [
			{
				method: "POST",
				path: "/auth/register",
				handler: "auth.register",
			},
			{
				method: "POST",
				path: "/auth/login",
				handler: "auth.login",
			},
			{
				method: "POST",
				path: "/auth/reset-password",
				handler: "auth.resetPassword",
			},
			{
				method: "POST",
				path: "/auth/change-password",
				handler: "auth.changePassword",
			},
			{
				method: "POST",
				path: "/auth/change-email",
				handler: "auth.changeEmail",
			},

			{
				method: "GET",
				path: "/characters/:realm/my-characters",
				handler: "characters.getMyCharacters",
			},
			{
				method: "GET",
				path: "/characters/:realm/my-guilds",
				handler: "characters.getMyGuilds",
			},

			{
				method: "GET",
				path: "/realms",
				handler: "realms.getRealms",
			},
		],
	},

	admin: {
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

	userActivity,
};
