import * as $ from "jquery";
import { Marker, MapboxGeoJSONFeature, Popup, MapSourceDataEvent } from "mapbox-gl";
import { FeatureCollection, Feature, Point } from "geojson";
import { RouteProperties, Route, RouteStopTimes, RouteTime } from "mobility";
import { glMap, tagLines, tagFavorite } from "./transport";
import { createLoaderAnim, formatRealtimeDate } from "./utility";
import { TAG_API_STOPTIMES } from "./config/API";

export interface MarkerClickArgs
{
	feature: Feature<Point, RouteProperties>,
	popup: Popup
}

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

		// hide all markers if the map zoom is less than 14
		if (glMap.getZoom() < 14)
		{
			if (Object.values(this.glMarkersOnScreen).length)
			{
				for (const id in this.glMarkersOnScreen)
					this.glMarkersOnScreen[id].remove();
				this.glMarkersOnScreen = [];
			}
			return;
		}

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
				const popUp: Popup = this.createPopup(feature);
				const elem = $(`
					<div class="transport-icon-${route.type.toLowerCase()} marker" 
					style="background-color: ${color}; color: ${textColor}">
						${route.shortName}
					</div>
				`);
				elem.click<MarkerClickArgs>({ feature: feature, popup: popUp }, this.onMarkerClick.bind(this));
				
				marker = this.glMarkers[id] = new Marker({ element: elem.get(0) })
					.setLngLat(feature.geometry.coordinates as [number, number])
					.setPopup(popUp);
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
	 * Callback on marker click.
	 * @param e - Click event args.
	 */
	private onMarkerClick(e: JQuery.ClickEvent<HTMLDivElement, MarkerClickArgs, 
	HTMLDivElement, HTMLDivElement>): void
	{
		const content = $<HTMLElement>((e.data.popup as any)._content).children(".routeinfo");
		const container: JQuery<HTMLElement> = content.children(".routeinfo-container");
		const loaderElem: JQuery<HTMLDivElement> = createLoaderAnim();

		// clear previous data
		container.html("");
		container.append(loaderElem);
		loaderElem.fadeIn("normal");

		const routeName: string = e.data.feature.properties.lgn.split(",")[0].split("_")[1];
		const route: Route = tagLines.routes.find(r => r.shortName === routeName);
		const color: string = "#" + route?.color ?? "black";
		const textColor: string = "#" + route?.textColor ?? "black";

		// append favorite button
		const favoriteButton = $<HTMLAnchorElement>(`
			<a type="map" class="routeinfo-favorite routeinfo-favorite-${e.data.feature.properties.id.replace(":", "")}" 
			style="color: ${color}">
				<span class="material-icons">
					${tagFavorite.isFavorite(e.data.feature.properties.id) ? "star" : "star_border"}
				</span>
			</a>
		`);
		favoriteButton.click(tagFavorite.toggle.bind(tagFavorite, e.data.feature));
		content.append(favoriteButton);

		// request stop times
		$.ajax({
			url: TAG_API_STOPTIMES(e.data.feature.properties.id),
			type: "GET",
			dataType: "json",
		}).done((stoptimes: RouteStopTimes[]) =>
		{
			// clear previous data
			loaderElem.fadeOut("normal", () => loaderElem.remove());
			container.html("");

			// show error icon if stoptimes is empty
			if (!stoptimes.length)
			{
				const error = $<HTMLElement>(`
					<section class="d-flex justify-content-center material-icons" 
					style="font-size: 2em; display: none; color: ${color}">
						error
					</section>
				`);
				container.append(error);
				error.fadeIn("normal");
				return;
			}

			// render realtime stops' infos
			for (const stop of stoptimes)
			{
				const times: RouteTime[] = stop.times.splice(0, 3);
				const elem = $<HTMLElement>(`
					<section class="routeinfo-section" style="border-color: ${color}; display: none">
						<div class="transport-icon-${route.type.toLowerCase()} marker" 
						style="background-color: ${color}; color: ${textColor}">
							${route.shortName}
						</div>
						<div>
							<h5>${stop.pattern.desc}</h5>
							<div class="d-flex justify-content-space-between align-content-center">
								${times.map((t: RouteTime) => `
									<p class="p-2">${formatRealtimeDate(t.realtimeArrival)}</p>
								`).join("")}
							</div>
						</div>
					</section>
				`);
				container.append(elem);
				elem.fadeIn("normal");
			}
		}).fail((error: JQuery.jqXHR) =>
		{
			console.log(error);
		});
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
				<section class="routeinfo-container"></section>
			</article>
		`;
		return new Popup()
			.setLngLat(coordinates as [number, number])
			.setHTML(routeInfo);
	}
}
