declare module "mobility"
{
	export type WayType = "TRAM" | "C38" | "CHRONO" | "FLEXO" | "SCOL" | "NAVETTE" | "SNC";

	export interface Way
	{
		color: string,
		gtfsId: string,
		id: string,
		longName: string,
		mode: string,
		shortName: string,
		textColor: string,
		type: WayType
	}
}
