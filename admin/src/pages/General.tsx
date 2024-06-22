import { Form, Formik } from "formik";
import { Check } from "@strapi/icons";
import { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingIndicatorPage, useFetchClient, useOverlayBlocker, useNotification } from "@strapi/helper-plugin";
import { Main, Button, HeaderLayout, ContentLayout, Typography, Checkbox, Flex } from "@strapi/design-system";

import pluginId from "../pluginId";
import { IGeneralSettings } from "../../../server/services/settingsService";

export default () => {
	const { get, put } = useFetchClient();
	const toggleNotification = useNotification();
	const { lockApp, unlockApp } = useOverlayBlocker();
	const getSettings = async () => {
		const { data } = await get(`${pluginId}/settings/general`);
		return data as IGeneralSettings;
	};
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["settings"],
		queryFn: getSettings,
	});
	const formikRef = useRef(null);

	const mutation = useMutation({
		async mutationFn(body: IGeneralSettings) {
			await put(`/${pluginId}/settings/general`, body);
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

	const formInitialValues = {
		allowLinkingExistingGameAccount: data?.allowLinkingExistingGameAccount ?? false,
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
								title="General"
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
									<div>
										<Checkbox
											name="allowLinkingExistingGameAccount"
											required
											value={values?.allowLinkingExistingGameAccount}
											onChange={handleChange}
											error={errors?.allowLinkingExistingGameAccount && "Required"}
										>
											Allow linking existing game accounts
										</Checkbox>
										<Typography>
											This allows registering a CMS account without creating an in-game account if
											the latter already exists
										</Typography>
									</div>
								</Flex>
							</ContentLayout>
						</Form>
					)}
				</Formik>
			)}
		</Main>
	);
};
