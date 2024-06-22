import auth from "./authController";
import realms from "./realmsController";
import settings from "./settingsController";
import characters from "./charactersController";
import userActivity from "./userActivityController";

export default {
	auth,
	realms,
	settings,
	characters,
	"user-activity": userActivity,
};
