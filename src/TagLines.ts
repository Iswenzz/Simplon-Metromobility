import * as $ from "jquery";
import { FeatureCollection, LineString } from "geojson";
import { Route, RouteType, RouteTypeAlias } from "mobility";
import { glMap } from "./transport";

/**
 * Render TAG's route lines.
 */
export class TagLines
{
	public selectedRoutes: string[] = [];

	public routes: Route[] = [];
	public types: RouteTypeAlias[] = [
		{ type: "TRAM", name: "Tram" },
		{ type: "CHRONO", name: "Chrono" },
		{ type: "FLEXO", name: "Flexo" },
		{ type: "PROXIMO", name: "Proximo" }
	];

	/**
	 * Initialize a new TagLines object with the specified routes data.
	 * @param data - The TAG's routes lines.
	 */
	public constructor(data: Route[])
	{
		this.routes = data;
	}

	/**
	 * Get all transport routes from a specific type.
	 * @param data - The routes JSON.
	 * @param type - The route type.
	 */
	public getTransportRoutes(type: RouteType): JQuery<HTMLElement>
	{
		const dataFiltered: Route[] = this.routes.filter(w => w.type === type);
		const section = $<HTMLElement>("<section></section>");
		const header = $<HTMLHeadingElement>(`<h2>${type}</h2>`);
		const list = $<HTMLUListElement>("<ul class=\"d-flex justify-content-center\"></ul>");
		const classType: string = type.replace(/[^a-zA-Z]+/g, "").toLowerCase();

		for (const w of dataFiltered)
		{
			const entry = $<HTMLLIElement>(`<li data-id="${w.id}" data-name="${w.shortName}" data-color="${"#" + w.color}" data-gtfsId="${w.gtfsId}" class="transport-icon-${classType}">${w.shortName}</li>`);
			entry.css({
				"background-color": "#" + w.color,
				"color": "#" + w.textColor
			});
			entry.click(this.onRouteLogoClick.bind(this));
			list.append(entry);
		}
		section.append(header, list);
		return section;
	}

	/**
	 * Render route lines to gl map.
	 * @param routeCode - The route code (ex: SEM_C3).
	 * @param color - The route color.
	 */
	private renderRoute(routeCode: string, color: string): void
	{
		$.ajax({
			url: `https://data.metromobilite.fr/api/lines/json?types=ligne&codes=${routeCode}`,
			type: "GET",
			dataType: "json",
		}).done((geojson: FeatureCollection<LineString>) =>
		{
			if (glMap.getLayer(routeCode))
				glMap.removeLayer(routeCode);
			else
			{
				if (!glMap.getSource(routeCode))
					glMap.addSource(routeCode, {
						type: "geojson",
						data: geojson
					});
				glMap.addLayer({
					"id": routeCode,
					"type": "line",
					"source": routeCode,
					"layout": {},
					"paint": {
						"line-width": 5,
						"line-opacity": 0.8,
						"line-color": color,
					}
				});
			}
		}).fail((error: JQuery.jqXHR) =>
		{
			console.log(error);
		});
	}

	/**
	 * Callback on route logo click.
	 * @param e - Mouse click event arg.
	 */
	private onRouteLogoClick(e: JQuery.ClickEvent<HTMLLIElement>): void
	{
		const target = $<HTMLLIElement>(e.target);
		const id: string = target.attr("data-id");
		const name: string = target.attr("data-name");
		const color: string = target.attr("data-color");
		const transport: string = id.split(":")[0];

		if (this.selectedRoutes.includes(id))
		{
			target.removeClass("active");
			this.selectedRoutes.splice(this.selectedRoutes.indexOf(id), 1);
		}
		else
		{
			target.addClass("active");
			this.selectedRoutes.push(id);
		}
		this.renderRoute(`${transport}_${name}`, color);
	}
}
