import * as $ from "jquery";
import { createLoaderAnim, formatRealtimeDate } from "./utility";
import { Route, RouteStopTimes, RouteTime, RouteProperties } from "mobility";
import { tagLines } from "./transport";
import { Feature, Point } from "geojson";
import { TAG_API_STOPTIMES } from "./api/API";

/**
 * User favorite TAG's stops.
 */
export class TagFavorite
{
	public container: JQuery<HTMLElement>;
	public features: Feature<Point, RouteProperties>[] = [];

	/**
	 * Initialize a new TagFavorite with the specified container.
	 * @param container - The container to render to.
	 */
	public constructor(container: JQuery<HTMLElement>)
	{
		this.container = container;
	}

	/**
	 * Save features to the localstorage.
	 */
	public save(): void
	{
		localStorage.setItem("transport-favorite", JSON.stringify(this.features));
	}

	/**
	 * Load features from the localstorage.
	 */
	public load(): void
	{
		this.features = JSON.parse(localStorage.getItem("transport-favorite") ?? "{}");
	}

	/**
	 * Check if a stop id is a favorite.
	 * @param id - TAG's stop ID.
	 */
	public isFavorite(id: string): boolean
	{
		return this.features.some(f => f.properties.id === id);
	}

	/**
	 * Add/remove a feature to the list.
	 * @param feature - TAG's stop data.
	 */
	public toggle(feature: Feature<Point, RouteProperties>): void
	{
		const mapFavAnchors = $<HTMLAnchorElement>(
			`.routeinfo-favorite-${feature.properties.id.replace(":", "")}[type*="map"]`);
		const favoriteFavAnchors = $<HTMLAnchorElement>(
			`.routeinfo-favorite-${feature.properties.id.replace(":", "")}[type*="favorite"]`);
		// remove duplicates
		mapFavAnchors.not(":first").remove();
		favoriteFavAnchors.not(":first").remove();
		
		const sender = $<HTMLAnchorElement>(`.routeinfo-favorite-${feature.properties.id.replace(":", "")}`);
		// remove feature if it exists already
		const found: Feature<Point, RouteProperties> = this.features.find(
			f => f.properties.id === feature.properties.id) ?? null;
		if (found)
		{
			if (sender)
				sender.children().text("star_border");
			this.features.splice(this.features.indexOf(found), 1);
		}
		else
		{
			if (sender)
				sender.children().text("star");
			this.features.push(feature);
		}
		this.save();
	}

	/**
	 * Render all features to the container.
	 */
	public render(): void
	{
		// clear previous data
		this.container.html("");

		// if features is empty
		if (!this.features.length)
		{
			this.container.append($<HTMLParagraphElement>("<p>Vous n'avez pas encore de ligne favoris!</p>"));
			return;
		}

		const loaderElem: JQuery<HTMLDivElement> = createLoaderAnim();
		this.container.append(loaderElem);
		loaderElem.fadeIn("normal");

		for (const feature of this.features)
		{
			const routeName: string = feature.properties.lgn.split(",")[0].split("_")[1];
			const route: Route = tagLines.routes.find(r => r.shortName === routeName);
			const color: string = "#" + route?.color ?? "black";
			const textColor: string = "#" + route?.textColor ?? "black";

			$.ajax({
				url: TAG_API_STOPTIMES(feature.properties.id),
				type: "GET",
				dataType: "json",
			}).done((stoptimes: RouteStopTimes[]) =>
			{
				// clear previous data
				loaderElem.fadeOut("normal", () => loaderElem.remove());

				// show error icon if stoptimes is empty
				if (!stoptimes.length)
				{
					const error = $<HTMLElement>(`
						<section class="d-flex justify-content-center material-icons" 
						style="font-size: 2em; display: none; color: ${color}">
							error
						</section>
					`);
					this.container.append(error);
					error.fadeIn("normal");
					return;
				}

				// card element
				const content = $<HTMLElement>(`
					<article class="routeinfo m-2 shadow" style="border-radius: 16px; width: 100%;">
						<header style="background-color: ${color}">
							<h3 style="color: ${textColor}">${feature.properties.LIBELLE}</h3>
						</header>
						<section class="routeinfo-container" style="max-height: initial"></section>
					</article>
				`);
				this.container.append(content);
				const section: JQuery<HTMLElement> = content.children(".routeinfo-container");

				// append favorite button
				const favoriteButton = $<HTMLAnchorElement>(`
					<a type="favorite" class="routeinfo-favorite routeinfo-favorite-${feature.properties.id.replace(":", "")}" 
					style="color: ${color}">
						<span class="material-icons">
							${this.isFavorite(feature.properties.id) ? "star" : "star_border"}
						</span>
					</a>
				`);
				favoriteButton.click(this.toggle.bind(this, feature));
				section.append(favoriteButton);

				// render realtime stops' infos
				for (const stop of stoptimes)
				{
					const times: RouteTime[] = stop.times.splice(0, 3);
					const elem = $<HTMLElement>(`
						<section class="routeinfo-section" style="border-color: ${color}">
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
					section.append(elem);
					elem.fadeIn("normal");
				}
			}).fail((error: JQuery.jqXHR) =>
			{
				console.log(error);
			});
		}
	}
}
