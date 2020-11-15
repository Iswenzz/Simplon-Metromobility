/**
 * Get all stops from a specified route ID.
 * @param id - The route ID.
 */
export const TAG_API_STOPTIMES = (id: string): string => 
	`https://data.mobilites-m.fr/api/routers/default/index/stops/${id}/stoptimes`;

/**
 * Get all lines from a specified route ID/CODE.
 * @param routeCode - The route ID/CODE.
 */
export const TAG_API_LINES = (routeCode: string): string => 
	`https://data.metromobilite.fr/api/lines/json?types=ligne&codes=${routeCode}`;

/**
 * Get all TAG's routes.
 */
export const TAG_API_ROUTES = (): string => 
	"https://data.metromobilite.fr/api/routers/default/index/routes";

/**
 * Get all TAG's stops.
 */
export const TAG_API_BBOX = (): string => 
	"https://data.metromobilite.fr/api/bbox/json?&types=pointArret";
