'use strict';

const token        = 'Z3VpbGhlcm1lLmxjZEBnbWFpbC5jb20maGFzaD00MjAzOTE4OA==';
const url          = 'http://www.calendario.com.br/api/api_feriados.php';
const holydayTypes = ['Facultativo', 'Feriado Nacional', 'Feriado Estadual', 'Feriado Municipal'];
const request      = require('request');
const xml2json     = require('xml2json');
const moment       = require('moment-timezone');
const longDays     = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

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
            token: token,
            estado: 'SP',
            cidade: 'SAO_PAULO',
            ano: this.currentYear
        };

        Object.assign(params, additionalParams);

        request(this.mountUrl(params), (error, response, body) => {

            if (error) {
                return console.log('Deu ruim: ' + error);
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

        return `${url}?${stringKeys}`;
    }

    /**
     * Retorna o próximo feriado
     * @param holidays
     * @returns {*}
     */
    searchNextHoliday(holidays) {

        let today = moment.tz(+new Date(), "America/Sao_Paulo").format();

        // Filtra os feriados com data maior que hoje e somente nacionais/municipais/estadual/facultativo
        let nextHolidays = holidays.events.event.filter(h => {

            let validType = holydayTypes.indexOf(h.type) !== -1;

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

        let arrDate  = date.split('/'),
            USformat = `${arrDate[2]}-${arrDate[1]}-${arrDate[0]}`;

        return moment.tz(USformat, "America/Sao_Paulo").format()
    }

    /**
     * Formata o json para texto
     * @param holiday
     * @returns {string}
     */
    jsonToHumans(holiday) {

        let dateUS  = this.toDateUS(holiday.date),
            dayLong = this.getDayLong(dateUS),
            message;

        message = `${holiday.date}: ${holiday.name}\n`;
        message += `Faltam: ${this.getDaysDifference(holiday.date)} dia(s)\n`;
        message += `Cairá em um(a) ${dayLong}`;

        return message;
    }

    /**
     * Calcula a diferença de dias entre as datas
     * @param date
     */
    getDaysDifference(date) {

        let today      = new Date(moment.tz(+new Date(), "America/Sao_Paulo").format()),
            momentDate = new Date(moment.tz(this.toDateUS(date), "America/Sao_Paulo").format()),
            timeDiff   = Math.abs(momentDate.getTime() - today.getTime()),
            diffDays   = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return diffDays;
    }

    getDayLong(date) {

        let newDate = new Date(date);

        return longDays[newDate.getDay()];

    }

}

module.exports = new Calendario();