import { Form, Formik } from "formik";
import { Check } from "@strapi/icons";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingIndicatorPage, useFetchClient, useOverlayBlocker, useNotification } from "@strapi/helper-plugin";
import { Main, Button, HeaderLayout, ContentLayout, Grid, GridItem, TextInput, Flex } from "@strapi/design-system";

import pluginId from "../pluginId";
import { IDatabaseSettings } from "../../../server/services/settingsService";

export default () => {
	const { get, post, put } = useFetchClient();
	const toggleNotification = useNotification();
	const { lockApp, unlockApp } = useOverlayBlocker();
	const getSettings = async () => {
		const { data } = await get(`${pluginId}/settings/authdb`);
		return data as IDatabaseSettings;
	};
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["settings"],
		queryFn: getSettings,
	});
	const [isTestingConnection, setTestingConnection] = useState(false);
	const formikRef = useRef(null);

	const mutation = useMutation({
		async mutationFn(body: IDatabaseSettings) {
			await put(`/${pluginId}/settings/authdb`, body);
		},

		onError(error) {
			toggleNotification({
				type: "warning",
				message: error.message,
			});
		},

		async onSuccess() {
			toggleNotification({
				type: "success",
				message: "Settings saved!",
			});

			await refetch();
		},
	});

	const onSubmit = async (data: any) => {
		lockApp?.();
		await mutation.mutateAsync({ ...data });
		unlockApp?.();
	};

	const testConnection = async () => {
		setTestingConnection(true);
		try {
			await post(`/${pluginId}/settings/test-db-connection`, formikRef.current?.values);
			toggleNotification({
				type: "success",
				message: "Connection successful!",
			});
		} catch (error: any) {
			toggleNotification({
				type: "warning",
				message: error?.response?.data?.error?.message ?? "Connection failed.",
			});
		}
		setTestingConnection(false);
	};

	const formInitialValues = {
		host: data?.host ?? "localhost",
		port: data?.port ?? 3306,
		database: data?.database ?? "acore_auth",
		user: data?.user ?? "acore",
		password: data?.password ?? "",
	};

	return (
		<Main>
			{isLoading ? (
				<LoadingIndicatorPage />
			) : (
				<Formik innerRef={formikRef} enableReinitialize initialValues={formInitialValues} onSubmit={onSubmit}>
					{({ handleSubmit, values, handleChange, errors }) => (
						<Form noValidate onSubmit={handleSubmit}>
							<HeaderLayout
								title="Auth Database"
								primaryAction={
									<Button startIcon={<Check />} size="S" type="submit" loading={mutation.isPending}>
										Save
									</Button>
								}
							/>

							<ContentLayout>
								<Flex
									background="neutral0"
									direction="column"
									alignItems="stretch"
									gap={7}
									hasRadius
									paddingTop={6}
									paddingBottom={6}
									paddingLeft={7}
									paddingRight={7}
									shadow="filterShadow"
								>
									<Grid gap={4}>
										<GridItem col={3}>
											<TextInput
												name="host"
												label="Host"
												required
												value={values?.host}
												onChange={handleChange}
												error={errors?.host && "Required"}
											/>
										</GridItem>
										<GridItem col={3}>
											<TextInput
												name="port"
												type="number"
												label="Port"
												required
												value={values?.port}
												onChange={handleChange}
												error={errors?.port && "Required"}
											/>
										</GridItem>
										<GridItem col={6}>
											<TextInput
												name="database"
												label="Database"
												required
												value={values?.database}
												onChange={handleChange}
												error={errors?.database && "Required"}
											/>
										</GridItem>
										<GridItem col={6}>
											<TextInput
												name="user"
												label="User"
												required
												value={values?.user}
												onChange={handleChange}
												error={errors?.user && "Required"}
											/>
										</GridItem>
										<GridItem col={6}>
											<TextInput
												name="password"
												type="password"
												label="Password"
												required
												onChange={handleChange}
												error={errors?.password && "Required"}
											/>
										</GridItem>

										<GridItem col={12}>
											<Flex direction="row" gap={2}>
												<Button onClick={testConnection} loading={isTestingConnection}>
													Test Connection
												</Button>
											</Flex>
										</GridItem>
									</Grid>
								</Flex>
							</ContentLayout>
						</Form>
					)}
				</Formik>
			)}
		</Main>
	);
};
