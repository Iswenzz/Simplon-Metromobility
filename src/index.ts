import * as $ from "jquery";
import "./navbar";
import "./transport";
import "slick-carousel";
import "./assets/scss/navbar.scss";
import "./assets/scss/index.scss";

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

$(document).ready(() =>
{
	$<HTMLUListElement>("#index-carousel").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 6000
	});
});
