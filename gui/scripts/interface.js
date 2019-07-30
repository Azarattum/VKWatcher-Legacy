/**
 * JavaScript interface intended to be used inside HTML
 */

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

function open() {
    window.open("https://vk.com/id" + users[id].id, '_blank').focus();
}

function toggleEmptyFilter() {
    users[id].getFilter("empty").toggle(
        !document.getElementById("empty-filter").checked
    );
    hash.set("empty", document.getElementById("empty-filter").checked);
    dataDrawer.render();
}

function changeDeviceFilter(deviceId) {
    users[id].getFilter("device").device = +deviceId;
    hash.set("device", deviceId);
    dataDrawer.render();
}

function tab(eventArgs, tabId) {
    if (document.getElementById(tabId).style.display == "block") return;

    //Hide all tabs
    let tabcontents = document.getElementsByClassName("tabcontent");
    for (const tab of tabcontents) {
        tab.style.display = "none";
    }

    //Remove all fills
    let tablinks = document.getElementsByClassName("tablinks");
    for (const link of tablinks) {
        link.className = link.className.replace(" filled", "");
    }

    document.getElementById(tabId).style.display = "block";
    eventArgs.currentTarget.className += " filled";

    if (tabId == "chart") {
        setTimeout(() => {
            chartDrawer.switch(users[id]);
        }, 50);
    } else if (tabId == "overview") {
        dataDrawer.update();
        dataDrawer.render();
    }
}