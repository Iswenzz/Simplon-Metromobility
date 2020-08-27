import * as $ from "jquery";
import "./navbar";
import "./transport";
import "slick-carousel";
import "./assets/scss/navbar.scss";
import "./assets/scss/index.scss";

$(document).ready(() =>
{
	$<HTMLUListElement>("#index-carousel").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 6000
	});
});
