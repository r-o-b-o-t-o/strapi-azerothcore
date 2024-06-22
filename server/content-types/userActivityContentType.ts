export default {
	kind: "collectionType",
	collectionName: "user_activities",
	info: {
		singularName: "user-activity",
		pluralName: "user-activity",
		displayName: "UserActivity",
		description: "",
	},
	options: {
		draftAndPublish: false,
	},
	pluginOptions: {
		"content-manager": {
			visible: false,
		},
		"content-type-builder": {
			visible: false,
		},
	},
	attributes: {
		user: {
			type: "relation",
			relation: "manyToOne",
			target: "plugin::users-permissions.user",
		},
		action: {
			type: "enumeration",
			enum: ["loggedIn", "loginFailed", "passwordReset", "changedPassword", "changedEmail"],
			required: true,
		},
		ipAddress: {
			type: "string",
			required: false,
		},
		userAgent: {
			type: "text",
			required: false,
		},
	},
};
