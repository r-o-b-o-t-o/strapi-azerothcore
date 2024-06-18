import {
	SubNav,
	SubNavHeader,
	SubNavLink,
	SubNavSection,
	SubNavSections,
} from "@strapi/design-system/v2";
import { NavLink } from "react-router-dom";

interface IProperties {
	label: string;
	menu: {
		id: string;
		label: string;
		links: {
			id: string;
			to: string;
			label: string;
		}[];
	}[];
}

export const SideNav = ({ label, menu }: IProperties) => {
	return (
		<SubNav>
			<SubNavHeader label={label} />
			<SubNavSections>
				{menu.map((section) => (
					<SubNavSection key={section.id} label={section.label}>
						{section.links.map((link) => {
							return (
								<SubNavLink as={NavLink} to={link.to} key={link.id}>
									{link.label}
								</SubNavLink>
							);
						})}
					</SubNavSection>
				))}
			</SubNavSections>
		</SubNav>
	);
};
