import * as $ from "jquery";
import "./navbar";
import "./transport";
import "slick-carousel";
import "./assets/scss/navbar.scss";
import "./assets/scss/index.scss";

/**
 * Create a loader animation.
 */
export const createLoaderAnim = (): JQuery<HTMLDivElement> =>
{
	return $<HTMLDivElement>(`
		<div class="sk-folding-cube" style="display: none">
			<div class="sk-cube1 sk-cube"></div>
			<div class="sk-cube2 sk-cube"></div>
			<div class="sk-cube4 sk-cube"></div>
			<div class="sk-cube3 sk-cube"></div>
		</div>
	`);
};

/**
 * Format TAG's realtime to a formated ETA string.
 * @param seconds - TAG's realtime value.
 */
export const formatRealtimeDate = (seconds: number): string =>
{
	const date: Date = new Date(Date.now());
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(seconds);

	const eta: Date = new Date(date.getTime() - Date.now());
	return eta.getMinutes() < 1 ? "<1min" : `${eta.getMinutes()}mins`;
};

$(document).ready(() =>
{
	$<HTMLUListElement>("#index-carousel").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 6000
	});
});
