import * as $ from "jquery";
import "slick-carousel";
import "./navbar";
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
	// get the current day and set it to midnight + the seconds we get from the API
	const date: Date = new Date(Date.now());
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(seconds);

	// substract the next stop date by the current date minus 1 hour
	const eta: Date = new Date(date.getTime() - Date.now() - (3600 * 1000));
	if (eta.getHours() >= 1)
		return `${date.getHours()}:${date.getMinutes()}`;
	else if (eta.getMinutes() < 1)
		return "<1min";
	else
		return `${eta.getMinutes()}mins`;
};

$(document).ready(() =>
{
	$<HTMLUListElement>("#index-carousel").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 6000,
		swipe: true,
		swipeToSlide: true
	});
});
