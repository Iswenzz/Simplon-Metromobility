import * as $ from "jquery";
import "./assets/scss/transport.scss";
import { tileLayer, map, Map, geoJSON, Layer, circleMarker, LatLng, LeafletEvent, Popup } from "leaflet";
import { Route, RouteType, RouteTypeAlias, RouteProperties } from "mobility";
import { Feature, Geometry, Point } from "geojson";

export interface GeoLayerEntry
{
	code: string,
	geo: Layer
}

export const leafletMap: Map = map("transport-map");
export const leafletGeoLayers: GeoLayerEntry[] = [];
export const leafletMarkers: Layer[] = [];
export const selectedRoutes: string[] = [];

$(document).ready(async () =>
{
	tileLayer("https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}", {
		attribution: "<a href=\"http://jawg.io\" title=\"Tiles Courtesy of Jawg Maps\" target=\"_blank\">&copy; <b>Jawg</b>Maps</a> &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
		minZoom: 0,
		maxZoom: 20,
		accessToken: "rqrBCfJjYJcKDiYxR3c8jod4VTP1SqXB8Sa79EvDHKKNHUI87bf8GfHqsGiQOXcb"
	}).addTo(leafletMap);
	leafletMap.setView([45.188516, 5.724468], 13);

	// leaflet zoom event
	leafletMap.on("zoomend", () => 
	{
		// show markers only if map is zoomed enough
		if(leafletMap.getZoom() >= 14)
			leafletMarkers.forEach(m => m.addTo(leafletMap));
		else 
			leafletMarkers.forEach(m => m.removeFrom(leafletMap));
	});

	// get routes
	$.ajax({
		url: "https://data.metromobilite.fr/api/routers/default/index/routes",
		type: "GET",
		dataType: "json",
	}).done((data: Route[]) =>
	{
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
		url: "https://data.metromobilite.fr/api/bbox/json?&types=arret",
		type: "GET",
		dataType: "json",
	}).done((data: any) =>
	{
		console.log(data);
		geoJSON(data, {
			pointToLayer: (feature: Feature<Point, RouteProperties>, latlng: LatLng): Layer => {
				return circleMarker(latlng, {
					radius: 8,
					fillColor: "royalblue",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			},
			onEachFeature: (feature: Feature<Geometry, RouteProperties>, layer: Layer): void => 
			{
				const routeInfo = $<HTMLElement>(`
					<article class="routeinfo">
						<header>
							<h3>${feature.properties.LIBELLE}</h3>
						</header>
					</article>
				`);

				leafletMarkers.push(layer);
				layer.bindPopup(routeInfo.get(0), {
					className: "routeinfo-popup"
				});
				layer.addEventListener("click", onMarkerPopup);
			}
		}).addTo(leafletMap);
		
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
 * Render route lines to leaflet map.
 * @param routeCode - The route code (ex: SEM_C3).
 * @param color - The route color.
 */
export const renderRouteGeoJSON = (routeCode: string, color: string): void =>
{
	$.ajax({
		url: `https://data.metromobilite.fr/api/lines/json?types=ligne&codes=${routeCode}`,
		type: "GET",
		dataType: "json",
	}).done((geoJson: any) =>
	{
		if (leafletGeoLayers[routeCode])
		{
			leafletGeoLayers[routeCode].removeFrom(leafletMap);
			leafletGeoLayers[routeCode] = undefined;
		}
		else
		{
			leafletGeoLayers[routeCode] = geoJSON(geoJson.features[0], {
				style: {
					color: color,
					weight: 5,
					opacity: 0.65
				}
			});
			leafletMap.addLayer(leafletGeoLayers[routeCode]);
		}
		// leafletMap.setView(geoJson.features[0].geometry.coordinates[0].reverse(), 13);
	}).fail((error: JQuery.jqXHR<any>) =>
	{
		console.log(error);
	});
};

/**
 * 
 * @param e 
 */
export const onMarkerPopup = (e: LeafletEvent): void =>
{
	const popUp = e.target._popup._content;
	const feature: Feature<Geometry, RouteProperties> = e.target.feature;
	console.log(feature);
	$(popUp).children().first().css("background-color", "red");
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
