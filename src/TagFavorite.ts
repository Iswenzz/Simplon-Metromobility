import * as $ from "jquery";
import { createLoaderAnim, formatRealtimeDate } from ".";
import { Route, RouteStopTimes, RouteTime, RouteProperties } from "mobility";
import { tagLines } from "./transport";
import { Feature, Point } from "geojson";

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
		try
		{
			this.features = JSON.parse(localStorage.getItem("transport-favorite") ?? "");
		}
		catch (e)
		{
			console.log(e);
		}
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
		const sender = $<HTMLAnchorElement>(`.routeinfo-favorite-${feature.properties.id.replace(":", "")}`);
		sender.not(":first").remove(); // remove duplicates

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
		const loaderElem: JQuery<HTMLDivElement> = createLoaderAnim();
		// clear previous data
		this.container.html("");
		this.container.append(loaderElem);
		loaderElem.fadeIn("normal");

		for (const feature of this.features)
		{
			const routeName: string = feature.properties.lgn.split(",")[0].split("_")[1];
			const route: Route = tagLines.routes.find(r => r.shortName === routeName);
			const color: string = "#" + route?.color ?? "black";
			const textColor: string = "#" + route?.textColor ?? "black";

			$.ajax({
				url: `https://data.mobilites-m.fr/api/routers/default/index/stops/${feature.properties.id}/stoptimes`,
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
					this.container.append(elem);
					elem.fadeIn("normal");
				}
			}).fail((error: JQuery.jqXHR) =>
			{
				console.log(error);
			});
		}
	}
}
