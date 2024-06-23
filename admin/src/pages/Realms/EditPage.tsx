import { Form, Formik } from "formik";
import { useRef, useState } from "react";
import { ArrowLeft, Check } from "@strapi/icons";
import { useParams, useHistory } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingIndicatorPage, Link, useFetchClient, useOverlayBlocker, useNotification } from "@strapi/helper-plugin";
import {
	Main,
	Button,
	HeaderLayout,
	ContentLayout,
	Grid,
	GridItem,
	TextInput,
	Typography,
	Flex,
} from "@strapi/design-system";

import pluginId from "../../pluginId";
import { IRealmSettings } from "../../../../server/services/settingsService";

export default () => {
	const { get, post, put } = useFetchClient();
	const toggleNotification = useNotification();
	const { lockApp, unlockApp } = useOverlayBlocker();
	const { push } = useHistory();
	const { id } = useParams<{ id: string }>();
	const createMode = id === undefined;
	const realmId = parseInt(id);
	const getRealm = async () => {
		if (createMode) {
			return null;
		}
		const { data } = await get(`${pluginId}/settings/realm/${realmId}`);
		return data as IRealmSettings;
	};
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["realmSettings", realmId],
		queryFn: getRealm,
	});
	const [isTestingCharsConnection, setTestingCharsConnection] = useState(false);
	const [isTestingSoapConnection, setTestingSoapConnection] = useState(false);
	const formikRef = useRef(null);

	const mutation = useMutation({
		async mutationFn(body: IRealmSettings) {
			if (createMode) {
				const res = await put(`/${pluginId}/settings/realm`, body);
				push(`/plugins/${pluginId}/realms/edit/${res.data.id}`);
				return;
			}
			await put(`/${pluginId}/settings/realm/${realmId}`, body);
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
				message: "Realm saved!",
			});

			await refetch();
		},
	});

	const onSubmit = async (data: any) => {
		lockApp?.();
		await mutation.mutateAsync({ ...data });
		unlockApp?.();
	};

	const testCharsConnection = async () => {
		setTestingCharsConnection(true);
		try {
			await post(`/${pluginId}/settings/test-db-connection`, formikRef.current?.values.charactersDatabase);
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
		setTestingCharsConnection(false);
	};

	const testSoapConnection = async () => {
		lockApp?.();
		setTestingSoapConnection(true);
		try {
			await post(`/${pluginId}/settings/test-soap-connection`, (formikRef.current as any)?.values.soap);
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
		setTestingSoapConnection(false);
		unlockApp?.();
	};

	const formInitialValues = {
		name: data?.name ?? "",
		charactersDatabase: {
			host: data?.charactersDatabase.host ?? "localhost",
			port: data?.charactersDatabase.port ?? 3306,
			database: data?.charactersDatabase.database ?? "acore_characters",
			user: data?.charactersDatabase.user ?? "acore",
			password: data?.charactersDatabase.password ?? "",
		},
		soap: {
			host: data?.soap.host ?? "localhost",
			port: data?.soap.port ?? 7878,
			username: data?.soap.username ?? "",
			password: data?.soap.password ?? "",
		},
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
								title={createMode ? "New Realm" : data?.name}
								navigationAction={
									<Link startIcon={<ArrowLeft />} to={`/plugins/${pluginId}/realms`}>
										Back
									</Link>
								}
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
									<Flex direction="column" alignItems="stretch" gap={4}>
										<Typography variant="delta" as="h2">
											Realm details
										</Typography>
										<TextInput
											name="name"
											label="Name"
											required
											value={values?.name}
											onChange={handleChange}
											error={errors?.name && "Name is required"}
										/>
									</Flex>

									<Flex direction="column" alignItems="stretch" gap={4}>
										<Typography variant="delta" as="h2">
											Characters Database
										</Typography>

										<Grid gap={4}>
											<GridItem col={3}>
												<TextInput
													name="charactersDatabase.host"
													label="Host"
													required
													value={values?.charactersDatabase?.host}
													onChange={handleChange}
													error={(errors?.charactersDatabase as any)?.host && "Required"}
												/>
											</GridItem>
											<GridItem col={3}>
												<TextInput
													name="charactersDatabase.port"
													type="number"
													label="Port"
													required
													value={values?.charactersDatabase?.port}
													onChange={handleChange}
													error={(errors?.charactersDatabase as any)?.port && "Required"}
												/>
											</GridItem>
											<GridItem col={6}>
												<TextInput
													name="charactersDatabase.database"
													label="Database"
													required
													value={values?.charactersDatabase?.database}
													onChange={handleChange}
													error={(errors?.charactersDatabase as any)?.database && "Required"}
												/>
											</GridItem>
											<GridItem col={6}>
												<TextInput
													name="charactersDatabase.user"
													label="User"
													required
													value={values?.charactersDatabase?.user}
													onChange={handleChange}
													error={(errors?.charactersDatabase as any)?.user && "Required"}
												/>
											</GridItem>
											<GridItem col={6}>
												<TextInput
													name="charactersDatabase.password"
													type="password"
													label="Password"
													required
													onChange={handleChange}
													error={(errors?.charactersDatabase as any)?.password && "Required"}
												/>
											</GridItem>

											<GridItem col={12}>
												<Flex direction="row" gap={2}>
													<Button
														onClick={testCharsConnection}
														loading={isTestingCharsConnection}
													>
														🔌 Test Connection
													</Button>
												</Flex>
											</GridItem>
										</Grid>
									</Flex>

									<Flex direction="column" alignItems="stretch" gap={4}>
										<Typography variant="delta" as="h2">
											SOAP
										</Typography>

										<Grid gap={4}>
											<GridItem col={3}>
												<TextInput
													name="soap.host"
													label="Host"
													required
													value={values?.soap?.host}
													onChange={handleChange}
													error={(errors?.soap as any)?.host && "Required"}
												/>
											</GridItem>
											<GridItem col={3}>
												<TextInput
													name="soap.port"
													type="number"
													label="Port"
													required
													value={values?.soap?.port}
													onChange={handleChange}
													error={(errors?.soap as any)?.port && "Required"}
												/>
											</GridItem>
											<GridItem col={3}>
												<TextInput
													name="soap.username"
													label="Username"
													required
													value={values?.soap?.username}
													onChange={handleChange}
													error={(errors?.soap as any)?.username && "Required"}
												/>
											</GridItem>
											<GridItem col={3}>
												<TextInput
													name="soap.password"
													type="password"
													label="Password"
													required
													onChange={handleChange}
													error={(errors?.soap as any)?.password && "Required"}
												/>
											</GridItem>

											<GridItem col={12}>
												<Flex direction="row" gap={2}>
													<Button
														onClick={testSoapConnection}
														loading={isTestingSoapConnection}
													>
														🔌 Test Connection
													</Button>
												</Flex>
											</GridItem>
										</Grid>
									</Flex>
								</Flex>
							</ContentLayout>
						</Form>
					)}
				</Formik>
			)}
		</Main>
	);
};
