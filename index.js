import express from 'express';
import axios from 'axios';
import qs from 'qs';
import HtmlTableToJson from 'html-table-to-json';


const app = express();

app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 4001;


async function obtenerCalculo(objCalcular) {
    const githubUrl = "https://www.ine.gob.ni/DGE/CalculoFactura/CalculoFactura.php";
    const url = `https://api.allorigins.win/get?url=${ encodeURIComponent( githubUrl) }`;

    const data = qs.stringify({
        'CboTarifa': '1',
        'CboDepartamento': '11',
        'CboMunicipio': '106',
        'TxtFechaFacturaAnterior': objCalcular.TxtFechaFacturaAnterior,
        'TxtFechaFactura': objCalcular.TxtFechaFactura,
        'TxtActiva': objCalcular.TxtActiva,
        'TxtActivaPunta': '',
        'TxtActivaFueraPunta': '',
        'TxtDemanda': '',
        'TxtDemandaPunta': '',
        'TxtDemandaFueraPunta': '',
        'TxtReactiva': '',
        'RdbCalcularAP': objCalcular.RdbCalcularAP,
        'TxtCaptcha': 'lento',
        'BtnCalcular': 'Calcular Factura',
        '__EVENTTARGET': 'BtnCalcular',
        '__EVENTARGUMENT': 'lento',
        'HfIsPostBack': '1',
        'HfConsumo': '30 días (4.50 kWh por día).',
        'HfDiasFacturados': '30',
        'HfPromedioConsumo': '4.50',
        'HfBaseCalculo': '1',
        'HfMensaje': ''
    });
    const config = {
        method: 'post',
        url: githubUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'PHPSESSID=9g8fq44mje3jr35sb250ee12m2'
        },
        data: data
    };

    try {
        const respuesta = await axios(config);
        let cadena = respuesta.data;
        let entrada = mejorarEntrada(cadena);

        return HtmlTableToJson.parse(entrada).results;
    } catch (error) {
        console.log(error);
    }

}

function mejorarEntrada(entrada) {
    let posicion = entrada.indexOf('<table border="0"');
    entrada = entrada.substring(posicion);

    let posicion3 = entrada.indexOf("</table>") + 8;

    entrada = entrada.substring(0, posicion3);

    return entrada.replace(" C$", "");
}

function mejorarSalida(resultado) {
    let respuesta = "{";
    let subsidio = 1;

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


    return JSON.parse(respuesta);
}

app.post('/calcular-recibo', async(req, res) => {
    const objCalcular = req.body;
    console.log(objCalcular);

    let resultado = await obtenerCalculo(objCalcular);
    resultado = mejorarSalida(resultado);

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.post('/obtener-departamento', async(req, res) => {
    const objCalcular = req.body;
    console.log(objCalcular);

    let resultado = await obtenerCalculo(objCalcular);
    resultado = mejorarSalida(resultado);

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.post('/obtener-municipios', async(req, res) => {
    const objCalcular = req.body;
    console.log(objCalcular);

    let resultado = await obtenerCalculo(objCalcular);
    resultado = mejorarSalida(resultado);

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})