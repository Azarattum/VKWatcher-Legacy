/**
 * Class that represents user with its data
 */
class User {
    /**
     * Creates a user object
     * @param {String} name User's display name
     * @param {Number} id User's vk id
     */
    constructor(name, id) {
        this.id = id;
        this.name = name;
        this._sessions = new Sessions();
    }

    /**
     * Returns the session array object
     */
    get sessions() {
        return this._sessions;
    }
}

/**
 * An array of sesson objects
 */
class Sessions extends Array {
    /**
     * Creates a sessions array object 
     * @param  {...any} args Session arguments
     */
    constructor(...args) {
        super(...args);
        this._start = 0;
        this._end = this.length - 1;
        this._startDay = 0;
        this._endDay = 0;
    }

    get start() {
        return this._startDay;
    }

    get end() {
        return this._endDay;
    }

    set start(value) {
        let start = 0;
        let previousDate = -1;
        for (var i = 0; i < this.length; i++) {
            const session = this[i];
            let date = session.from.getDate();
            if (date != previousDate) {
                start++;
                if (start == value) {
                    break;
                }
            }
            previousDate = date;
        }

        if (i >= 0 && i < this._end) {
            this._start = i;
            this._startDay = value;
        }
    }

    set end(value) {
        let end = 0;
        let previousDate = -1;
        for (var i = (this.length - 1); i >= 0; i--) {
            const session = this[i];
            let date = session.from.getDate();
            if (date != previousDate) {
                end++;
                if (end == (value + 1)) {
                    break;
                }
            }
            previousDate = date;
        }

        if (i <= (this.length - 1) && i > this._start) {
            this._end = i;
            this._endDay = this.days - value;
        }
    }

    get first() {
        return this[this._start];
    }

    get last() {
        return this[this._end];
    }

    get days() {
        if (this.length == 0) return 0;
        return this._getDaysBetween(this[0].to, this[this.length - 1].from) + 1;
    }

    /**
     * Adds session by defining params
     * @param {Number} from Session start in unix time
     * @param {Number} to Session end in unix time
     * @param {Number} platform Session device id
     */
    add(from, to = from, platform = 0) {
        let fromDate = new Date(from * 1000);
        let toDate = new Date(to * 1000);

        if (fromDate.getDate() < toDate.getDate()) {
            fromDate.setHours(23);
            fromDate.setMinutes(59);
            fromDate.setSeconds(59);

            super.push(new Session(from, +fromDate / 1000, platform));
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
            super.push(new Session(+toDate / 1000, to, platform));
        } else {
            super.push(new Session(from, to, platform));
        }

        this._end = this.length - 1;
        this._endDay = this.days;
    }

    /**
     * Return an element from an array
     * @param {Number} id Identificator of an element to return
     */
    get(id) {
        return this[id];
    }

    _getDaysBetween(date1, date2) {
        date1 = new Date(date1);
        date2 = new Date(date2);
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date2.setHours(0);
        date2.setMinutes(0);
        date2.setSeconds(0);
        const dateDifference = Math.abs(date1 - date2);
        const oneDay = 24*60*60*1000;
        return Math.round(dateDifference/oneDay);
    }
}

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
        const platforms = ["unknown", "mobile", "iphone", "ipad", "android", "wphone", "windows", "web"];
        if (from >= to) {
            from = to - 15;
        }

        this.from = new Date(from * 1000);
        this.to = new Date(Math.max(from, to) * 1000);
        this.device = platforms[platform];
    }
}