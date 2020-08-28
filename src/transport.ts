import * as $ from "jquery";
import "./assets/scss/transport.scss";
import { Route, RouteType, RouteTypeAlias } from "mobility";
import { Point, FeatureCollection, LineString } from "geojson";
import { setRTLTextPlugin, Map, Layer, Popup } from "mapbox-gl";

export interface GeoLayerEntry
{
	code: string,
	geo: Layer
}

export let glMap: Map = null;
export const glMarkers: Layer[] = [];
export const selectedRoutes: string[] = [];
export const tagRoutes: Route[] = [];

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

	// gl zoom event
	glMap.on("zoomed", () => 
	{
		// show markers only if map is zoomed enough
		if(glMap.getZoom() >= 15)
			glMarkers.forEach((m: Layer) => glMap.addLayer(m));
		else 
			glMarkers.forEach((m: Layer) => glMap.removeLayer(m.id));
	});

	// get routes
	$.ajax({
		url: "https://data.metromobilite.fr/api/routers/default/index/routes",
		type: "GET",
		dataType: "json",
	}).done((data: Route[]) =>
	{
		tagRoutes.push(...data);
		console.log(data);
		const types: RouteTypeAlias[] = [
			{ type: "TRAM", name: "Tram" },
			{ type: "CHRONO", name: "Chrono" },
			{ type: "FLEXO", name: "Flexo" },
			{ type: "PROXIMO", name: "Proximo" }
		];
		const aside = $<HTMLElement>("#transport-ways");

		for (const { type } of types)
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
	}).done((geojson: FeatureCollection<Point>) =>
	{
		console.log(geojson);
		glMap.addSource("routestops", {
			type: "geojson",
			data: geojson
		});
		glMap.addLayer({
			"id": "routestops",
			"type": "circle",
			"source": "routestops",
			"layout": {},
			"paint": {
				"circle-radius": 8,
				"circle-opacity": 0.8,
				"circle-color": "royalblue",
			}
		});

		// maker events
		glMap.on("click", "routestops", onMarkerPopup);
		glMap.on("mouseenter", "routestops", () => glMap.getCanvas().style.cursor = "pointer");
		glMap.on("mouseleave", "routestops", () => glMap.getCanvas().style.cursor = "");
		
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
		entry.css("background-color", "#" + w.color);
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
 * Callback popup when clicking a route stop.
 * @param e - Event arg.
 */
export const onMarkerPopup = (e: any): void =>
{
	console.log(e);
	const id: string = e.features[0].properties.id;
	const routeName = e.features[0].properties.lgn.split(",")[0].split("_")[1];
	let color: string = tagRoutes.find(r => r.shortName === routeName)?.color ?? "black";
	color = "#" + color;

	const coordinates = e.features[0].geometry.coordinates.slice();
	const routeInfo = `
		<article class="routeinfo">
			<header style="background-color: ${color}">
				<h3>${e.features[0].properties.LIBELLE}</h3>
			</header>
		</article>
	`;

	// ensure that if the map is zoomed out such that multiple
	// copies of the feature are visible, the popup appears over the copy being pointed to
	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
		coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
	new Popup().setLngLat(coordinates)
		.setHTML(routeInfo)
		.addTo(glMap);

	$.ajax({
		url: `https://data.mobilites-m.fr/api/routers/default/index/stops/${id}/stoptimes`,
		type: "GET",
		dataType: "json",
	}).done((route: Route) =>
	{
		console.log(route);
	}).fail((error: JQuery.jqXHR<Route>) =>
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
