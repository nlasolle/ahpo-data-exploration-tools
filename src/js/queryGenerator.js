const ALL = "Tout";

function refreshSPARQLQuery() {
query = "";
checkEmptyInputs(ARTICLE_FORM);

//Generates the new SPARQL query
switch ($("input[type=radio][name=typeRadioOptions]:checked").val()) {

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
        break;
    }
    default: {
        query = generateArticleQuery();
    }
}

//Update the query text area
if (query) {
    updateQueryInput(query);
}

}


function generateDocumentQuery() {
//Generate the query
let variables = " ?document", body = "", optionalBody = "";

//Always include the label
variables += " ?titre";
optionalBody += "\tOPTIONAL { ?document rdfs:label ?titre } .\n";

//At least one constraint --> The document is an letter 

body += "\t?document a ahpo:Document . \n";

//Construct the full SPARQL query
let query = PREFIX_HEADER + "\n" +
    "SELECT DISTINCT" + variables + " WHERE {\n" +
    body +
    optionalBody +
    "\n}\n" +
    "ORDER BY ?lang ?publicationDate";

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
let authorsConstraint = addIriPropertyConstraint("articlePersonAutocompleteInput",
    "ahpo:authoredBy", "article");

if (authorsConstraint) {
    body += authorsConstraint;
}

variables += " ?auteur";
optionalBody += "\tOPTIONAL { ?article ahpo:authoredBy [rdfs:label ?auteur] } .\n";

body += addStringPropertyConstraint("articleTopicAutocompleteInput",
    "dcterms:subject", "article");


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

variables += " ?journal";
variables += " ?dateDePublication";

let dateBody = addDateConstraint("Article",
    "ahpo:publicationDate", "dateDePublication")

if (dateBody) {
    body += dateBody;
} else {
    optionalBody += "\tOPTIONAL { ?article ahpo:publicationDate ?dateDePublication } .";
}

if($("#articleLanguageSelect option:selected").text() != ALL) {
    body += "\t?article ahpo:language \"" + $("#articleLanguageSelect option:selected").text() + "\"\n";
}


//Construct the full SPARQL query
let query = PREFIX_HEADER + "\n" +
    "SELECT DISTINCT" + variables + " WHERE {\n" +
    body +
    optionalBody +
    "\n}\n" +
    "ORDER BY ?dateDePublication";

return query;
}


function generateLetterQuery() {

//Generate the query
let variables = " ?letter", body = "", optionalBody = "";

//Always include the label
variables += " ?titre";
optionalBody += "\tOPTIONAL { ?letter rdfs:label ?titre } .\n";
optionalBody += "\tOPTIONAL { ?letter ahpo:incipit ?incipit } .\n";

//At least one constraint --> The document is an letter
body += "\t?letter a ahpo:Letter . \n";

//Then adding the constraint based on users input
let senderConstraint = addIriPropertyConstraint("senderAutocompleteInput",
    "ahpo:sentBy", "letter");

if (senderConstraint) {
    body += senderConstraint;
}

//Then adding the constraint based on users input
let recipientConstraint = addIriPropertyConstraint("recipientAutocompleteInput",
    "ahpo:sentTo", "letter");

if (recipientConstraint) {
    body += recipientConstraint;
}

let quotedPeopleConstraint = addIriPropertyConstraint("quotedPeopleInput",
    "ahpo:citeName", "letter");

if (quotedPeopleConstraint) {
    body += quotedPeopleConstraint;
}

let quotedPeopleCommentConstraint = addIriPropertyConstraint("quotedPeopleCommentInput",
    "ahpo:citeNameApparat", "letter");

if (quotedPeopleCommentConstraint) {
    body += quotedPeopleCommentConstraint;
}

let addStringPropertyConstraintConstraint = addIriPropertyConstraint("letterArgotInput",
    "ahpo:citeArgot", "letter");

if (addStringPropertyConstraintConstraint) {
    body += addStringPropertyConstraintConstraint;
}

body += addStringPropertyConstraint("letterTopicAutocompleteInput",
    "dcterms:subject", "letter");

if($("#letterLanguageSelect option:selected").text() != ALL) {
    body += "\t?letter ahpo:language \"" + $("#letterLanguageSelect option:selected").text() + "\" .\n";
}

let transcriptionConstraint = addStringPropertyContainsConstraint("letterTranscriptionInput", "transcription", selectedOperator);

if (transcriptionConstraint != "") {
    body += "\t?letter o:media [o-cnt:chars ?transcription] .\n";
    body += "\tFILTER (" + transcriptionConstraint + " ) . \n";
}

variables += " ?incipit";

let dateBody = addDateConstraint("Letter",
    "ahpo:writingDate", "dateDeRedaction")

if (dateBody) {
    body += dateBody;
}


if($("#letterPageNumberValue").val()) {
    let nbPageOperator = "<="
    
    if($("#letterPageNumber option:selected").val() == "after") {
        nbPageOperator = ">="
    } 
    
    body += "\t?letter ahpo:numberOfPages ?nbPages . \n" 
          + "\tFILTER( xsd:integer(?nbPages) " + nbPageOperator + " " + $("#letterPageNumberValue").val() + ") . \n";
}


//Construct the full SPARQL query
let query = PREFIX_HEADER + "\n" +
    "SELECT DISTINCT" + variables + " WHERE {\n" +
    body +
    optionalBody +
    "}\n" +
    "ORDER BY ?dateDeRedaction";

return query;
}


function addStringPropertyConstraint(inputId, property, typeName) {
let constraintList = "";

$('.tagify__tag').each(function () {

    if ($(this).parent().siblings("#" + inputId).get(0)) {
        let constraint = "\t?" + typeName + " " + property + " \"" + $(this).get(0).title + "\" .\n";

        if ($(this).hasClass("unwanted-item")) {
            constraintList += "\tFILTER NOT EXISTS {" + constraint + "} .\n";
        } else {
            constraintList += constraint;
        }
    }
});

return constraintList
}

function addDateConstraint(typeName, property, varName) {
let dateBody = "";

switch ($("#" + typeName.toLowerCase() + "DateSelect").val()) {
    case 'between': {
        if ($("#min" + typeName + "YearInput").val() &&
            $("#max" + typeName + "YearInput").val()) {
            dateBody = "\t?" + typeName.toLowerCase() + " " + property + " ?" + varName + " .\n" +
                "\tFILTER(xsd:integer(SUBSTR(?" + varName + ", 0, 5)) >= "
                + $("#min" + typeName + "YearInput").val() + "\n" +
                "\t\t && xsd:integer(SUBSTR(?" + varName + ", 0, 5)) <= " +
                + $("#max" + typeName + "YearInput").val() + ")\n";
        }
        break;

    }
    case 'before': {
        if ($("#pivot" + typeName + "YearInput").val()) {
            dateBody = "\t?" + typeName.toLowerCase() + " " + property + " ?" + varName + " .\n" +
                "\tFILTER( xsd:integer(SUBSTR(?" + varName + ", 0, 5)) <= " +
                + $("#pivot" + typeName + "YearInput").val() + " ) \n";
        }
        break;
    }

    case 'after': {
        if ($("#pivot" + typeName + "YearInput").val()) {
            dateBody = "\t?" + typeName.toLowerCase() + property + " ?" + varName + " .\n" +
                "\tFILTER( xsd:integer(SUBSTR(?" + varName + ", 0, 5)) >= " +
                + $("#pivot" + typeName + "YearInput").val() + " ) \n";
        }
        break;
    }

    case 'equalsTo': {
        if ($("#pivot" + typeName + "YearInput").val()) {
            dateBody += "\t?" + typeName.toLowerCase() + " " + property + " ?" + varName + " .\n" +
                "\tFILTER( xsd:integer(SUBSTR(?" + varName + ", 0, 5)) = " +
                + $("#pivot" + typeName + "YearInput").val() + " ) \n";
        }
        break;
    }
}

return dateBody;

}

/**
* Add constraint for an iri associated property
* @param {*} inputId the id of the input containing tags
* @param {*} property the property
* @returns a list of constraints
*/
function addIriPropertyConstraint(inputId, property, typeName) {
let constraintList = "";

$('.tagify__tag').each(function () {

    if ($(this).parent().siblings("#" + inputId).get(0)) {
        let constraint = "\t?"+ typeName + " " + property + " [rdfs:label  \"" + $(this).get(0).title + "\"] .\n";

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

        let constraint = "CONTAINS(lcase(?" + variableName + "), \"" + $(this).get(0).title.toLowerCase() + "\")";

        if ($(this).hasClass("unwanted-item")) {
            constraintList += " !" + constraint;
        } else {
            constraintList += " " + constraint;
        }

    }


});

return constraintList;
}