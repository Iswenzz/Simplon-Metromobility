declare module "mobility"
{
	export type RouteType = "TRAM" | "C38" | "CHRONO" | "FLEXO" | "SCOL" | "NAVETTE" | "SNC" | "PROXIMO";

	export interface RouteTypeAlias
	{
		type: RouteType,
		name: string
	}

	export interface Route
	{
		color: string,
		gtfsId: string,
		id: string,
		longName: string,
		mode: string,
		shortName: string,
		textColor: string,
		type: RouteType
	}
}
