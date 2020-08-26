import * as $ from "jquery";
import "slick-carousel";
import "./assets/scss/index.scss";

$(document).ready(() =>
{
	const navbarToggler = $<HTMLButtonElement>("#navbar-toggler");
	const navbarTogglerClose = $<HTMLButtonElement>("#navbar-toggler-close");
	const navbarModal = $<HTMLElement>(navbarToggler.attr("data-target"));

	$<HTMLUListElement>("#index-carousel").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 6000
	});

	navbarToggler.click(() =>
	{
		navbarToggler.slideUp(() => navbarToggler.css("visibility", "hidden").css("display", "none"));
		navbarTogglerClose.slideDown(() => navbarTogglerClose.css("visibility", "visible").css("display", "block"));
		navbarModal.addClass("active");
		navbarModal.fadeIn();
		$("html, body").css("overflow-y", "hidden");
	});

	navbarTogglerClose.click(() =>
	{
		navbarTogglerClose.slideUp(() => navbarTogglerClose.css("visibility", "hidden").css("display", "none"));
		navbarToggler.slideDown(() => navbarToggler.css("visibility", "visible").css("display", "block"));
		navbarModal.fadeOut(() => navbarModal.removeClass("active"));
		$("html, body").css("overflow-y", "auto");
	});
});

