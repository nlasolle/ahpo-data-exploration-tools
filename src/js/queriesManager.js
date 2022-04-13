const SPARQL_ENDPOINT = "http://localhost:3030/hp_corpus/";

var persons = [], topics = [];
var personAutocomplete, topicAutocomplete;
var selectedPerson, selectedTopic;

/**
 * Launch a SPARQL query to retrieve all individuals from Henri Poincaré corpus graph.
 * For each individual, the IRI and the label (using dcterms:title) are retrieved
 */
function getPersonsLabels() {
    "use strict";
    const query = "PREFIX dcterms: <http://purl.org/dc/terms/> PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> SELECT ?person ?title WHERE {?person a ahpo:Person . ?person dcterms:title ?title}";
    var request = new XMLHttpRequest();

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            console.log(response.results.bindings);
            let bindings = response.results.bindings
            for (let i in bindings) {
                let person = {
                    label: bindings[i].title.value,
                    value: bindings[i].person.value
                };
                persons.push(person);
            }
            console.log(persons);

            personAutocomplete = new Autocomplete(document.getElementById('personAutocompleteInput'), {
                data: persons,
                threshold: 1,
                maximumItems: 6,
                onSelectItem: ({ label, value }) => {
                    selectedPerson = { label, value };
                    $('#generateDistribution').prop('disabled', false);
                }
            });

        } else {
            console.log('An error occured when retrieving persons from the SPARQL endpoint with URL ' + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Launch a SPARQL query to retrieve all topics associated with documents
 *  from Henri Poincaré corpus graph.
 */
function getTopicsLabels() {
    "use strict";
    const query = "PREFIX dcterms: <http://purl.org/dc/terms/> SELECT DISTINCT ?topic WHERE {?s dcterms:subject ?topic}";
    var request = new XMLHttpRequest();

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            console.log(response.results.bindings);
            let bindings = response.results.bindings
            for (let i in bindings) {
                let topic = {
                    label: bindings[i].topic.value,
                    value: bindings[i].topic.value
                };
                topics.push(topic);
            }
            console.log(persons);

            topicAutocomplete = new Autocomplete(document.getElementById('topicAutocompleteInput'), {
                data: topics,
                threshold: 1,
                maximumItems: 6,
                onSelectItem: ({ value }) => {
                    selectedTopic = value;
                    $('#generateDistribution').prop('disabled', false);
                }
            });
        } else {
            console.log('An error occured when retrieving persons from the SPARQL endpoint with URL ' + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve distribution related the whole correspondence.
 */
function getInitialChartData() {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "SELECT (COUNT(?letter) as ?lettersCount) ?year \n" +
        "WHERE {\n" +
        "   ?letter ahpo:writingDate ?date\n" +
        "}\n" +
        "GROUP BY (SUBSTR(?date, 0, 5) AS ?year)\n" +
        "ORDER BY ASC(?year)";
    var request = new XMLHttpRequest();

    console.log(query);

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings
            createDistributionData("L'ensemble des lettres de la correspondance",
                bindings);
        } else {
            console.log('An error occured when retrieving writing dates' +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve distribution related to the given person
 * Data is then used to update the chart.
 * @param {object} person the person object, with label and IRI
 */
function updatePersonChart(person) {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "SELECT (COUNT(?letter) as ?lettersCount) ?year \n" +
        "WHERE {\n" +
        "   ?letter ahpo:correspondent <" + person.value + "> .\n" +
        "   ?letter ahpo:writingDate ?date\n" +
        "}\n" +
        "GROUP BY (SUBSTR(?date, 0, 5) AS ?year)\n" +
        "ORDER BY ASC(?year)";
    var request = new XMLHttpRequest();

    console.log(query);

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings
            console.log(bindings);
            createDistributionData("Lettres échangées avec " + person.label, bindings);
        } else {
            console.log('An error occured when retrieving writing dates ' +
                'associated with ' + person.label +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve distribution related to a topic
 * Data is then used to update the chart.
 * @param {string} topic the topic, as a String
 */
function updateTopicChart(topic) {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "PREFIX dcterms: <http://purl.org/dc/terms/> \n" +
        "SELECT (COUNT(?letter) as ?lettersCount) ?year \n" +
        "WHERE {\n" +
        "   ?letter dcterms:subject ?topic .\n" +
        "   ?letter ahpo:writingDate ?date\n" +
        "   FILTER (STR(?topic) = \"" + topic + "\") \n" +
        "}\n" +
        "GROUP BY (SUBSTR(?date, 0, 5) AS ?year)\n" +
        "ORDER BY ASC(?year)";
    var request = new XMLHttpRequest();

    console.log(query);

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings
            console.log(bindings);
            createDistributionData("Lettres traitant de " + topic, bindings);
        } else {
            console.log('An error occured when retrieving writing dates ' +
                'associated with ' + topic +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve distribution related to a person and a topic
 * Data is then used to update the chart.
 * @param {object} person the person object, with label and IRI
 * @param {string} topic the topic, as a String
 */
function updateCombinedChart(person, topic) {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "PREFIX dcterms: <http://purl.org/dc/terms/> \n" +
        "SELECT (COUNT(?letter) as ?lettersCount) ?year \n" +
        "WHERE {\n" +
        "   ?letter ahpo:correspondent <" + person.value + "> .\n" +
        "   ?letter dcterms:subject ?topic .\n" +
        "   ?letter ahpo:writingDate ?date \n" +
        "   FILTER (STR(?topic) = \"" + topic + "\") \n" +
        "}\n" +
        "GROUP BY (SUBSTR(?date, 0, 5) AS ?year)\n" +
        "ORDER BY ASC(?year)";
    var request = new XMLHttpRequest();

    console.log(query);

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings
            console.log(bindings);
            createDistributionData("Lettres échangées avec " + person.label +
                " traitant de " + topic, bindings);
        } else {
            console.log('An error occured when retrieving writing dates' +
                ' associated with ' + person.label + ' and ' + topic +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}