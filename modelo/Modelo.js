class Modelo {
    static tiposSQL(){};
    static tipos(){};
    static longitudes(){};
    static noNulos(){};
    static primarias(){};
    static foraneas(){};
    getDatos(){
        let o = [];
        for(const fld in this){
            o.push(this[fld]);
        }
        return o;
    };
    getDatosSQL(){
        let o = [];
        for(const fld in this){
            let p = this[fld];
            if(p == null) o.push("NULL");
            else if(typeof p == "string") o.push("'"+p+"'");
            else o.push(p);
        }
        return o;
    };
}
module.exports = Modelo;