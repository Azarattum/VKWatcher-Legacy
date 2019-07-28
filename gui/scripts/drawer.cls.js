/**
 * Responsible for drawing the date
 */
class Drawer {
    /**
     * Creates a new drawer object
     * @param {Element} canvas HTML Canvas element
     * @param {User} user User object
     */
    constructor(canvas, user) {
        //#region Fields
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.user = user;
        this.select = document.getElementsByClassName("select")[0];
        this.selectTime = document.getElementsByClassName("time")[0];
        //#endregion

        this.update();
        //Setup canvas events
        this.canvas.onmousemove = (e) => {this._updateSelection(e, this)};
        this.canvas.onmouseleave = (e) => {this._updateSelection(e, this)};
        this.canvas.ontouchmove = (e) => {this._updateSelection(e, this)};
    }

    //#region Public methods
    /**
     * Updates viewing params, such as viewport size
     */
    update() {
        this.viewport = {
            width: this.canvas.clientWidth * window.devicePixelRatio,
            height: this.canvas.clientHeight * window.devicePixelRatio
        };
        this.date = this._initDate();
        this.time = this._initTime();
        this.column = this._initColumn();
        this.canvas.width = this.viewport.width;
        this.canvas.height = this.viewport.height;
    }

    /**
     * Renders everything
     */
    render() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
        this._drawTimes(ctx);
        if (Object.keys(this.user.days).length > 0) {
            this._drawData(ctx);
        }
    }
    //#endregion

    //#region Private methods
    //Initializaion
    _initColumn() {
        return {
            margin: 4
        };
    }

    _initDate() {
        const canvasStyle = window.getComputedStyle(this.canvas);
        return {
            height: 48,
            font: canvasStyle.fontFamily,
            color: canvasStyle.color
        };
    }

    _initTime() {
        const pageStyle = window.getComputedStyle(
            document.getElementsByClassName("page")[0]
        );
        const canvasStyle = window.getComputedStyle(this.canvas);
        return {
            margin: this.viewport.height / pageStyle.getPropertyValue("--vertical-zoom") / 96,
            left: 8,
            fontSize: (this.viewport.height / pageStyle.getPropertyValue("--vertical-zoom") - this.date.height) / 24,
            size: (this.viewport.height - this.date.height) / 24,
            font: canvasStyle.fontFamily,
            color: canvasStyle.color
        };
    }

    //Drawing
    _drawData(ctx) {
        //Define constants
        const days = this.user.getDays();
        const left = this.time.fontSize * 3;
        const margin = this.column.margin;
        const width = (this.viewport.width - left) / days.length;
        const height = this.date.height;
        const color = this.date.color;
        const font = this.date.font;
        const size = Math.min(height / 2.3, (this.viewport.width - left) / (days.length * 3));
        const hour = ((this.viewport.height - height) / 24);
        const styles = window.getComputedStyle(
            document.getElementsByClassName("page")[0]
        );

        //Presetup canvas
        ctx.font = size + "px " + font;
        ctx.textAlign = "center";

        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            //#region Date drawing
            //Format text
            let date = day.date.toString().split(" ");
            let weekDay = date[0];
            date = date[1] + " " + date[2];

            //Render date
            ctx.fillStyle = color;
            ctx.fillText(weekDay, left + width * i + width / 2, this.viewport.height - size);
            ctx.fillText(date, left + width * i + width / 2, this.viewport.height);
            //#endregion
            
            //#region Columns drawing
            for (const session of day.sessions) {
                //Caculate coordinates
                const x = (width * i) + left;
                const y = hour * session.from.getHours()
                    + hour / 60 * session.from.getMinutes()
                    + (hour / 60 / 60) * session.from.getSeconds();

                let length = hour * 
                    ((session.to - session.from) / 1000 / 60 / 60);
                
                if (length < 1) length = 1;

                ctx.fillStyle = styles.getPropertyValue("--color-" + session.device);
                ctx.fillRect(x + (margin / 2), y, width - margin, length);
            }
            //#endregion
        }
    }

    _drawTimes(ctx) {
        const margin = this.time.margin;
        const fontSize = this.time.fontSize;
        const size = this.time.size;
        const color = this.time.color;
        const font = this.time.font;

        ctx.font = fontSize + "px " + font;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        for (let i = 0; i < 24; i++) {
            const time = (i.toString().length == 1 ? "0" : "") + i + ":00";
            ctx.fillText(time, margin, size * i + fontSize / 2.5 + size / 2);
            ctx.globalAlpha = 0.15;
            ctx.fillRect(0, size * i + size, this.viewport.width, 1);
            ctx.globalAlpha = 1.0;
        }
    }

    //Controls
    _updateSelection(eventArgs, drawer) {
        const height = drawer.date.height;
        const oneDay = 24*60*60;
        const select = drawer.select;
        const selectTime = drawer.selectTime;
        const y = eventArgs.offsetY;

        let time = Math.round(y / ((drawer.viewport.height - height) / oneDay) * 1000);
        if (time > (oneDay * 1000) || time < 0 || eventArgs.type == "mouseleave") {
            select.style.top = "-100px";
        }
        else {
            let date = new Date(-25200000);
            date.setMilliseconds(time);

            selectTime.innerHTML = date.toTimeString().split(' ')[0];
            select.style.top = y + "px";
        }
    }
    //#endregion
}