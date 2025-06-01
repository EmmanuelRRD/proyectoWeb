import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Selenium = require('selenium-webdriver')
//import { Select } from "selenium-webdriver/lib/select";
const { Builder, Browser, By, Key, until, Select } = require('selenium-webdriver')

class Pruebas {
    resultado = null;

    /**
     * @type {Selenium.ThenableWebDriver}
     */
    driver = null;
    url = "http://localhost:5500";

    async crearDriver(){
        this.driver = await new Builder().forBrowser(Browser.CHROME).build();
    }
    async ejecutar(prueba=async()=>{}){
        
        await (async()=>{

            try{
                await this.driver.get(this.url);
                
                await prueba();
            }catch(e){
                this.resultado = "Error en la prueba: " + e;
            }
                
        })();
    }
    async escribirEnCampo(NombreIdentificador, identificador, dato){
        await this.driver.findElement(By[NombreIdentificador](identificador)).sendKeys(dato);
    }
    async clicar(idElemento){
        await this.driver.findElement(By.id(idElemento)).click();
    }
    /**
     * CP_RNF1 
     * CP_RNF7
     * @param {*} user 
     * @param {*} pass 
     */
    async login(user="admin", pass="admin"){
        await this.ejecutar(async()=>{
            await this.escribirEnCampo("name", "user", user);
            await this.escribirEnCampo("name", "password", pass);
            await this.clicar("btnLogin");
            this.resultado = "Logeo exitoso";
        })
        
    }
    /**
     * CP_RF2 
     * CP_RNF4 
     * CP_RNF9 
     * CP_RNF10 
     * @param {*} user 
     * @param {*} pass 
     */
    async calendario(user, pass){
        await this.ejecutar(async()=>{
            await this.login(user, pass);
            await this.clicar("calendario")
            this.resultado = "Calendario mostrado";
        })
    }
    /**
     * CP_RNF3
     * CP_RNF10 
     * @param {*} user 
     * @param {*} pass 
     */
    async calendarioClic(user, pass, dia){
        await this.ejecutar(async()=>{
            await this.calendario(user, pass);
            await this.clicar("data-day-"+dia);
            this.resultado = "Formulario mostrado";
        })
    }
    /**
     * CP_RNF5
     * CP_RNF10 
     */
    async inventario(user, pass){
        await this.ejecutar(async()=>{
            await this.login(user, pass);
            await this.clicar("inventario")
            this.resultado = "inventario mostrado";
        })
    }
    async getAlert(){
        let alerta = await this.driver.switchTo().alert();
    
        return alerta;
    }
    async borrarInventario(user, pass, id){
        await this.inventario(user, pass);
        await this.clicar(id+"_eliminar");
        let alerta = await this.getAlert();
        this.resultado = await alerta.getText();
        await alerta.accept();
        await this.driver.switchTo().defaultContent();
    }
    /**
     * CP_RNF5 
     * CP_RNF6 
     * CP_RNF8
     */
    async usuarios(user, pass){
        await this.ejecutar(async()=>{
            await this.login(user, pass);
            await this.clicar("btnAdminUsers");
            this.resultado = "Admin Users clicado"
        })
    }
    async focusFormulario(user, pass, dia){
        await this.ejecutar(async()=>{
            await this.calendarioClic(user, pass, dia);
            const frame = await this.driver.findElement(By.id("frameform"))
            console.log("cambiao")
            return await this.driver.switchTo().frame(frame);
            
        })
    }
    async seleccionarOpcion(id, texto){
        this.ejecutar(async()=>{
            let selectElem = await this.driver.findElement(By.id(id));
            const select = new Select(selectElem);
            select.selectByValue(texto);
        })
    }
    /**
     * CP_RF15
     * @param {*} user 
     * @param {*} pass 
     * @param {*} dia 
     * @param {*} id 
     */
    async calendarioAgregar(user, pass, dia, id, encargado){
        
        await this.ejecutar(async()=>{
            
            await this.focusFormulario(user, pass, dia);
            await this.escribirEnCampo("id", "input_Id", id);
        
            let selectElem = await this.driver.findElement(By.id("input_Nombre_Empleado"));
            let select = new Select(selectElem);
            await select.selectByValue(encargado);
            
            await this.escribirEnCampo("id", "input_Nombre_Cliente", "prueb");
            await this.escribirEnCampo("id", "input_Apellido_Cliente", "prueb");

            selectElem = await this.driver.findElement(By.id("input_Nombre_Modelo"));
            select = new Select(selectElem);
            await select.selectByValue("1");

            selectElem = await this.driver.findElement(By.id("input_Paquete_Fotografico"));
            select = new Select(selectElem);
            await select.selectByValue("1");

            selectElem = await this.driver.findElement(By.id("input_Tipo_Evento"));
            select = new Select(selectElem);
            await select.selectByValue("1");
        
            await this.clicar("btnEnviar");
            this.resultado = "agregado";
            
        })
    }
    async quit(){
        await this.driver.quit();
    }
    async pausa(ms){
        return new Promise((res)=> setTimeout(res, ms))
    }
    async ejecutarPrueba(nombre, pausa, ...args){
        
        if(!(nombre in this)){
            console.log("ERROR: La prueba '"+nombre+"' no existe");
            return;
        }
        await pruebas[nombre](...args);
        console.log("res "+this.resultado);
        await pruebas.pausa(pausa);
    }
}
const pruebas = new Pruebas();
let userpass;
let adminpass;
let user = userpass = "userio";
let admin = adminpass = "admin";
pruebas.crearDriver()
.then(async(val)=>{
    //* CP_RNF1, * CP_RNF7
    await pruebas.ejecutarPrueba("login", 1000, admin, adminpass);
    //* CP_RF2, * CP_RNF4, *CP_RNF9, *CP_RF18
    await pruebas.ejecutarPrueba("calendario", 1000, admin, adminpass);
    //* CP_RNF3, CP_RF23
    await pruebas.ejecutarPrueba("calendarioClic", 1000, admin, adminpass, 31);
    //* CP_RNF5
    await pruebas.ejecutarPrueba("inventario", 1000, user, userpass);
    await pruebas.ejecutarPrueba("usuarios", 1000, user, userpass);
    await pruebas.ejecutarPrueba("borrarInventario", 1000, user, userpass, 2);
    //* CP_RF6, * CP_RNF8 eh
    await pruebas.ejecutarPrueba("usuarios", 1000, admin, adminpass);
    //* CP_RNF14 nel
    //* CP_RNF15, *CP_RF19
    await pruebas.ejecutarPrueba("calendarioAgregar", 1000, admin, adminpass, 26, 901, "Dios");
    //*CP_RNF20
    //CP_RF21

    
    //await pruebas.quit();

});

