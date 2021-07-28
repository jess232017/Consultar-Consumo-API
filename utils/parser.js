import HtmlTableToJson from 'html-table-to-json';
import HTML from 'html-parse-stringify';


export function reciboToJson(entrada) {

    //Eliminar elementos que no son del recibo
    let posicion = entrada.indexOf('<table border="0"');
    entrada = entrada.substring(posicion);

    let posicion3 = entrada.indexOf("</table>") + 8;
    entrada = entrada.substring(0, posicion3);

    //Eliminar el signo de cordoba
    entrada = entrada.replace(" C$", "");

    //Obtener un Json a partir del Table HTML
    let resultado = HtmlTableToJson.parse(entrada).results;

    //Variables para mejorar el JSON
    let respuesta = "{";
    let subsidio = 1;

    //Mejorar el formato del JSON
    resultado[0].forEach(element => {
        const { Concepto, Importe } = element;

        let indice = Concepto.indexOf(" ");
        let clave = (indice === -1) ? Concepto : Concepto.substring(0, indice);

        if (clave === "Subsidio") {
            clave = (subsidio === 1) ? "Subsidio_Consumo" : "Subsidio_Comercia";
            subsidio++;
        }

        respuesta += `"${clave}" : "${Importe}"`;
        respuesta += (clave !== "Total") ? ",\n" : "\n}"
    });

    //Retornar JSON
    return JSON.parse(respuesta);
}

export function selectToJson(entrada, name) {
    //Eliminar elementos que no son del recibo
    let expresion = `<select name="${name}"`;
    let posicion = entrada.indexOf(expresion);
    entrada = entrada.substring(posicion);

    posicion = entrada.indexOf("<option");
    entrada = entrada.substring(posicion);

    posicion = entrada.indexOf("</select>");
    entrada = entrada.substring(0, posicion);

    //Eliminar el signo de cordoba
    entrada = entrada.replace(" ", "");

    //Obtener un Json a partir del Table HTML
    let resultado = HTML.parse(entrada)[0].children;

    //Variables para mejorar el JSON
    let respuesta = [];

    //Mejorar el formato del JSON
    let index = 1;

    resultado.forEach(element => {
        if ((index++ % 2) !== 0) {
            if (element.type === 'tag') {
                const { attrs: { value }, children: [{ content }] } = element;
                respuesta.push({ valor: value, nombre: content })
            }
        }
    });

    //Retornar JSON
    return respuesta;
}