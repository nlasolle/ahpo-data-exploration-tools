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
                    $('#generatePersonDistribution').prop('disabled', false);
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
                    $('#generateTopicDistribution').prop('disabled', false);
                }
            });
        } else {
            console.log('An error occured when retrieving persons from the SPARQL endpoint with URL ' + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve distribution related to publication dates of articles
 */
function getArticlesData() {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "SELECT (COUNT(?article) as ?count) ?year \n" +
        "WHERE {\n" +
        "   ?article a ahpo:Article .\n" +
        "   ?article ahpo:authoredBy <http://henripoincare.fr/api/items/843> .\n" +
        "   ?article ahpo:publicationDate ?date\n" +
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
            initDistributionData("Les articles rédigés par Poincaré selon leur date de publication",
                bindings, "articles");
        } else {
            console.log('An error occured when retrieving articles publication dates' +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve distribution related the whole correspondence.
 */
function getLettersData() {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "SELECT (COUNT(?letter) as ?count) ?year \n" +
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
            initDistributionData("L'ensemble des lettres de la correspondance",
                bindings, "letters");
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
        "SELECT (COUNT(?letter) as ?count) ?year \n" +
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
        "SELECT (COUNT(?letter) as ?count) ?year \n" +
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
        "SELECT (COUNT(?letter) as ?count) ?year \n" +
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


/**
 * Send a SPARQL query to retrieve statistics about correspondents
 */
function getCorrespondentsStatistics() {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "PREFIX dcterms: <http://purl.org/dc/terms/> \n" +
        "SELECT ?title ?description (COUNT(?letter) as ?count) \n" +
        "WHERE {\n" +
        "   ?letter ahpo:correspondent ?person .\n" +
        "   ?person dcterms:title ?title .\n" +
        "   ?person dcterms:description ?description\n" +
        "}\n" +
        "GROUP BY ?title ?description\n" +
        "ORDER BY DESC(?count)";

    var request = new XMLHttpRequest();

    console.log(query);

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings
            updateCorrespondentsTable(bindings);
        } else {
            console.log('An error occured when retrieving correspondents statistics' +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}

/**
 * Send a SPARQL query to retrieve correspondents citations (within letters transcriptions) 
 */
function getCorrespondentsCitations() {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "PREFIX dcterms: <http://purl.org/dc/terms/> \n" +
        "SELECT ?title ?description (COUNT(?letter) as ?count) \n" +
        "WHERE {\n" +
        "   ?letter ahpo:citeName ?person .\n" +
        "   ?person dcterms:title ?title .\n" +
        "   ?person dcterms:description ?description\n" +
        "}\n" +
        "GROUP BY ?title ?description\n" +
        "ORDER BY DESC(?count)";

    var request = new XMLHttpRequest();
    console.log(query);

    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings
            setCorrespondentCitations(bindings);
        } else {
            console.log('An error occured when retrieving correspondents citations' +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}