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
    drawer.render();
}

function changeDeviceFilter(deviceId) {
    users[id].getFilter("device").device = +deviceId;
    hash.set("device", deviceId);
    drawer.render();
}