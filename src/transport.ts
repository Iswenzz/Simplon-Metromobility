import * as $ from "jquery";
import "./navbar";
import "./assets/scss/transport.scss";
import { Route, RouteProperties } from "mobility";
import { Point, FeatureCollection } from "geojson";
import { setRTLTextPlugin, Map } from "mapbox-gl";
import { TagStops } from "./TagStops";
import { TagLines } from "./TagLines";

export let glMap: Map = null;
export let tagStops: TagStops = null;
export let tagLines: TagLines = null;

export let transportWaysAnimDone = true;
export const transportWays = $<HTMLElement>("#transport-ways");

$(document).ready(async () =>
{
	// initialize map buttons events
	$<HTMLButtonElement>("#transport-ways-toggler").click(toggleRouteDrawer);

	// initialize gl map canvas
	glMap = new Map({
		container: "transport-map",
		style: "https://api.jawg.io/styles/428affb1-5512-4f18-b042-260b24de67f4.json?access-token=rqrBCfJjYJcKDiYxR3c8jod4VTP1SqXB8Sa79EvDHKKNHUI87bf8GfHqsGiQOXcb",
		zoom: 17,
		center: [5.724468, 45.188516]
	});
	glMap.doubleClickZoom.disable();
	setRTLTextPlugin("https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
		(e: Error) => e ? console.log(e) : null);

	// initialize TAG's lines
	await $.ajax({
		url: "https://data.metromobilite.fr/api/routers/default/index/routes",
		type: "GET",
		dataType: "json",
	}).done((data: Route[]) =>
	{
		tagLines = new TagLines(data);
		const aside = $<HTMLElement>("#transport-ways");

		for (const type of tagLines.types)
			aside.append(tagLines.getTransportRoutes(type));
	}).fail((error: JQuery.jqXHR) => 
	{
		console.log(error);
	});

	// initialize TAG's stops
	await $.ajax({
		url: "https://data.metromobilite.fr/api/bbox/json?&types=pointArret",
		type: "GET",
		dataType: "json",
	}).done((geojson: FeatureCollection<Point, RouteProperties>) =>
	{
		tagStops = new TagStops(geojson);
	}).fail((error: JQuery.jqXHR) => 
	{
		console.log(error);
	});
});

/**
 * Toggle the route drawer.
 */
export const toggleRouteDrawer = (): void =>
{
	if (!transportWaysAnimDone)
		return;
	transportWaysAnimDone = false;
	if (transportWays.css("display") === "block")
	{
		transportWays.animate({ left: "-100%" }, 500, () => 
		{
			transportWays.css("display", "none");
			transportWaysAnimDone = true;
		});
	}
	else
	{
		transportWays.css("display", "block").animate({ left: "0" }, 500, () =>
		{
			transportWaysAnimDone = true;
		});
	}
};
