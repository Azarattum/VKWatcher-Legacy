/**
 * Interface for sessions and days filters
 */
export default class IFilter {
    constructor(id) {
        //Interface exception
        if (new.target === IFilter) {
            throw new TypeError("Cannot construct an interface!");
        }
        //#region Fields
        this.id = id;
        this.enabled = true;
        //#region

        if (this.id === undefined) {
            throw new Error("You must specify filter id!");
        }
    }

    /**
     * Checks whether or not a day satisfies the filter
     * @param {Day} day Day for checking
     */
    passDay(day) {
        throw new Error("Not implemented exception!");
        return true;
    }

    /**
     * Checks whether or not a session satisfies the filter
     * @param {Session} session Session for checking
     */
    passSession(session) {
        throw new Error("Not implemented exception!");
        return true;
    }

    /**
     * Toggle the state of the filter.
     * @param {Boolean} value Enable or disable the filter.
     */
    toggle(value = undefined) {
        if (value === undefined) {
            this.enabled = !this.enabled;
        } else {
            this.enabled = value;
        }
    }
}