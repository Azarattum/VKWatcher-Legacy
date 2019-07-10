class Drawer {
    constructor(canvas, sessions) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.sessions = sessions;
        this.viewport = {
            width: canvas.clientWidth * window.devicePixelRatio,
            height: canvas.clientHeight * window.devicePixelRatio
        };
        this.date = this._initDate();
        this.time = this._initTime();
        this.column = this._initColumn();

        this.canvas.width = this.viewport.width;
        this.canvas.height = this.viewport.height;
        this.select = document.getElementsByClassName("select")[0];
        this.selectTime = document.getElementsByClassName("time")[0];

        this.canvas.onmousemove = (e) => {this._updateSelection(e, this)};
        this.canvas.onmouseleave = (e) => {this._updateSelection(e, this)};
        this.canvas.ontouchmove = (e) => {this._updateSelection(e, this)};
    }

    update() {
        this.viewport = {
            width: this.canvas.clientWidth * window.devicePixelRatio,
            height: this.canvas.clientHeight * window.devicePixelRatio
        };
        this.canvas.width = this.viewport.width;
        this.canvas.height = this.viewport.height;
        this.date = this._initDate();
        this.time = this._initTime();
        this.column = this._initColumn();
    }

    render() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
        this._drawTimes(ctx);
        if (this.sessions.length > 0) {
            this._drawDates(ctx);
            this._drawColumns(ctx);
        }
    }

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

    _initDate() {
        return {
            height: 48,
            margin: 8,
            font: window.getComputedStyle(this.canvas).fontFamily,
            color: window.getComputedStyle(this.canvas).color
        };
    }

    _drawDates(ctx) {
        const left = this.time.fontSize * 3;
        const margin = this.date.margin;
        const color = this.date.color;
        const font = this.date.font;
        const height = this.date.height;

        const count = this._getDaysBetween(this.sessions.last.to, this.sessions.first.from) + 1;
        const space = (this.viewport.width - left) / count;
        const size = Math.min(height / 2, (this.viewport.width - left) / count);
        let day = new Date(this.sessions.first.from);

        ctx.font = (size - margin) + "px " + font;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        for (let i = 0; i < count; i++) {
            let date = day.toString().split(" ");
            let weekDay = date[0];
            date = date[1] + " " + date[2];

            ctx.fillText(weekDay, left + space * i + space / 2, this.viewport.height - size - margin / 2);
            ctx.fillText(date, left + space * i + space / 2, this.viewport.height - margin / 2);
            //Increament the day
            day.setDate(day.getDate() + 1)
        }
    }

    _initTime() {
        const styles = window.getComputedStyle(
            document.getElementsByClassName("page")[0]
        );
        return {
            margin: this.viewport.height / styles.getPropertyValue("--vertical-zoom") / 96,
            left: 8,
            fontSize: (this.viewport.height / styles.getPropertyValue("--vertical-zoom") - this.date.height) / 24,
            size: (this.viewport.height - this.date.height) / 24,
            font: window.getComputedStyle(this.canvas).fontFamily,
            color: window.getComputedStyle(this.canvas).color
        };
    }

    _drawTimes(ctx) {
        const margin = this.time.margin;
        const left = this.time.margin;
        const fontSize = this.time.fontSize;
        const size = this.time.size;
        const color = this.time.color;
        const font = this.time.font;

        ctx.font = (fontSize - margin) + "px " + font;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        for (let i = 0; i < 24; i++) {
            const time = (i.toString().length == 1 ? "0" : "") + i + ":00";
            ctx.fillText(time, left, size + size * i - 5 - margin / 6);
        }
    }

    _initColumn() {
        return {
            margin: 4
        };
    }

    _drawColumns(ctx) {
        const left = this.time.fontSize * 3;
        const color = this.column.color;
        const margin = this.column.margin;
        const firstDay = this.sessions.first.from;
        const count = this._getDaysBetween(this.sessions.last.to, this.sessions.first.from) + 1;
        const width = (this.viewport.width - left) / count;
        const height = this.date.height;
        const space = ((this.viewport.height - height) / 24);
        const styles = window.getComputedStyle(
            document.getElementsByClassName("page")[0]
        );

        for (const session of this.sessions) {
            ctx.fillStyle = styles.getPropertyValue("--color-" + session.device);

            const daysFrom = this._getDaysBetween(firstDay, session.from);
            const daysTo = this._getDaysBetween(firstDay, session.to);

            const topX = width * daysFrom + left + margin;
            let topY = space * session.from.getHours();
            topY += space / 60 * session.from.getMinutes();
            topY += (space / 60 / 60) * session.from.getSeconds();

            const bottomX = width * daysTo + left + margin;
            let bottomY = space * session.to.getHours();
            bottomY += space / 60 * session.to.getMinutes();
            bottomY += (space / 60 / 60) * session.to.getSeconds();

            if (daysFrom == daysTo) {
                ctx.fillRect(topX, topY, width - margin * 2, bottomY - topY); 
            } else {      
                ctx.fillRect(topX, topY, width - margin * 2, space * 23 - topY);
                ctx.fillRect(bottomX, 0, width - margin * 2, bottomY);
            }
        }
    }

    _getDaysBetween(date1, date2) {
        date1 = new Date(date1);
        date2 = new Date(date2);
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date2.setHours(0);
        date2.setMinutes(0);
        date2.setSeconds(0);
        const dateDifference = Math.abs(date1 - date2);
        const oneDay = 24*60*60*1000;
        return Math.round(dateDifference/oneDay);
    }
}