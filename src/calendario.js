#!/usr/bin/env node

'use strict';

const TOKEN         = 'Z3VpbGhlcm1lLmxjZEBnbWFpbC5jb20maGFzaD00MjAzOTE4OA==';
const URL           = 'http://www.calendario.com.br/api/api_feriados.php';
const HOLIDAY_TYPES = ['Facultativo', 'Feriado Nacional', 'Feriado Estadual', 'Feriado Municipal'];
const request       = require('request');
const xml2json      = require('xml2json');

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
                console.log('Deu ruim: ' + error);
                return;
            }

            let holidays    = JSON.parse(xml2json.toJson(body)),
                nextHoliday = this.searchNextHoliday(holidays);

            console.log(this.jsonToHumans(nextHoliday));
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

    /**
     * Retorna o próximo feriado
     * @param holidays
     * @returns {*}
     */
    searchNextHoliday(holidays) {

        let today = new Date();

        // Filtra os feriados com data maior que hoje e somente nacionais/municipais/estadual/facultativo
        let nextHolidays = holidays.events.event.filter(h => {

            let validType = HOLIDAY_TYPES.indexOf(h.type) !== -1;

            return validType && today < this.toDateUS(h.date);
        });

        // Encontra o com a menor data
        return nextHolidays.reduce((a, b) => {

            let dateA = this.toDateUS(a.date);
            let dateB = this.toDateUS(b.date);
            
            return dateA < dateB ? a : b;
        });
    }

    /**
     * Converte uma data para o formato YYYY/MM/DD
     * @param date
     * @returns {Date}
     */
    toDateUS(date) {

        let arrDate = date.split('/');

        return new Date(`${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`);
    }

    /**
     * Formata o json para texto
     * @param holiday
     * @returns {string}
     */
    jsonToHumans(holiday) {
        return `O próximo feriado é ${holiday.name} em ${holiday.date}`;
    }

}

module.exports = new Calendario();