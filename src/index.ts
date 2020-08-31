import * as $ from "jquery";
import "slick-carousel";
import "./navbar";
import "./assets/scss/index.scss";
import "normalize.css";

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
