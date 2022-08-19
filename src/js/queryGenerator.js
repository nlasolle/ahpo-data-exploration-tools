function refreshSPARQLQuery() {
    query = "";
    checkEmptyInputs(ARTICLE_FORM);

    //Generates the new SPARQL query
    switch ($("input[type=radio][name=typeRadioOptions]").val()) {
        case 'Article': {
            query = generateArticleQuery();
            break;
        }
        case 'Document': {
            query = generateDocumentQuery();
            break;
        }
        case 'Letter': {
            query = generateLetterQuery();
            break;
        }
        case 'Person': {
            query = generatePersonQuery();
        }
    }

    //Update the query text area
    if (query) {
        updateQueryInput(query);
    }

}


function generateDocumentQuery() {
    //Generate the query
    let variables = " ?lettre", body = "", optionalBody = "";

    //Always include the label
    variables += " ?titre";
    optionalBody += "\tOPTIONAL { ?lettre rdfs:label ?titre } .\n";

    //At least one constraint --> The document is an letter 

    body += "\t?lettre a ahpo:Letter . \n";

    //Construct the full SPARQL query
    let query = prefixHeader + "\n" +
        "SELECT DISTINCT" + variables + " WHERE {\n" +
        body +
        optionalBody +
        "\n}\n" +
        "ORDER BY ?publicationDate";

    return query;

}

function generateArticleQuery() {

    //Generate the query
    let variables = " ?article", body = "", optionalBody = "";

    //Always include the label
    variables += " ?titre";
    optionalBody += "\tOPTIONAL { ?article rdfs:label ?titre } .\n";

    //At least one constraint --> The document is an article 

    body += "\t?article a ahpo:Article . \n";

    //Then adding the constraint based on users input

    /* This value is an IRI, based on the label selected by the user in the input,
       see queriesManager.js getPersonsLabels() function for details */
    if (articleAuthor) {
        body += "\t?article ahpo:authoredBy <" + articleAuthor.value + "> .\n" +
            "\t<" + articleAuthor.value + "> dcterms:title ?auteur .\n";
    } else {
        optionalBody += "\tOPTIONAL { ?article ahpo:authoredBy [dcterms:title ?auteur] } .\n";
    }

    body += addStringPropertyConstraint("articleTopicAutocompleteInput",
        "dcterms:subject");

    body += "\t?article ahpo:language \"" + $( "#articleLanguageSelect option:selected" ).text() + "\" .\n";

    let titleConstraint = addStringPropertyContainsConstraint("articleTitleInput", "titre", selectedOperator);

    if (titleConstraint != "") {
        body += "\tFILTER (" + titleConstraint + " ) . \n";
    }

    /* This value is an IRI, based on the label selected by the user in the input,
       see queriesManager.js getJournalsLabel() function for details */
    if (selectedJournal) {
        body += "\t?article ahpo:publishedIn <" + selectedJournal.value + "> .\n" +
            "\t<" + selectedJournal.value + "> dcterms:title ?journal .\n";
    } else {
        optionalBody += "\tOPTIONAL { ?article ahpo:publishedIn [dcterms:title ?journal] } .\n";
    }

    switch ($("#publicationDateSelect").val()) {
        case 'between': {
            if ($("#minPublicationYearInput").val() &&
                $("#maxPublicationYearInput").val()) {
                body += "\t?article ahpo:publicationDate ?dateDePublication .\n" +
                    "\tFILTER(xsd:integer(SUBSTR(?dateDePublication, 0, 5)) >= "
                    + $("#minPublicationYearInput").val() + "\n" +
                    "\t\t && xsd:integer(SUBSTR(?dateDePublication, 0, 5)) <= " +
                    + $("#maxPublicationYearInput").val() + ")\n";
            } else {
                optionalBody += "\tOPTIONAL { ?article ahpo:publicationDate ?dateDePublication } .";
            }
            break;

        }
        case 'before': {
            if ($("#pivotPublicationYearInput").val()) {
                body += "\t?article ahpo:publicationDate ?dateDePublication .\n" +
                    "\tFILTER( xsd:integer(SUBSTR(?dateDePublication, 0, 5)) <= " +
                    + $("#pivotPublicationYearInput").val() + " ) \n";
            }
            else {
                optionalBody += "\tOPTIONAL { ?article ahpo:publicationDate ?dateDePublication } .";
            }
            break;

        }

        case 'after': {
            if ($("#pivotPublicationYearInput").val()) {
                body += "\t?article ahpo:publicationDate ?dateDePublication .\n" +
                    "\tFILTER( xsd:integer(SUBSTR(?dateDePublication, 0, 5)) >= " +
                    + $("#pivotPublicationYearInput").val() + " ) \n";
            }
            else {
                optionalBody += "\tOPTIONAL { ?article ahpo:publicationDate ?dateDePublication } .";
            }
            break;

        }

        case 'equalsTo': {
            if ($("#pivotPublicationYearInput").val()) {
                body += "\t?article ahpo:publicationDate ?dateDePublication .\n" +
                    "\tFILTER( xsd:integer(SUBSTR(?dateDePublication, 0, 5)) = " +
                    + $("#pivotPublicationYearInput").val() + " ) \n";
            }
            else {
                optionalBody += "\tOPTIONAL { ?article ahpo:publicationDate ?dateDePublication } .";
            }
            break;
        }
    }

    variables += " ?auteur";
    variables += " ?journal";
    variables += " ?dateDePublication";


    //Construct the full SPARQL query
    let query = prefixHeader + "\n" +
        "SELECT DISTINCT" + variables + " WHERE {\n" +
        body +
        optionalBody +
        "\n}\n" +
        "ORDER BY ?publicationDate";

    return query;
}


function addStringPropertyConstraint(inputId, property) {
    let constraintList = "";

    $('.tagify__tag').each(function () {

        if ($(this).parent().siblings("#" + inputId).get(0)) {
            let constraint = "\t?article " + property + " \"" + $(this).get(0).title + "\" .\n";

            if ($(this).hasClass("unwanted-item")) {
                constraintList += "\tFILTER NOT EXISTS {" + constraint + "} .\n";
            } else {
                constraintList += constraint;
            }
        }
    });

    return constraintList
}

function addStringPropertyContainsConstraint(inputId, variableName, operator) {
    let first = true;
    let constraintList = "";

    $('.tagify__tag').each(function () {
        if ($(this).parent().siblings("#" + inputId).get(0)) {
            if (!first) {
                constraintList += " " + operator;
            } else {
                first = false;
            }

            let constraint = "CONTAINS(?" + variableName + ", \"" + $(this).get(0).title + "\")";

            if ($(this).hasClass("unwanted-item")) {
                constraintList += " !" + constraint;
            } else {
                constraintList += " " + constraint;
            }

        }


    });

    return constraintList;
}