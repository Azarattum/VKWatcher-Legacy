import Hash from "./hash.cls.js";
import DateUtils from "./data/utils.cls.js";

/**
 * Page designer class
 */
export default class Designer {
    static initialize(data, user) {
        this.data = data;
        this.user = user;
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
                dataDrawer.update();
                dataDrawer.render();
            }
        });

        ///Bar chart
        /*const container = document.getElementById("chart-container");
        const pageStyle = getComputedStyle(document.body);
        const shaders = {
            bar: [this.data["vshaderBar"], this.data["fshaderBar"]],
            layout: [this.data["vshaderLayout"], this.data["fshaderLayout"]]
        };*/
        
        /*this.chartElement = new ChartElement(container, shaders);
        this.chartElement.chart = this.initializeData();
        this.chartElement.style = {
            background: "255, 255, 255",
            text: pageStyle.getPropertyValue("--color-text"),
            font: pageStyle["font-family"],
            lowlight: 0.05
        };*/
    }

    /*static initializeData() {
        const colors = getComputedStyle(document.getElementsByClassName("page")[0]);
        let data = {
            columns: [
                ["x"], ["y0"], ["y1"], ["y2"], ["y3"], ["y4"], ["y5"], ["y6"], ["y7"]
            ],
            types:
            {
                "y0": "bar",
                "y1": "bar",
                "y2": "bar",
                "y3": "bar",
                "y4": "bar",
                "y5": "bar",
                "y6": "bar",
                "y7": "bar",
                "x": "x"
            },
            names:
            {
                "y0": "Unknown",
                "y1": "Mobile",
                "y2": "iPhone",
                "y3": "iPad",
                "y4": "Android",
                "y5": "WPhone",
                "y6": "Windows",
                "y7": "Web"
            },
            colors:
            {
                "y0": colors.getPropertyValue("--color-unknown"),
                "y1": colors.getPropertyValue("--color-mobile"),
                "y2": colors.getPropertyValue("--color-iphone"),
                "y3": colors.getPropertyValue("--color-ipad"),
                "y4": colors.getPropertyValue("--color-android"),
                "y5": colors.getPropertyValue("--color-wphone"),
                "y6": colors.getPropertyValue("--color-windows"),
                "y7": colors.getPropertyValue("--color-web")
            },
            stacked: true
        }
        const days = Object.values(this.user.days);
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            data.columns[0][i + 1] = +day.date;
            for (let j = 1; j < 9; j++) {
                data.columns[j][i + 1] = day.sessions.reduce((a, b) => {
                    return a + ((b.platformId == (j - 1)) ? b.length : 0);
                }, 0);
            }
        }

        this.chartElement.chartData = new Chart(data);
        return data;
    }*/
    
    static initializeEvents() {
        //Window
        window.addEventListener("resize", () => {
            dataDrawer.update();
            dataDrawer.render();
        });
    }
    
    static initializeURL() {
        const days = Object.keys(window.users[window.id].days);
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