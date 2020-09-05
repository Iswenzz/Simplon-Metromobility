import * as $ from "jquery";
import "./navbar";
import "./assets/scss/transport.scss";
import { Route, RouteProperties } from "mobility";
import { Point, FeatureCollection } from "geojson";
import { setRTLTextPlugin, Map } from "mapbox-gl";
import { TagStops } from "./TagStops";
import { TagLines } from "./TagLines";
import { TagFavorite } from "./TagFavorite";
import { AboutSlide } from "./AboutSlide";
import "normalize.css";

export let glMap: Map = null;
export let tagStops: TagStops = null;
export let tagLines: TagLines = null;
export const tagFavorite: TagFavorite = new TagFavorite($<HTMLElement>("#favorite-container"));
export const covidAboutSlide = new AboutSlide("Votre santé : notre priorité", 
	`Afin d'assurer une reprise de vos déplacements en toute sérénité et dans les meilleures conditions sanitaires, 
	le réseau TAG mobilise ses équipes et ses moyens.
	
	Des mesures de prévention sont déployées dans les transports en commun.
`, "aboutslide");

// setInterval(covidAboutSlide.show.bind(covidAboutSlide), 1000 * 60 * 5); // TP but meh :D

export interface TransportWindow
{
	name: string,
	element: JQuery<HTMLElement>
	isOpened: boolean,
	isAnimDone: boolean,
	toggleCallback: () => void
}

export const windows = {
	ways: { 
		name: "ways",
		element: $<HTMLElement>("#transport-ways, #transport-ways header"),
		isOpened: true,
		isAnimDone: true,
		toggleCallback: function(): void { toggleRouteDrawer(this); }
	},
	favorite: { 
		name: "favorite",
		element: $<HTMLElement>("#favorite-drawer"),
		isOpened: false,
		isAnimDone: true,
		toggleCallback: function(): void { toggleFavoriteDrawer(this); }
	}
};

$(document).ready(async () =>
{
	// show about slide
	covidAboutSlide.toggle();
	// load favorites
	tagFavorite.load();
	
	// map buttons events
	$<HTMLButtonElement>("#transport-ways-toggler").click(toggleWindow.bind(windows, windows["ways"]));
	$<HTMLButtonElement>("#favorite-drawer-toggler").click(toggleWindow.bind(windows, windows["favorite"]));
	$<HTMLButtonElement>("#transport-localisation").click(updateLocalisation);
	$<HTMLButtonElement>("#transport-zoom").click(() => glMap.zoomIn());
	$<HTMLButtonElement>("#transport-unzoom").click(() => glMap.zoomOut());

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
		const aside = $<HTMLElement>("#transport-ways-container");

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
 * Set the map center coordinates to the user's location.
 */
export const updateLocalisation = (): void =>
{
	if (navigator.geolocation)
	{
		const geoOptions: PositionOptions = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};
		navigator.geolocation.getCurrentPosition((position: Position) => 
		{
			glMap.flyTo({
				center: [position.coords.longitude, position.coords.latitude],
				essential: true,
				zoom: 16,
				curve: 1,
				speed: 1
			});
		}, (e: PositionError) => console.log(e), geoOptions);
	}
};

/**
 * Toggle a specific window.
 * @param window - The window object.
 */
export const toggleWindow = (window: TransportWindow): void =>
{
	// close windows
	for (const w of Object.values(windows))
		if (w.name !== window.name && w.isOpened)
			w.toggleCallback();
	// open the specified window
	window.toggleCallback();
};

/**
 * Toggle the route drawer.
 */
export const toggleRouteDrawer = (window: TransportWindow): void =>
{
	if (!window.isAnimDone)
		return;

	window.isAnimDone = false;
	if (window.element.css("display") === "block")
	{
		$("#transport-ways-toggler").text("tram");
		window.element.animate({ left: "-100%" }, 500, () => 
		{
			window.element.css("display", "none");
			window.isAnimDone = true;
		});
		window.isOpened = false;
	}
	else
	{
		window.element.css("display", "block").animate({ left: "0" }, 500, () =>
		{
			window.isAnimDone = true;
			$("#transport-ways-toggler").text("close");
		});
		window.isOpened = true;
	}
};

/**
 * Toggle the favorite drawer.
 */
export const toggleFavoriteDrawer = (window: TransportWindow): void =>
{
	if (!window.isAnimDone)
		return;

	window.isAnimDone = false;
	if (window.element.css("display") === "none")
	{
		$("#favorite-drawer-toggler").children().text("close");
		window.element.css("display", "block").animate({ right: "0" }, 500, () => 
		{
			tagFavorite.render();
			window.isAnimDone = true;
		});
		window.isOpened = true;
	}
	else
	{
		window.element.animate({ right: "-100%" }, 500, () =>
		{
			window.isAnimDone = true;
			$("#favorite-drawer-toggler").children().text("star");
			window.element.css("display", "none");
		});
		window.isOpened = false;
	}
};
