import IFilter from "./filter.int.js";

/**
 * Filters empty days
 */
export default class EmptyFilter extends IFilter {
    /**
     * Checks whether or not a day satisfies the filter
     * @param {Day} day Day for checking
     */
    passDay(day) {
        //If there are any session at the day, it passes the filter
        if (day.sessions.length == 0) return false;
        else return true;
    }

    /**
     * Checks whether or not a session satisfies the filter
     * @param {Session} session Session for checking
     */
    passSession(session) {
        //This filter does not filter any sessions.
        return true;
    }
}