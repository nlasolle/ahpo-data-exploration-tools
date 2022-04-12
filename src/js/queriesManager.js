const SPARQL_ENDPOINT = "http://localhost:3030/hp_corpus/";

var persons = [], topics = [];
var personAutocomplete, topicAutocomplete;

/**
 * Launch a SPARQL query to retrieve all individuals from Henri Poincaré corpus graph.
 * For each individual, the IRI and the label (using dcterms:title) are retrieved
 */
function getPersonsLabels() {
    "use strict";
    const query = "PREFIX dcterms: <http://purl.org/dc/terms/> PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#> SELECT ?person ?title WHERE {?person a ahpo:Person . ?person dcterms:title ?title}";
    var request = new XMLHttpRequest();

    //Retrieve all prefixes for the current RDF database (prefix + URI)
    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            console.log(response.results.bindings);
            let bindings = response.results.bindings
            for(let i in bindings){
                let person = {label: bindings[i].title.value,
                          value: bindings[i].person.value};
                persons.push(person);
            }
            console.log(persons);

            personAutocomplete = new Autocomplete(document.getElementById('personAutocompleteInput'), {
                data: persons,
                threshold: 1,
                maximumItems: 6
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

    //Retrieve all prefixes for the current RDF database (prefix + URI)
    request.open("GET", SPARQL_ENDPOINT + "?query=" + encodeURIComponent(query), true);
    request.setRequestHeader("Content-type", "application/sparql-query");

    request.onload = function () {
        if (request.status == 200) {
            let response = JSON.parse(this.response);
            console.log(response.results.bindings);
            let bindings = response.results.bindings
            for(let i in bindings){
                let topic = {label: bindings[i].topic.value,
                          value: bindings[i].topic.value};
                topics.push(topic);
            }
            console.log(persons);

            topicAutocomplete = new Autocomplete(document.getElementById('topicAutocompleteInput'), {
                data: topics,
                threshold: 1,
                maximumItems: 6
            });
        } else {
            console.log('An error occured when retrieving persons from the SPARQL endpoint with URL ' + SPARQL_ENDPOINT);
        }
    };

    request.send(JSON.stringify(query));
}