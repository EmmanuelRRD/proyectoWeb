class Conectadas {
    constructor(){

    }

    /**
     * 
     * @param {import("mysql").Connection} con 
     */
    static init(con){
        con.query("USE miscle;", (err, result)=>{
            if(err) throw err;
            console.log(result);
        })
    }
}

module.exports.getClase = function(){return Conectadas};