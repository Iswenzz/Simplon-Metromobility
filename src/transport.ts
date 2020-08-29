import * as $ from "jquery";
import "./assets/scss/transport.scss";
import { Route, RouteType, RouteTypeAlias, RouteProperties } from "mobility";
import { Point, FeatureCollection, LineString } from "geojson";
import { setRTLTextPlugin, Map, Layer, MapSourceDataEvent } from "mapbox-gl";
import { RoutePoints } from "./RoutePoints";

export interface GeoLayerEntry
{
	code: string,
	geo: Layer
}

export let glMap: Map = null;
export let glMarkers: RoutePoints = null;

export const selectedRoutes: string[] = [];
export const tagRoutes: Route[] = [];
export const tagTypes: RouteTypeAlias[] = [
	{ type: "TRAM", name: "Tram" },
	{ type: "CHRONO", name: "Chrono" },
	{ type: "FLEXO", name: "Flexo" },
	{ type: "PROXIMO", name: "Proximo" }
];

$(document).ready(async () =>
{
	glMap = new Map({
		container: "transport-map",
		style: "https://api.jawg.io/styles/428affb1-5512-4f18-b042-260b24de67f4.json?access-token=rqrBCfJjYJcKDiYxR3c8jod4VTP1SqXB8Sa79EvDHKKNHUI87bf8GfHqsGiQOXcb",
		zoom: 12.01,
		center: [5.72227, 45.16945]
	});
	setRTLTextPlugin("https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
		(e) => console.log(e));
	glMap.setCenter([5.724468, 45.188516]);
	glMap.setZoom(13);

	// get routes
	$.ajax({
		url: "https://data.metromobilite.fr/api/routers/default/index/routes",
		type: "GET",
		dataType: "json",
	}).done((data: Route[]) =>
	{
		tagRoutes.push(...data);
		const aside = $<HTMLElement>("#transport-ways");

		for (const { type } of tagTypes)
			aside.append(getTransportRoutes(data, type));
	}).fail((error: JQuery.jqXHR<Route>) => 
	{
		console.log(error);
	});

	// get stops
	$.ajax({
		url: "https://data.metromobilite.fr/api/bbox/json?&types=pointArret",
		type: "GET",
		dataType: "json",
	}).done((geojson: FeatureCollection<Point, RouteProperties>) =>
	{
		glMarkers = new RoutePoints(geojson);

		// update markers on the screen after the geojson data is loaded
		glMap.on("data", (e: MapSourceDataEvent): void =>
		{
			if (e.sourceId !== "routestops") 
				return;
			glMarkers.updateMarkers();
		});
		
	}).fail((error: JQuery.jqXHR<any>) => 
	{
		console.log(error);
	});
});

/**
 * Get all transport routes from a specific type.
 * @param data - The routes JSON.
 * @param type - The route type.
 */
export const getTransportRoutes = (data: Route[], type: RouteType): JQuery<HTMLElement> =>
{
	const dataFiltered: Route[] = data.filter(w => w.type === type);
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
		entry.click(onRouteClick);
		list.append(entry);
	}
	section.append(header, list);
	return section;
};

/**
 * Render route lines to gl map.
 * @param routeCode - The route code (ex: SEM_C3).
 * @param color - The route color.
 */
export const renderRouteGeoJSON = (routeCode: string, color: string): void =>
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
	}).fail((error: JQuery.jqXHR<any>) =>
	{
		console.log(error);
	});
};

/**
 * Callback on route click.
 * @param e - Mouse click event arg.
 */
export const onRouteClick = (e: JQuery.ClickEvent<HTMLLIElement>): void =>
{
	const target = $<HTMLLIElement>(e.target);
	const id: string = target.attr("data-id");
	const name: string = target.attr("data-name");
	const color: string = target.attr("data-color");
	const transport: string = id.split(":")[0];

	if (selectedRoutes.includes(id))
	{
		target.removeClass("active");
		selectedRoutes.splice(selectedRoutes.indexOf(id), 1);
	}
	else
	{
		target.addClass("active");
		selectedRoutes.push(id);
	}
	renderRouteGeoJSON(`${transport}_${name}`, color);
};
