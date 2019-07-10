/**
 * Filters sessions by device
 */
class DeviceFilter extends IFilter {
    constructor(id, device = null) {
        super(id);
        //#region Fields
        this.device = device;
        //#endregion
    }

    /**
     * Checks whether or not a day satisfies the filter
     * @param {Day} day Day for checking
     */
    passDay(day) {
        //This filter does not filter any days.
        return true;
    }

    /**
     * Checks whether or not a session satisfies the filter
     * @param {Session} session Session for checking
     */
    passSession(session, device = null) {
        device = device || this.device;
        if (device === null) return true;
        
        //Case when the device value is platform id
        if (Number.isFinite(device)) {
            return session.platformId === device;
        }
        //Case when the device value is an array of other values
        else if (Array.isArray(device)) {
            return device.some(subDevice => {
                return this.passSession(session, subDevice);
            });
        }
        //Case when the device value is the name
        else if (typeof(device) === "string"){
            return session.device == device.toLowerCase();
        }
        
        return false;
    }
}