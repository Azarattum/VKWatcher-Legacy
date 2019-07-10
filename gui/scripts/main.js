//Drawer object
var drawer;
//Users array
var users = [];
//Selected user id
var id = 0;

function main() {
    load({
        "sessions.json": "sessions"
    }, (data) => {
        initializeElements();
        parseData(data);
        setupURLHash();
        let canvas = document.getElementsByClassName("report-render")[0];
        drawer = new Drawer(canvas, users[id]);
        renderUser();
    });
}

function parseData(data) {
    i = 0;
    //Iterate through all users in data
    for (const id in data["sessions"]) {
        const userData = data["sessions"][id];
        //Create user object
        let user = new User(userData.name, id);
        //Add sessions
        for (const session of userData.sessions) {
            if (session.from !== undefined) {
                user.addSession(
                    new Session(session.from, session.to, session.platform)
                );
            }
        }
        //Add filters
        let empty = new EmptyFilter("empty");
        empty.toggle(false);
        let device = new DeviceFilter("device");
        let period = new PeriodFilter("period");
        const days = Object.keys(user.days);
        period.from = +days[0];
        period.to = +days[days.length - 1];

        user.addFilter(empty);
        user.addFilter(device);
        user.addFilter(period);
        
        //Save user to an array
        users.push(user);
        document.getElementsByClassName("users")[0].innerHTML +=
            `<div class="button user" onclick="set(${i})">${userData.name}</div>`;
        i++;
    }
}

function initializeElements() {
    $(".area-slider").ionRangeSlider({
        type: "double",
        drag_interval: true,
        grid: true,
        prettify: (value) => {
            let date = DateUtils.getDateFromGlobalDay(value).toString();
            date = date.split(' ');
            date = date[1] + " " + date[2];
            return date;
        }
    });
    $(".zoom-slider").ionRangeSlider({
        min: 0.8,
        max: 8,
        step: 0.1,
        from: 1,
        onFinish: function (data) {
            window.location.hash = window.location.hash.replace(/zoom:[0-9.]+/, "zoom:" + data.from);
            document.getElementsByClassName("page")[0].
            style.setProperty("--vertical-zoom", data.from);
            drawer.update();
            drawer.render();
        }
    });
    window.onresize = () => {
        drawer.update();
        drawer.render();
    };
}

function setupURLHash() {
    if (window.location.hash || window.location.hash.slice(1).split(',').length == 3) {
        var parameters = {};
        window.location.hash.slice(1).split(',').forEach(x => {
            parameters[x.split(':')[0]] = x.split(':')[1];
        });

        if (Number.isInteger(+parameters["user"])) {
            id = parameters["user"];
        }

        if (Number.isFinite(+parameters["zoom"])) {
            $(".zoom-slider").data("ionRangeSlider").update({
                from: +parameters["zoom"]
            });
            document.getElementsByClassName("page")[0].
            style.setProperty("--vertical-zoom", +parameters["zoom"]);
        }

        if (parameters["period"].split('-').length == 2) {
            const days = Object.keys(users[id].days);
            users[id].getFilter("period").from = +days[0] + (+parameters["period"].split('-')[0]) - 1;
            users[id].getFilter("period").to = +days[0] + (+parameters["period"].split('-')[1]) - 1;
        }
    }
    else {
        const days = Object.keys(users[id].days);
        window.location.hash = "user:0,zoom:1,period:1-" + days.length;
    }
}

function next() {
    if (id < (users.length - 1)) {
        id++;
        renderUser();
    }
}

function previous() {
    if (id > 0) {
        id--;
        renderUser();
    }
}

function set(i) {
    id = i;
    renderUser();
}

function renderUser() {
    //Get elements
    let range = $(".area-slider").data("ionRangeSlider");
    //Update labels on the page
    document.getElementsByClassName("user-name")[0].innerHTML = users[id].name;
    document.getElementsByClassName("user-id")[0].innerHTML = users[id].id;
    //Update URL location
    window.location.hash = window.location.hash.replace(/user:[0-9]+/, "user:" + id);
    //Render drawer object
    drawer.user = users[id];
    drawer.render();
    //Update range selector
    const days = Object.keys(users[id].days);
    const period = users[id].getFilter("period");
    range.update({
        min: days[0],
        max: days[days.length - 1],
        from: period.from,
        to: period.to,
        onChange: function (data) {
            period.from = data.from;
            period.to = data.to;
            window.location.hash = window.location.hash.replace(/period:[^,]+/,
                "period:" + (period.from - days[0] + 1) + "-" + (period.to - days[0] + 1));
            drawer.render();
        }
    });
    //Update filter hash
    window.location.hash = window.location.hash.replace(/period:[^,]+/,
        "period:" + (period.from - days[0] + 1) + "-" + (period.to - days[0] + 1));
}

function goToUser() {
    window.open("https://vk.com/id" + users[id].id, '_blank').focus();
}

/**
 * Handful function for loading arrays of data with JSON support.
 * @param {Array} urls Array of urls to load.
 * @param {Function} callback Callback(data[]) function.
 */
function load(data, callback) {
    let urls = [];
    let names = false;
    if (Array.isArray(data)) {
        urls = data;
    } else if (typeof data == "object") {
        urls = Object.keys(data);
        names = true;
    } else {
        throw new Error("Data type is not vaild!");
    }

    let responses = [];

    for (const url of urls) {
        let requestObject = new XMLHttpRequest();
        if (url.replace(new RegExp("/$"), "").endsWith(".json")) {
            requestObject.overrideMimeType("application/json");
            requestObject.responseType = "json";
        }

        requestObject.open("GET", url, true);
        requestObject.onreadystatechange = () => {
            if (requestObject.readyState == 4 && requestObject.status == "200") {
                if (!names) {
                    responses.push(requestObject.response);
                } else {
                    let url = urls.find((url) => {
                        let regExp = new RegExp(
                            url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"
                        );
                        return requestObject.responseURL.match(regExp) != null;
                    });

                    responses[data[url]] = requestObject.response;
                }

                if (Object.keys(responses).length == Object.keys(data).length) {
                    callback(responses);
                }
            }
        };
        requestObject.send();
    }
}