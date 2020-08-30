import * as $ from "jquery";

/**
 * Represent an about popup usualy used when the user first use the app.
 */
export class AboutSlide
{
	public title: string;
	public message: string;

	public element: JQuery<HTMLElement>;
	public className: string;
	public style: CSSStyleDeclaration;
	
	/**
	 * Initialize a new about slide with the specified properties.
	 * @param title - The title of the about slide.
	 * @param message - The message of the about slide. 
	 * @param className - The className used on the element.
	 * @param style - The inline style used on the element.
	 */
	public constructor(title: string, message: string, className?: string, style?: CSSStyleDeclaration)
	{
		this.title = title;
		this.message = message;
		this.className = className;
		this.style = style;
		this.createElement();
	}

	/**
	 * Create the toggle element.
	 */
	public createElement(): void
	{
		const button = $<HTMLButtonElement>(`
			<button class="p-2 px-3" type="button">
				OK !
			</button>
		`);
		button.click(this.toggle.bind(this));

		this.element?.remove();
		this.element = $<HTMLElement>(`
			<article class="${this.className}" style="${this.style}; display: none">
				<section class="d-flex justify-content-center align-items-center">
					<header>
						<h3>${this.title}</h3>
						<p>${this.message}</p>
					</header>
				</section>
			</article>
		`);
		this.element.children().append(button);
		$(document.body).append(this.element);
	}

	/**
	 * Toggle the about element.
	 */
	public toggle(): void
	{
		if (this.element.css("display") === "none")
			this.element.fadeIn();
		else
			this.element.fadeOut();
	}

	/**
	 * Show the about element.
	 */
	public show(): void
	{
		if (this.element.css("display") === "none")
			this.element.fadeIn();
	}

	/**
	 * Hide the about element.
	 */
	public hide(): void
	{
		if (this.element.css("display") === "block")
			this.element.fadeOut();
	}
}
