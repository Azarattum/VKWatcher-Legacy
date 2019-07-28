/**
 * Page designer class
 */
class Designer {
    static initialize() {
        this.initializeElements();
        this.initializeEvents();
        this.initializeURL();
    }

    static initializeElements() {
        //Period selector
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
    
        //Zoom selector
        $(".zoom-slider").ionRangeSlider({
            min: 0.75,
            max: 16,
            step: 0.25,
            from: 1,
            onFinish: function (data) {
                hash.set("zoom", data.from);
                document.getElementsByClassName("page")[0].
                style.setProperty("--vertical-zoom", data.from);
                drawer.update();
                drawer.render();
            }
        });
    }
    
    static initializeEvents() {
        //Window
        window.onresize = () => {
            drawer.update();
            drawer.render();
        };
    }
    
    static initializeURL() {
        const days = Object.keys(users[id].days);
        window.hash = new Hash({
            user: 0,
            zoom: 1,
            period: "1-" + days.length,
            device: -1,
            empty: true
        });
    
        if (Number.isInteger(+hash.get("user"))) {
            id = +hash.get("user");
        }
    
        if (Number.isFinite(+hash.get("zoom"))) {
            $(".zoom-slider").data("ionRangeSlider").update({
                from: +hash.get("zoom")
            });
            document.getElementsByClassName("page")[0].
            style.setProperty("--vertical-zoom", +hash.get("zoom"));
        }
    
        if (hash.get("empty") === "false") {
            users[id].getFilter("empty").toggle(true);
            document.getElementById("empty-filter").checked = false;
        }
    
        if (Number.isInteger(+hash.get("device"))) {
            users[id].getFilter("device").device = +hash.get("device");
        }
    
        if (hash.exists("period") && hash.get("period").split('-').length == 2) {
            const days = Object.keys(users[id].days);
            users[id].getFilter("period").from = +days[0] + (+hash.get("period").split('-')[0]) - 1;
            users[id].getFilter("period").to = +days[0] + (+hash.get("period").split('-')[1]) - 1;
        }
    }
}