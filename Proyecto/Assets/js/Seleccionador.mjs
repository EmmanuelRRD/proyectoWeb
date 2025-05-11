export class Selector {
    /**
     * @type {HTMLTableRowElement}
     */
    static row = null;
    static codigo = null;

    static cambiarSeleccion(codigo, row) {
        this.codigo = codigo;
        if (this.row != null) {
            //colorsito de seleccion quitado
            this.row.style.backgroundColor = "transparent"
            this.row.onclick = (ev) => {
                this.cambiarSeleccion(null, null);
            }

        }
        if (row != null) {
            //colorsito de seleccion ponido
            row.onclick = (ev) => {
                console.log(ev.target);
                if ([...row.children].indexOf(ev.target) == -1) {
                    return;
                }
                this.cambiarSeleccion(null, null);
            }
            row.style.backgroundColor = "rgb(100,200,255)"
        }
        this.row = row;
        //
    }
}