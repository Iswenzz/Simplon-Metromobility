import * as $ from "jquery";
import "./assets/scss/transport.scss";
import { tileLayer, map, Map } from "leaflet";
import { Way, WayType } from "mobility";

$(document).ready(() =>
{
	const leafletMap: Map = map("transport-map");
	tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a> contributors"
	}).addTo(leafletMap);
	leafletMap.setView([51.505, -0.09], 13);

	$.ajax({
		url: "https://data.metromobilite.fr/api/routers/default/index/routes",
		type: "GET",
		dataType: "json",
	}).done((data: Way[]) =>
	{
		const types: WayType[] = ["TRAM", "C38", "CHRONO", "FLEXO", "SCOL", "NAVETTE", "SNC"];
		const aside = $<HTMLElement>("#transport-ways");

		for (const type of types)
			aside.append(addTransportWay(data, type));
	}).fail((error: JQuery.jqXHR<Way>) => 
	{
		console.log(error);
	}).always(() => 
	{
		console.log("Terminé !");
	});
});

const addTransportWay = (data: Way[], type: WayType): JQuery<HTMLElement> =>
{
	const dataFiltered: Way[] = data.filter(w => w.type === type);
	const section = $<HTMLElement>("<section></section>");
	const header = $<HTMLHeadingElement>(`<h2>${type}</h2>`);
	const list = $<HTMLUListElement>("<ul class=\"d-flex justify-content-center\"></ul>");
	const classType = type.replace(/[^a-zA-Z]+/g, "").toLowerCase();

	for (const w of dataFiltered)
	{
		const entry = $<HTMLLIElement>(`<li class="transport-icon-${classType}">${w.shortName}</li>`);
		entry.css("background-color", "#" + w.color);
		entry.click(onWayClick);
		list.append(entry);
	}
	section.append(header, list);
	return section;
};

const onWayClick = (e: JQuery.Event): any =>
{
	// TODO
};
