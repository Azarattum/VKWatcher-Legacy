/**
 * Responsible for handling all user controlls
 */
class Controller {
    constructor(drawer) {
        //#region Fields
        this.drawer = drawer;
        this.canvas = drawer.canvas;
        this.user = drawer.user;
        //#endregion

        //Intialize the controller
        this._initLineSelection();
        this._initSessionSelection();
    }

    //#region Private methods
    //Initialization
    _initLineSelection() {
        //Setup canvas events
        this.canvas.onmousemove = (e) => {update(e, this.drawer.viewport)};
        this.canvas.onmouseleave = (e) => {update(e, this.drawer.viewport)};
        this.canvas.ontouchmove = (e) => {update(e, this.drawer.viewport)};

        const selectionBlock = document.getElementsByClassName("select")[0];
        const selectionTime = document.getElementsByClassName("time")[0];
        const height = this.drawer.date.height;
        const oneDay = 24*60*60;

        function update(eventArgs, viewport) {
            const y = eventArgs.offsetY;
            let time = Math.round(y / ((viewport.height - height) / oneDay) * 1000);

            if (time > (oneDay * 1000) || time < 0 || eventArgs.type == "mouseleave") {
                selectionBlock.style.top = "-100px";
            }
            else {
                let date = new Date(-25200000);
                date.setMilliseconds(time);

                selectionTime.innerHTML = date.toTimeString().split(' ')[0];
                selectionBlock.style.top = y + "px";
            }
        }
    }

    _initSessionSelection() {
        
    }
    //#endregion
}