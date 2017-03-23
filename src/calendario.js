'use strict';

const TOKEN    = 'Z3VpbGhlcm1lLmxjZEBnbWFpbC5jb20maGFzaD00MjAzOTE4OA==';
const URL      = 'http://www.calendario.com.br/api/api_feriados.php';
const request  = require('request');
const xml2json = require('xml2json');

class Calendario {

    /**
     * Retorna o ano atual
     * @returns {number}
     */
    get currentYear() {
        return new Date().getFullYear();
    }

    /**
     * Busca os feriados
     * @param additionalParams
     */
    get(additionalParams) {

        let params = {
            token: TOKEN,
            estado: 'SP',
            cidade: 'SAO_PAULO',
            ano: this.currentYear
        };

        Object.assign(params, additionalParams);

        request(this.mountUrl(params), (error, response, body) => {

            if (error) {
                console.log('Deu ruim');
                return;
            }

            let holidays = xml2json.toJson(body);

            console.log(holidays);
        });
    }

    /**
     * Monta a url com os parâmetros passados
     * @param params
     * @returns {string}
     */
    mountUrl(params) {

        let paramKeys = Object.keys(params);

        let arrKeys = paramKeys.map(key => {
            let value = params[key];
            return `${key}=${value}`;
        });

        let stringKeys = arrKeys.join('&');

        return `${URL}?${stringKeys}`;
    }


}

module.exports = new Calendario();