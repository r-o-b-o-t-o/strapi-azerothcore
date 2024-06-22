import user from "./userService";
import auth from "./authService";
import realms from "./realmsService";
import settings from "./settingsService";
import userActivity from "./userActivityService";

export default {
	user,
	auth,
	realms,
	settings,
	"user-activity": userActivity,
};
