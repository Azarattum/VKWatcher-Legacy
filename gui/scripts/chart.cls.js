import ChartElement from "../libs/charts/scripts/element/element.js";
import DateUtils from "./data/utils.cls.js";

export default class Chart {
    constructor(containerId, {
        vshaderBar,
        fshaderBar,
        vshaderLayout,
        fshaderLayout
    }) {
        const container = document.getElementById(containerId);
        const pageStyle = getComputedStyle(document.body);
        const shaders = {
            bar: [vshaderBar, fshaderBar],
            layout: [vshaderLayout, fshaderLayout]
        };

        this.user = null;
        this.data = {};
        this.element = new ChartElement(container, shaders);
        this.element.style = {
            background: "255, 255, 255",
            text: pageStyle.getPropertyValue("--color-text"),
            font: pageStyle["font-family"],
            lowlight: 0.05
        };

        this._register_events();
    }

    //#region Public methods
    /**
     * Changes user whose chart is drawing
     * @param {User} user New user changes user whose chart is drawing
     */
    switch (user) {
        if (Object.keys(user.days).length == 0) {
            this.element.elements.container.innerHTML = "";
            return;
        }
        this.user = user;
        this.data = this._convertData(user);

        this.refresh();
    }

    /**
     * Refreshes chart data using current user data
     */
    refresh() {
        this.element.elements.container.innerHTML = "";
        this.element._initializeComponent();
        this.element._initializeStyle();
        this.element.chart = this.data;

        //Custom format style
        let func = this.element.drawer.onrecalculated;
        this.element.drawer.onrecalculated = () => {
            func();
            let values = this.element.elements.values.children;
            for (const valueElement of values) {
                let lastChild = valueElement.children[valueElement.children.length - 1];
                lastChild.innerHTML = DateUtils.getReadableDuration(+(lastChild.innerHTML.replace(/\s*/g, "")));
            }
        }
        this.element.drawer.layoutDrawer._formatValue = (number) => {
            const hours = Math.floor(number / 60 / 60);
            return hours + "h " + Math.round((number - (hours * 60 * 60)) / 60) + "m";
        };

        this.update();
    }

    /**
     * Updates element (for example on resize)
     */
    update() {
        this.element.style = {};
        this.element.update();
        this.element.controller.onupdate(0, 0.999999);
        this.element.controller.selector.style.width = "calc(100% - 8px)";
    }

    //#endregion

    //#region Private methods
    /**
     * Converts user object to chart-library-compatable input object
     * @param {User} user User object to extract data from
     */
    _convertData(user) {
        //Device colors
        const colors = getComputedStyle(document.getElementsByClassName("page")[0]);
        //Template object
        let data = {
            columns: [
                ["x"],
                ["y0"],
                ["y1"],
                ["y2"],
                ["y3"],
                ["y4"],
                ["y5"],
                ["y6"],
                ["y7"]
            ],
            types: {
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
            names: {
                "y0": "Unknown",
                "y1": "Mobile",
                "y2": "iPhone",
                "y3": "iPad",
                "y4": "Android",
                "y5": "WPhone",
                "y6": "Windows",
                "y7": "Web"
            },
            colors: {
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

        //Scan days
        let total = [0, 0, 0, 0, 0, 0, 0, 0];
        const days = Object.values(this.user.days);
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            data.columns[0][i + 1] = +day.date;
            for (let j = 1; j < 9; j++) {
                const sum = day.sessions.reduce((a, b) => {
                    return a + ((b.platformId == (j - 1)) ? b.length : 0);
                }, 0);

                data.columns[j][i + 1] = sum;
                total[j - 1] += sum;
            }
        }

        //Clear empty devices
        let offset = 0;
        for (let i = 0; i < total.length; i++) {
            if (total[i] == 0) {
                data.columns.splice(i + 1 - offset, 1);
                delete data.types["y" + i];
                delete data.names["y" + i];
                delete data.colors["y" + i];
                offset++;
            }
        }

        return data;
    }

    /**
     * Renders the chart
     */
    _render() {
        if (hash.get("tab") != "chart" || !this.element || !this.element.chartData) {
            requestAnimationFrame(() => {
                this._render();
            });
            return;
        }

        this.element.render();
        requestAnimationFrame(() => {
            this._render();
        });
    }

    /**
     * Registers all elements events
     */
    _register_events() {
        //Save old sizes
        let {width = null, height = null} = {};

        window.addEventListener("resize", () => {
            //Check if size has changed
            const newSize = this.element.elements.container.getClientRects()[0];

            if (!this.element || !this.element.chartData || newSize == undefined ||
                (newSize.width == width && newSize.height == height)) {
                width = newSize ? newSize.width : null;
                height = newSize ? newSize.height : null;
                return;
            }

            width = newSize.width;
            height = newSize.height;
            this.update();
        });
        requestAnimationFrame(() => {
            this._render();
        });
    }
    //#endregion
}