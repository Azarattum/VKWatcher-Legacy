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
    
        i = 0;
        //Iterate through all users in data
        for (const id in data["sessions"]) {
            const userData = data["sessions"][id];
            //Create user object
            let user = new User(userData.name, id);
            //Add sessions
            for (const session of userData.sessions) {
                if (session.from !== undefined) {
                    user.sessions.add(session.from, session.to, session.platform);
                }
            }
            document.getElementsByClassName("users")[0].innerHTML +=
                `<div class="button user" onclick="set(${i})">${userData.name}</div>`;
            //Save user to an array
            users.push(user);
            i++;
        }
    
        setupURLHash();    
        renderUser();
    });
}

function initializeElements() {
    $(".area-slider").ionRangeSlider({
        type: "double"
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
            users[id].sessions.start = +parameters["period"].split('-')[0];
            users[id].sessions.end = +users[id].sessions.days - parameters["period"].split('-')[1];
        }
    }
    else {
        window.location.hash = "user:0,zoom:1,period:1-" + users[id].sessions.days;
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
    let canvas = document.getElementsByClassName("report-render")[0];
    let range = $(".area-slider").data("ionRangeSlider");
    document.getElementsByClassName("user-name")[0].innerHTML = users[id].name;
    document.getElementsByClassName("user-id")[0].innerHTML = users[id].id;
    window.location.hash = window.location.hash.replace(/user:[0-9]+/, "user:" + id);
    drawer = new Drawer(canvas, users[id].sessions);
    drawer.render();
    range.update({
        min: 1,
        max: users[id].sessions.days,
        from: users[id].sessions.start,
        to: users[id].sessions.end,
        onChange: function (data) {
            window.location.hash = window.location.hash.replace(/period:[0-9\-]+/, "period:" + data.from + "-" + data.to);
            let session = users[id].sessions;
            session.start = data.from;
            session.end = session.days - data.to;
            drawer.render();
        }
    });
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