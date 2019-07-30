import ChartElement from "/libs/charts/scripts/element/element.js";

export default class Chart {
    constructor(containerId, {vshaderBar, fshaderBar, vshaderLayout, fshaderLayout}) {
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
    switch(user) {
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

        //Scan days
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

        return data;
    }

    /**
     * Renders the chart
     */
    _render() {
        if (!this.element || !this.element.chartData) {
            requestAnimationFrame(() => {this._render();});
            return;
        }

        this.element.render();
        requestAnimationFrame(() => {this._render();});
    }

    /**
     * Registers all elements events
     */
    _register_events() {
        window.addEventListener("resize", () => {this.update();});
        requestAnimationFrame(() => {this._render();});
    }
    //#region 
}