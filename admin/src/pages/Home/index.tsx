import pluginId from "../../pluginId";
import { SideNav } from "../../components/SideNav";
import { Helmet } from "react-helmet";
import { Redirect, Route, Switch } from "react-router-dom";
import General from "../General";
import Realms from "../Realms";
import AuthDb from "../AuthDb";
import { Layout, Main, HeaderLayout, ContentLayout, Typography, Box, LinkButton } from "@strapi/design-system";

import "./index.css";
import acLogo from "./ac-logo.png";
import kofiLogo from "./kofi-logo.png";

export default () => {
	return (
		<>
			<Helmet title="AzerothCore" />
			<Layout
				sideNav={
					<SideNav
						label="AzerothCore"
						menu={[
							{
								id: "strapi-azerothcore.main",
								label: "Strapi AzerothCore",
								links: [
									{
										id: "strapi-azerothcore.home",
										label: "Home",
										to: `/plugins/${pluginId}/home`,
									},
								],
							},
							{
								id: "strapi-azerothcore.settings",
								label: "Settings",
								links: [
									{
										id: "strapi-azerothcore.generalSettings",
										label: "General",
										to: `/plugins/${pluginId}/general`,
									},
									{
										id: "strapi-azerothcore.realmsSettings",
										label: "Realms",
										to: `/plugins/${pluginId}/realms`,
									},
									{
										id: "strapi-azerothcore.authDatabaseSettings",
										label: "Auth Database",
										to: `/plugins/${pluginId}/auth-database`,
									},
								],
							},
						]}
					/>
				}
			>
				<Switch>
					<Route path={`/plugins/${pluginId}/general`} component={General} />
					<Route path={`/plugins/${pluginId}/realms`} component={Realms} />
					<Route path={`/plugins/${pluginId}/auth-database`} component={AuthDb} />

					<Route
						path={`/plugins/${pluginId}/home`}
						component={() => (
							<Main>
								<HeaderLayout title="Home" />
								<ContentLayout>
									<Box shadow="tableShadow" hasRadius padding={6} background="neutral0">
										<div>
											<Typography variant="delta">
												Welcome to the Strapi AzerothCore plugin!
											</Typography>
										</div>
										<div>
											<Typography>
												👈 Select a category on the left to start configuring
											</Typography>
										</div>
										<br />
										<div>
											<Typography>Strapi AzerothCore links:</Typography>
										</div>
										<div className="strapi-azerothcore-btn-row">
											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://github.com/r-o-b-o-t-o/strapi-azerothcore"
											>
												<div className="btn-content">
													<svg height="24" viewBox="0 0 16 16">
														<path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
													</svg>
													<span className="btn-text">GitHub</span>
												</div>
											</LinkButton>

											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://github.com/r-o-b-o-t-o/strapi-azerothcore/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml"
											>
												<div className="btn-content">
													<svg height="24" viewBox="0 0 432.458 432.458">
														<path d="M322.743,106.629c-2.778-4.518-5.731-8.889-8.873-13.08c-25.777-34.375-60.453-53.307-97.641-53.307 s-71.864,18.932-97.641,53.307c-3.143,4.191-6.095,8.562-8.874,13.08c20.061,31.973,60.275,53.85,106.514,53.85 C262.469,160.479,302.683,138.602,322.743,106.629z" />
														<path d="M417.458,201.755h-65.606c-0.808-12.567-2.625-24.87-5.406-36.742l51.575-51.576 c5.858-5.858,5.858-15.355,0-21.213c-5.857-5.858-15.355-5.858-21.213,0l-25.966,25.966c-7.348,12.845-17.202,24.674-29.365,35.028 c-24.637,20.972-56.246,33.718-90.248,36.621v202.376c31.443-4.39,60.365-22.55,82.641-52.255 c3.907-5.21,7.536-10.687,10.881-16.395l52.058,52.058c2.929,2.929,6.768,4.393,10.607,4.393c3.838,0,7.678-1.465,10.606-4.393 c5.858-5.858,5.858-15.355,0-21.213l-59.579-59.58c7.427-19.594,11.986-40.927,13.41-63.076h65.606c8.284,0,15-6.716,15-15 C432.458,208.471,425.742,201.755,417.458,201.755z" />
														<path d="M201.23,189.84c-34.003-2.903-65.612-15.649-90.249-36.621c-12.163-10.354-22.017-22.183-29.365-35.028 L55.65,92.224c-5.858-5.858-15.356-5.858-21.213,0c-5.858,5.858-5.858,15.355,0,21.213l51.575,51.575 c-2.78,11.873-4.598,24.175-5.406,36.742H15c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h65.606 c1.424,22.149,5.983,43.482,13.41,63.076l-59.579,59.579c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.858,15.355,5.858,21.213,0 l52.058-52.058c3.345,5.708,6.974,11.185,10.881,16.395c22.274,29.705,51.197,47.866,82.641,52.255V189.84z" />
													</svg>
													<span className="btn-text">Report a bug</span>
												</div>
											</LinkButton>

											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://github.com/r-o-b-o-t-o/strapi-azerothcore/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yml"
											>
												<div className="btn-content">
													<svg height="24" viewBox="0 0 512 512">
														<path d="M411.34,155.34C411.34,69.548,341.791,0,256,0c-85.793,0-155.34,69.548-155.34,155.34 c0,39.005,14.377,74.648,38.12,101.926c17.904,20.57,30.919,44.661,38.372,70.467c-7.335,2.906-12.529,10.049-12.529,18.419 c0,9.64,6.883,17.664,16.001,19.446c-9.118,1.781-16.001,9.806-16.001,19.446c0,8.842,5.793,16.326,13.788,18.879 c-7.995,2.553-13.788,10.037-13.788,18.879c0,10.947,8.874,19.821,19.821,19.821h3.208c6.259,20.155,21.188,36.492,40.426,44.653 C229.762,501.204,241.615,512,255.998,512c14.383,0,26.237-10.796,27.919-24.724c19.238-8.161,34.167-24.498,40.426-44.653h3.208 c10.947,0,19.821-8.874,19.821-19.821c0-8.842-5.793-16.326-13.788-18.879c7.995-2.553,13.788-10.037,13.788-18.879 c0-9.64-6.883-17.664-16.001-19.446c9.118-1.781,16.001-9.806,16.001-19.446c0-8.376-5.203-15.522-12.546-18.425 c7.443-25.793,20.451-49.849,38.391-70.46C396.963,229.988,411.34,194.345,411.34,155.34z M357.898,162.744L308.982,326.33 h-35.466l35.804-119.74l-34.226-11.859l-17.649,13.638c-5.727,4.426-13.631,4.734-19.687,0.776l-22.172-14.498l-13.41,5.153 l37.834,126.529h-35.466L155.63,162.743c-2.688-8.99,2.42-18.456,11.411-21.145c8.987-2.691,18.456,2.42,21.145,11.411 l4.228,14.14l19.099-7.34c5.096-1.96,10.822-1.348,15.392,1.639l19.329,12.638l15.352-11.862 c4.539-3.505,10.536-4.486,15.95-2.611l41.528,14.388l6.277-20.994c2.688-8.99,12.158-14.099,21.145-11.411 C355.477,144.288,360.585,153.754,357.898,162.744z" />
													</svg>
													<span className="btn-text">Suggest a new feature</span>
												</div>
											</LinkButton>

											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://ko-fi.com/roboto"
											>
												<div className="btn-content">
													<img src={kofiLogo} height={24} />
													<span className="btn-text">Buy me a coffee</span>
												</div>
											</LinkButton>
										</div>
										<br />
										<div>
											<Typography>AzerothCore links:</Typography>
										</div>
										<div className="strapi-azerothcore-btn-row">
											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://github.com/azerothcore"
											>
												<div className="btn-content">
													<svg height="24" viewBox="0 0 16 16">
														<path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
													</svg>
													<span className="btn-text">GitHub</span>
												</div>
											</LinkButton>

											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://www.azerothcore.org"
											>
												<div className="btn-content">
													<img src={acLogo} height={24} />
													<span className="btn-text">Website</span>
												</div>
											</LinkButton>

											<LinkButton
												className="strapi-azerothcore-btn has-logo"
												variant="tertiary"
												href="https://discord.com/invite/gkt4y2x"
											>
												<div className="btn-content">
													<svg height="24" viewBox="0 -28.5 256 256">
														<path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"></path>
													</svg>
													<span className="btn-text">Discord</span>
												</div>
											</LinkButton>
										</div>
									</Box>
								</ContentLayout>
							</Main>
						)}
					/>
					<Route
						exact
						path={`/plugins/${pluginId}`}
						render={() => <Redirect to={`/plugins/${pluginId}/home`} />}
					/>
				</Switch>
			</Layout>
		</>
	);
};
