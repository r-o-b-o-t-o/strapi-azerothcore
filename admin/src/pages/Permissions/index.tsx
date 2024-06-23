import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Cog } from "@strapi/icons";
import { useQuery } from "@tanstack/react-query";
import { LoadingIndicatorPage, useFetchClient, useNotification } from "@strapi/helper-plugin";
import { Main, Button, HeaderLayout, ContentLayout, Typography, Box, Link } from "@strapi/design-system";
import { IPermissionsCheck, IPermissionEntry } from "../../../../server/services/settingsService";
import pluginId from "../../pluginId";

import "./index.css";

const PermissionEntry = ({ entry }: { entry: IPermissionEntry }) => {
	const action = entry.action.replace("plugin::", "");
	const split = action.split(".");
	const [plugin, ...name] = split;

	return (
		<Typography>
			<li>
				<span className="strapi-azerothcore-permissions-monospace">{plugin}</span> &gt;{" "}
				<span className="strapi-azerothcore-permissions-monospace">{name.join(".")}</span>:{" "}
				<span>{entry.role.name ?? entry.role.type}</span>
			</li>
		</Typography>
	);
};

export default () => {
	const { get, post } = useFetchClient();
	const toggleNotification = useNotification();
	const checkPermissions = async () => {
		const { data } = await get(`${pluginId}/settings/permissions/check`);
		return data as IPermissionsCheck;
	};
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["checkPermissions"],
		queryFn: checkPermissions,
	});
	const [isFixingIssues, setFixingIssues] = useState(false);

	const fixIssues = async () => {
		setFixingIssues(true);
		try {
			await post(`/${pluginId}/settings/permissions/fix`);
			toggleNotification({
				type: "success",
				message: "Permissions fixed!",
			});
		} catch (error: any) {
			toggleNotification({
				type: "warning",
				message: error?.response?.data?.error?.message ?? "An error occurred.",
			});
		}
		setFixingIssues(false);
		await refetch();
	};

	return (
		<Main>
			{isLoading ? (
				<LoadingIndicatorPage />
			) : (
				<>
					<HeaderLayout title="Permissions" />

					<ContentLayout>
						<Box shadow="tableShadow" hasRadius padding={6} background="neutral0">
							<div>
								<Link as={NavLink} to="/settings/users-permissions/roles" startIcon={<Cog />}>
									Permissions plugin settings
								</Link>
								<br />
								<br />
							</div>

							{data.extra.length === 0 && data.missing.length === 0 ? (
								<div>
									<Typography>✅ No permission issues found</Typography>
								</div>
							) : (
								<>
									{data.extra.length > 0 && (
										<>
											<div>
												<Typography>➖ Remove these permissions:</Typography>
												<ul className="strapi-azerothcore-permissions-list">
													{data.extra.map((entry) => (
														<PermissionEntry key={entry.id} entry={entry} />
													))}
												</ul>
											</div>
											<br />
										</>
									)}

									{data.missing.length > 0 && (
										<>
											<div>
												<Typography>➕ Add these missing permissions:</Typography>
												<ul className="strapi-azerothcore-permissions-list">
													{data.missing.map((entry) => (
														<PermissionEntry
															key={`${entry.action}_${entry.role.type}`}
															entry={entry}
														/>
													))}
												</ul>
											</div>
											<br />
										</>
									)}

									<br />
									<Button onClick={fixIssues} loading={isFixingIssues}>
										🔨 Fix
									</Button>
								</>
							)}
						</Box>
					</ContentLayout>
				</>
			)}
		</Main>
	);
};
