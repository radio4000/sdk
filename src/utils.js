/*
	 converts "web component" attributes, to supabase sdk query parameters:
	 -> page="1" limit="1"
	 -> from[0] to to[0] limit[0]
 */
export const getBrowsePageParams = ({page, limit}) => {
	let from, to, limitResults;
	from = (page - 1) * limit
	to = from + limit - 1
	limitResults = limit - 1
	return { from, to, limitResults }
}
