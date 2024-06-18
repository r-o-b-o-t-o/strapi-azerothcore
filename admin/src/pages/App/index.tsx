/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import { Switch, Route } from "react-router-dom";
import { AnErrorOccurred } from "@strapi/helper-plugin";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomePage from "../Home";
import pluginId from "../../pluginId";

const App = () => {
	const queryClient = new QueryClient();

	return (
		<div>
			<QueryClientProvider client={queryClient}>
				<Switch>
					<Route path={`/plugins/${pluginId}`} component={HomePage} />
					<Route component={AnErrorOccurred} />
				</Switch>
			</QueryClientProvider>
		</div>
	);
};

export default App;
