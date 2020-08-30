import * as $ from "jquery";
import "./assets/scss/navbar.scss";

export const navbarToggler = $<HTMLButtonElement>("#navbar-toggler");
export const navbarTogglerClose = $<HTMLButtonElement>("#navbar-toggler-close");
export const navbarModal = $<HTMLElement>(navbarToggler.attr("data-target"));

$(document).ready(() =>
{
	// update navbar responsive on document ready & window resize
	updateResponsive();
	$(window).resize(updateResponsive);

	// click events
	navbarToggler.click(openModal);
	navbarTogglerClose.click(closeModal);
});

/**
 * Open the navbar modal.
 */
export const openModal = (): void =>
{
	navbarToggler.slideUp(() => navbarToggler.css("visibility", "hidden").css("display", "none"));
	navbarTogglerClose.slideDown(() => navbarTogglerClose.css("visibility", "visible").css("display", "block"));
	navbarModal.addClass("active");
	navbarModal.fadeIn();
	$("html, body").css("overflow-y", "hidden");
};

/**
 * Close the navbar modal.
 */
export const closeModal = (): void =>
{
	navbarTogglerClose.slideUp(() => navbarTogglerClose.css("visibility", "hidden").css("display", "none"));
	navbarToggler.slideDown(() => navbarToggler.css("visibility", "visible").css("display", "block"));
	navbarModal.fadeOut(() => navbarModal.removeClass("active"));
	$("html, body").css("overflow-y", "auto");
};

/**
 * Update the navbar responsiveness.
 */
export const updateResponsive = (): void =>
{
	if (window.matchMedia("(max-device-width: 1224px)").matches
		|| window.matchMedia("(orientation: portrait)").matches
		|| window.matchMedia("(max-width: 1050px)").matches)
	{
		navbarModal.css("display", "none");
		navbarToggler.css("display", "block");
		navbarTogglerClose.css("display", "none");
	}
	else
	{
		navbarModal.css("display", "block");
		navbarToggler.css("display", "none");
		navbarTogglerClose.css("display", "none");
	}
};
