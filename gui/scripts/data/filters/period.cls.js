/**
 * Filters days by period
 */
class PeriodFilter extends IFilter {
    constructor(id, from = -Infinity, to = Infinity) {
        super(id);
        //#region Fields
        this.from = from;
        this.to = Math.max(to, from);
        //#endregion
    }

    /**
     * Checks whether or not a day satisfies the filter
     * @param {Day} day Day for checking
     */
    passDay(day) {
        //Filter the day by period
        let globalDay = DateUtils.getGlobalDay(day.date);
        return globalDay >= this.from && globalDay <= this.to;
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