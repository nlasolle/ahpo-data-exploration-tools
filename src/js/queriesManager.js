const SPARQL_ENDPOINT = "http://localhost:3030/hp_corpus/";

var persons = [], topics = [];
var personAutocomplete, topicAutocomplete, mapPersonAutocomplete;
var selectedPerson, selectedTopic;

/**
 * Launch a SPARQL query to retrieve all individuals from Henri PoincarĂ© corpus graph.
 * For each individual, the IRI and the label (using dcterms:title) are retrieved
 */
function getPersonsLabels() {
    "use strict";
    const query = "PREFIX dcterms: <http://purl.org/dc/terms/>\n" +
        "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#>\n" +
        "PREFIX ahpot: <http://henripoincare.fr/ahpot#>\n" +
        "SELECT ?person ?title ?birthPlace ?deathPlace WHERE {\n " +
        "   ?person a ahpo:Person . \n" +
        "   ?person dcterms:title ?title .\n" +
        "   OPTIONAL{?person ahpot:birthPlace ?birthPlace}\n" +
        "}";

    console.log(query);
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
                    value: bindings[i].person.value,
                    birthPlace: bindings[i].birthPlace ? bindings[i].birthPlace.value : null
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

            mapPersonAutocomplete = new Autocomplete(document.getElementById('mapPersonAutocompleteInput'), {
                data: persons,
                threshold: 1,
                maximumItems: 6,
                onSelectItem: ({ label, value }) => {
                    selectedPerson = { label, value };
                    $('#generatePersonMarkers').prop('disabled', false);
                }
            });

            articlePersonAutocomplete = new Autocomplete(document.getElementById('articlePersonAutocompleteInput'), {
                data: persons,
                threshold: 1,
                maximumItems: 6,
                onSelectItem: ({ label, value }) => {
                    articleAuthor = { label, value };
                    refreshSPARQLQuery();
                }
            });

        } else {
            console.log('An error occured when retrieving persons from the SPARQL endpoint with URL ' + SPARQL_ENDPOINT);
        }
    };

    request.send();
}

/**
 * Launch a SPARQL query to retrieve all topics associated with documents
 *  from Henri PoincarĂ© corpus graph.
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

    request.send();
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
            initDistributionData("Les articles rĂ©digĂ©s par PoincarĂ© selon leur date de publication",
                bindings, "articles");
        } else {
            console.log('An error occured when retrieving articles publication dates' +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send();
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

    request.send();
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
            createDistributionData("Lettres Ă©changĂ©es avec " + person.label, bindings);
        } else {
            console.log('An error occured when retrieving writing dates ' +
                'associated with ' + person.label +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send();
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

    request.send();
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
            createDistributionData("Lettres Ă©changĂ©es avec " + person.label +
                " traitant de " + topic, bindings);
        } else {
            console.log('An error occured when retrieving writing dates' +
                ' associated with ' + person.label + ' and ' + topic +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send();
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

    request.send();
}

/**
 * Send a SPARQL query to retrieve correspondents citations (within letters transcriptions) 
 */
function getCorrespondentsCitations(property) {

    "use strict";
    const query = "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> \n" +
        "PREFIX dcterms: <http://purl.org/dc/terms/> \n" +
        "SELECT ?title ?description (COUNT(?letter) as ?count) \n" +
        "WHERE {\n" +
        "   ?letter " + property + " ?person .\n" +
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
            if (property === "ahpo:citeName") {
                setCorrespondentCitations(bindings, 3);
            } else {
                setCorrespondentCitations(bindings, 4);
            }

        } else {
            console.log('An error occured when retrieving correspondents citations' +
                ' from the SPARQL endpoint with URL '
                + SPARQL_ENDPOINT);
        }
    };

    request.send();
}


/**
 * Launch a SPARQL query and put the content in a DataTable
 */
function getQueryResults(type, query) {
    "use strict";;
    var request = new XMLHttpRequest();
    console.log("FINAL QUERY " + query);
    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            let bindings = response.results.bindings;
            console.log(bindings);
            updateResultsTableContent(type, bindings);

        } else {
            console.log('An error occured when executing the query for the' +
                'SPARQL endpoint with URL ' + SPARQL_ENDPOINT);
        }
    };

    request.send();
}