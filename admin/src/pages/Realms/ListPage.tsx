import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash, ExclamationMarkCircle } from "@strapi/icons";
import { LoadingIndicatorPage, LinkButton, useFetchClient, onRowClick, stopPropagation } from "@strapi/helper-plugin";
import {
	Main,
	HeaderLayout,
	ContentLayout,
	Table,
	Thead,
	Tbody,
	Tr,
	Td,
	Th,
	Typography,
	VisuallyHidden,
	Flex,
	IconButton,
	Dialog,
	DialogBody,
	DialogFooter,
	Button,
} from "@strapi/design-system";

import pluginId from "../../pluginId";
import { ISettings } from "../../../../server/services/settingsService";

export default () => {
	const { get, del } = useFetchClient();
	const { push } = useHistory();
	const getSettings = async () => {
		const { data } = await get(`${pluginId}/settings`);
		return data;
	};
	const { isLoading, data, refetch } = useQuery<ISettings>({
		queryKey: ["settings"],
		queryFn: getSettings,
	});
	const realms = Object.keys(data?.realms ?? {})
		.map((key) => parseInt(key))
		.sort((a, b) => a - b)
		.map((id) => ({
			id,
			realm: data?.realms[id],
		}));

	const editRealm = (id: number) => {
		push(`/plugins/${pluginId}/realms/edit/${id}`);
	};

	const deleteRealm = async (id: number) => {
		await del(`/${pluginId}/settings/realm/${id}`);
		await refetch();
	};
	const [deletedRealm, setDeletedRealm] = useState<number | undefined>(undefined);

	return (
		<Main>
			<HeaderLayout
				title="Realms"
				subtitle={isLoading || `${realms.length} realm${realms.length !== 1 ? "s" : ""} found`}
				primaryAction={
					<LinkButton to={`/plugins/${pluginId}/realms/edit`} startIcon={<Plus />} size="S">
						Create realm
					</LinkButton>
				}
			/>
			<ContentLayout>
				{isLoading ? (
					<LoadingIndicatorPage />
				) : (
					<Table colCount={3} rowCount={realms.length}>
						<Thead>
							<Tr>
								<Th>
									<Typography variant="sigma">ID</Typography>
								</Th>
								<Th>
									<Typography variant="sigma">Name</Typography>
								</Th>
								<Th>
									<VisuallyHidden>Actions</VisuallyHidden>
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{realms.map(({ id, realm }) => (
								<Tr key={id} {...onRowClick({ fn: () => editRealm(id) })}>
									<Td>
										<Typography textColor="neutral800">{id}</Typography>
									</Td>
									<Td>
										<Typography textColor="neutral800">{realm?.name}</Typography>
									</Td>
									<Td>
										<Flex gap={1} justifyContent="end" {...stopPropagation}>
											<IconButton
												onClick={() => editRealm(id)}
												noBorder
												label="Edit"
												icon={<Pencil />}
											/>
											<IconButton
												onClick={() => setDeletedRealm(id)}
												noBorder
												label="Delete"
												icon={<Trash />}
											/>
										</Flex>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				)}

				<Dialog
					onClose={() => setDeletedRealm(undefined)}
					title="Confirmation"
					isOpen={deletedRealm !== undefined}
				>
					<DialogBody icon={<ExclamationMarkCircle />}>
						<Flex direction="column" alignItems="center" gap={2}>
							<Flex justifyContent="center">
								<Typography id="confirm-description">
									Do you really want to delete this realm?
								</Typography>
							</Flex>
						</Flex>
					</DialogBody>
					<DialogFooter
						startAction={
							<Button onClick={() => setDeletedRealm(undefined)} variant="tertiary">
								Cancel
							</Button>
						}
						endAction={
							<Button
								variant="danger-light"
								startIcon={<Trash />}
								onClick={() => {
									deleteRealm(deletedRealm!);
									setDeletedRealm(undefined);
								}}
							>
								Confirm
							</Button>
						}
					/>
				</Dialog>
			</ContentLayout>
		</Main>
	);
};
