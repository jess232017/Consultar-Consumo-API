import express from 'express';
import axios from 'axios';
import qs from 'qs';
import { reciboToJson, selectToJson } from './utils/parser.js'


const app = express();

app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 4001;


async function getFactura(objCalcular) {
    const url = "https://www.ine.gob.ni/DGE/CalculoFactura/CalculoFactura.php";

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
        url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'PHPSESSID=9g8fq44mje3jr35sb250ee12m2'
        },
        data: data
    };

    try {
        const respuesta = await axios(config);
        return await reciboToJson(respuesta.data);
    } catch (error) {
        console.log(error);
    }

}

async function getTarifas() {
    try {
        var config = {
            method: 'get',
            url: 'https://www.ine.gob.ni/DGE/CalculoFactura/CalculoFactura.php',
            headers: {
                'Cookie': 'PHPSESSID=usdfk99n5pkehohbtp0f35t190'
            }
        };

        const respuesta = await axios(config);
        return selectToJson(respuesta.data, "CboTarifa");
    } catch (error) {
        console.log(error);
    }
}

async function getDepartamentos() {
    try {
        var config = {
            method: 'get',
            url: 'https://www.ine.gob.ni/DGE/CalculoFactura/CalculoFactura.php',
            headers: {
                'Cookie': 'PHPSESSID=usdfk99n5pkehohbtp0f35t190'
            }
        };

        const respuesta = await axios(config);
        return selectToJson(respuesta.data, "CboDepartamento");
    } catch (error) {
        console.log(error);
    }
}

async function getMunicipios(department) {
    try {
        var config = {
            method: 'get',
            url: `https://wrapapi.com/use/jess232021/calcularfactura/municipios/0.0.2?__EVENTARGUMENT=${department}&wrapAPIKey=PozLmiwejcbNcH93pjNmlrYhIyPBJ3VO`,
        };

        let respuesta = await axios(config);
        respuesta = respuesta.data.rawData.responses[0].body;
        respuesta = respuesta.replace("﻿\r\n", "");
        respuesta = respuesta.replace("\\", "")
        respuesta = JSON.parse(respuesta);

        let resultado = []

        respuesta.forEach(element => {
            const { IdUbicacionGeografica, Nombre } = element;
            resultado.push({ valor: IdUbicacionGeografica, nombre: Nombre });
        });

        return resultado;
    } catch (error) {
        console.log(error);
    }
}


app.post('/calcular-recibo', async(req, res) => {
    const objCalcular = req.body;
    let resultado = await getFactura(objCalcular);

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.get('/obtener-tarifas', async(req, res) => {
    let resultado = await getTarifas();

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.get('/obtener-departamentos', async(req, res) => {
    let resultado = await getDepartamentos();

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.post('/obtener-municipios', async(req, res) => {
    const department = req.body.department;

    let resultado = await getMunicipios(department);

    res.json({
        resultado,
        mensaje: "operacion exitosa"
    });
});

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})