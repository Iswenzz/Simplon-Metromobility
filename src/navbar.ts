import * as $ from "jquery";
import "./assets/scss/navbar.scss";

$(document).ready(() =>
{
	const navbarToggler = $<HTMLButtonElement>("#navbar-toggler");
	const navbarTogglerClose = $<HTMLButtonElement>("#navbar-toggler-close");
	const navbarModal = $<HTMLElement>(navbarToggler.attr("data-target"));

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
