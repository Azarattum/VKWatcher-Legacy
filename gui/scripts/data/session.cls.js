/**
 * Class represents single user's session
 */
class Session {
    /**
     * Creates a new session object
     * @param {Number} from Session start in unix time
     * @param {Number} to Session end in unix time
     * @param {Number} platform Session device id
     */
    constructor(from, to = from, platform = 0) {
        /**Devices according to an official docs.*/
        const platforms = ["unknown", "mobile", "iphone", "ipad", "android", "wphone", "windows", "web"];
        //Perform the convertions for futher procession
        if (from instanceof Date) from = Math.round(+from / 1000);
        if (to instanceof Date) to = Math.round(+to / 1000);
        if (from >= to) from = to - 15;

        //#region Fields
        this.from = new Date(from * 1000);
        this.to = new Date(Math.max(from, to) * 1000);
        this.platformId = platform;
        this.device = platforms[platform];
        //#endregion
    }

    /**
     * Length of the session in seconds
     */
    get length() {
        return Math.round((+this.to - this.from) / 1000);
    }

    /**
     * Checks is the date covered by the session
     * @param {Date} date Date to check coverage
     * @param {Boolen} dailyPrecision Check only date, but not time
     */
    isCovered(date, dailyPrecision = true) {
        let from = dailyPrecision? +DateUtils.normalizeDateUp(this.from): +this.from;
        let to = dailyPrecision? +DateUtils.normalizeDateDown(this.to): +this.to;

        return +date >= from && +date <= to;
    }

    /**
     * Checks whether the session covers 00:00
     */
    isOverNight() {
        return (this.from.getDate() !== this.to.getDate()) ||
            (this.from.getMonth() !== this.to.getMonth()) ||
            (this.from.getFullYear() !== this.to.getFullYear());
    }

    /**
     * Split the session into an array, so they do not cover 00:00
     */
    splitOverNights() {
        let sessions = [];
        if (!this.isOverNight()) return [this];

        //Create the first day session
        let from = new Date(+this.from);
        let to = new Date(+this.from);
        to = DateUtils.normalizeDateDown(to);
        sessions.push(new Session(from, to, this.platformId));

        let fullDays = DateUtils.getDaysBetween(this.from, this.to) - 1;
        for (let i = 0; i < fullDays; i++) {
            //Add a day
            from.setDate(from.getDate() + 1);
            to.setDate(to.getDate() + 1);
            //Select a full day
            from = DateUtils.normalizeDateUp(from);
            to = DateUtils.normalizeDateDown(to);
            //Create a full day session
            sessions.push(new Session(from, to, this.platformId));
        }

        //Create a last day session
        from = new Date(+this.to);
        to = new Date(+this.to);
        from = DateUtils.normalizeDateUp(from);
        sessions.push(new Session(from, to, this.platformId));

        return sessions;
    }
}