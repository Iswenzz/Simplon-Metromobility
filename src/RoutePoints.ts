import * as $ from "jquery";
import { Marker, MapboxGeoJSONFeature, Popup } from "mapbox-gl";
import { FeatureCollection, Feature, Point } from "geojson";
import { RouteProperties, Route } from "mobility";
import { glMap, tagRoutes } from "./transport";

/**
 * Render TAG's route stops as markers, with a popup to query more information.
 */
export class RoutePoints
{
	public geoJSON: FeatureCollection<Point, RouteProperties>;
	public markers: Marker[] = [];
	public markersOnScreen: Marker[] = [];

	/**
	 * Initialize a new RoutePoints object with the specified geojson data.
	 * @param geojson - The geoJSON data.
	 */
	public constructor(geojson: FeatureCollection<Point, RouteProperties>)
	{
		geojson.features = geojson.features.filter(
			(f: Feature<Point, RouteProperties>) => f.properties.id.includes("SEM"));
		this.geoJSON = geojson;

		glMap.addSource("routestops", {
			type: "geojson",
			data: this.geoJSON
		});
		glMap.addLayer({
			"id": "routestops",
			"type": "fill",
			"source": "routestops",
			// "minzoom": 14,
			// "maxzoom": 20,
			"layout": {},
			"paint": {},
		});
	}

	/**
	 * Create HTML markers, used for caching and keeping track of HTML marker objects
	 */
	public updateMarkers(): void
	{
		const newMarkers: Marker[] = [];
		const features: MapboxGeoJSONFeature[] = glMap.querySourceFeatures("routestops");

		// create an HTML marker if it's not there already
		for (const point of features)
		{
			const feature: Feature<Point, RouteProperties> = point as any;
			const id: string = feature.properties.id;
			const routeName: string = feature.properties.lgn.split(",")[0].split("_")[1];
			const route: Route = tagRoutes.find(r => r.shortName === routeName);
			const color: string = "#" + route?.color ?? "black";
			const textColor: string = "#" + route?.textColor ?? "black";

			let marker: Marker = this.markers[id];
			if (!marker)
			{
				const elem = $(`
					<div class="marker" style="background-color: ${color}; color: ${textColor}">
						${route.shortName}
					</div>
				`);
				marker = this.markers[id] = new Marker({ element: elem.get(0) })
					.setLngLat(feature.geometry.coordinates as [number, number])
					.setPopup(this.createPopup(feature));
			}
			newMarkers[id] = marker;

			if (!this.markersOnScreen[id]) 
				marker.addTo(glMap);
		}
		// remove markers that are no longer visible
		for (const id in this.markersOnScreen)
		{
			if (!newMarkers[id]) 
				this.markersOnScreen[id].remove();
		}
		this.markersOnScreen = newMarkers;
	}

	/**
	 * Create a Popup object for the route marker.
	 * @param feature - Route point properties.
	 */
	private createPopup(feature: Feature<Point, RouteProperties>): Popup
	{
		// const id: string = feature.properties.id;
		const routeName = feature.properties.lgn.split(",")[0].split("_")[1];
		const route: Route = tagRoutes.find(r => r.shortName === routeName);
		const color: string = "#" + route?.color ?? "black";
		const textColor: string = "#" + route?.textColor ?? "black";

		const coordinates = feature.geometry.coordinates.slice();
		const routeInfo = `
			<article class="routeinfo">
				<header style="background-color: ${color}">
					<h3 style="color: ${textColor}">${feature.properties.LIBELLE}</h3>
				</header>
			</article>
		`;

		// $.ajax({
		// 	url: `https://data.mobilites-m.fr/api/routers/default/index/stops/${id}/stoptimes`,
		// 	type: "GET",
		// 	dataType: "json",
		// }).done((route: Route) =>
		// {
		// 	console.log(route);
		// }).fail((error: JQuery.jqXHR<Route>) =>
		// {
		// 	console.log(error);
		// });

		return new Popup().setLngLat(coordinates as [number, number])
			.setHTML(routeInfo)
			.addTo(glMap);
	}
}
