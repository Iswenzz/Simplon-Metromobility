declare module "mobility"
{
	export type RouteType = "TRAM" | "C38" | "CHRONO" | "FLEXO" | "SCOL" 
	| "NAVETTE" | "SNC" | "PROXIMO";

	export interface RoutePattern
	{
		desc: string,
		dir: number,
		id: string,
		lastStop: string,
		lastStopName: string,
		shortDesc: string
	}

	export interface RouteTime
	{
		arrivalDelay: number,
		departureDelay: number,
		realtime: boolean,
		realtimeArrival: number,
		realtimeDeparture: number,
		scheduleArrival: number,
		scheduleDeparture: number,
		serviceDay:  number,
		stopId: string,
		stopName: string,
		timepoint: boolean,
		tripId: number
	}

	export interface RouteStopTimes
	{
		pattern: RoutePattern,
		times: RouteTime[]
	}

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
		name: string,
		mode: string,
		icon: string
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
