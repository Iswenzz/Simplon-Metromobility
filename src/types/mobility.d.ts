declare module "mobility"
{
	export type RouteType = "TRAM" | "C38" | "CHRONO" | "FLEXO" | "SCOL" | "NAVETTE" | "SNC" | "PROXIMO";

	export interface RouteProperties
	{
		CODE: string,
		COMMUNE: string,
		LIBELLE: string,
		ZONE: string,
		PMR: string,
		LaMetro: boolean,
		LeGresivaudan: boolean,
		PaysVoironnais: boolean,
		arr_visible?: string,
		id: string,
		lgn: string,
		type: string
	}

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
