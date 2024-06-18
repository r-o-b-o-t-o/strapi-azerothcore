import { Route, Switch } from "react-router-dom";
import { AnErrorOccurred } from "@strapi/helper-plugin";

import EditPage from "./EditPage";
import ListPage from "./ListPage";
import pluginId from "../../pluginId";
import QueryProvider from "../../components/QueryProvider";

export default () => {
	return (
		<QueryProvider>
			<Switch>
				<Route path={`/plugins/${pluginId}/realms/edit/:id?`} component={EditPage} exact />
				<Route path={`/plugins/${pluginId}/realms`} component={ListPage} exact />
				<Route path="" component={AnErrorOccurred} />
			</Switch>
		</QueryProvider>
	);
};
