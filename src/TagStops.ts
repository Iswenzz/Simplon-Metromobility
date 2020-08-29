import * as $ from "jquery";
import { Marker, MapboxGeoJSONFeature, Popup, MapSourceDataEvent } from "mapbox-gl";
import { FeatureCollection, Feature, Point } from "geojson";
import { RouteProperties, Route } from "mobility";
import { glMap, tagLines } from "./transport";

/**
 * Render TAG's route stops as markers, with a popup to query more information.
 */
export class TagStops
{
	public geoJSON: FeatureCollection<Point, RouteProperties>;
	public glMarkers: Marker[] = [];
	public glMarkersOnScreen: Marker[] = [];

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

		// update markers on the screen after the geojson data is loaded
		glMap.on("data", (e: MapSourceDataEvent): void =>
		{
			if (e.sourceId !== "routestops") 
				return;
			this.frame();
		});
	}

	/**
	 * Create HTML markers, used for caching and keeping track of HTML marker objects
	 */
	public frame(): void
	{
		const newMarkers: Marker[] = [];
		const features: MapboxGeoJSONFeature[] = glMap.querySourceFeatures("routestops");

		// create an HTML marker if it's not there already
		for (const point of features)
		{
			const feature: Feature<Point, RouteProperties> = point as any;
			const id: string = feature.properties.id;
			const routeName: string = feature.properties.lgn.split(",")[0].split("_")[1];
			const route: Route = tagLines.routes.find(r => r.shortName === routeName);
			const color: string = "#" + route?.color ?? "black";
			const textColor: string = "#" + route?.textColor ?? "black";

			let marker: Marker = this.glMarkers[id];
			if (!marker)
			{
				const elem = $(`
					<div class="marker" style="background-color: ${color}; color: ${textColor}">
						${route.shortName}
					</div>
				`);
				marker = this.glMarkers[id] = new Marker({ element: elem.get(0) })
					.setLngLat(feature.geometry.coordinates as [number, number])
					.setPopup(this.createPopup(feature));
			}
			newMarkers[id] = marker;

			if (!this.glMarkersOnScreen[id]) 
				marker.addTo(glMap);
		}
		// remove markers that are no longer visible
		for (const id in this.glMarkersOnScreen)
		{
			if (!newMarkers[id]) 
				this.glMarkersOnScreen[id].remove();
		}
		this.glMarkersOnScreen = newMarkers;
	}

	/**
	 * Create a Popup object for the route marker.
	 * @param feature - Route point properties.
	 */
	private createPopup(feature: Feature<Point, RouteProperties>): Popup
	{
		// const id: string = feature.properties.id;
		const routeName: string = feature.properties.lgn.split(",")[0].split("_")[1];
		const route: Route = tagLines.routes.find(r => r.shortName === routeName);
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
		return new Popup().setLngLat(coordinates as [number, number])
			.setHTML(routeInfo)
			.addTo(glMap);
	}
}
