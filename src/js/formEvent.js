const ARTICLE_FORM = 1,
    DOCUMENT_FORM = 2,
    LETTER_FORM = 3,
    BOOK_FORM = 4,
    PERSON_FORM = 5;

var articlePersonAutocomplete;
var articleAuthor, selectedTopic, selectedJournal;
var query;

$(document).ready(function () {

    initTooltips();

    refreshSPARQLQuery();

    /*Management of form blocks, which are hidden/shown depending on the selected type
      Default is set to article */
    $("#articleCheckbox").prop("checked", "checked");
    $("#articleBlock").show();
    $("#letterBlock").hide();
    $("#documentBlock").hide();
    $("#personBlock").hide();


    //Remove previous input values when reloading page, but keep them when changing radio button values for ressource type
    $('#articlePersonAutocompleteInput').val("");
    $('#documentPersonAutocompleteInput').val("");
    $('#senderAutocompleteInput').val("");
    $('#recipientAutocompleteInput').val("");
    $('#correspondentAutocompleteInput').val("");

    articleAuthor = null;
    selectedTopic = null;
    selectedJournal = null;

    $('input[type=radio][name=typeRadioOptions]').change(function () {
        if (this.value == 'Article') {
            $("#articleBlock").show();
            $("#letterBlock").hide();
            $("#documentBlock").hide();
            $("#personBlock").hide();

        }
        else if (this.value == 'Document') {
            $("#articleBlock").hide();
            $("#letterBlock").hide();
            $("#documentBlock").show();
            $("#personBlock").hide();
        }
        else if (this.value == 'Letter') {
            $("#articleBlock").hide();
            $("#letterBlock").show();
            $("#documentBlock").hide();
            $("#personBlock").hide();
        }
        else if (this.value == 'Person') {
            $("#articleBlock").show();
            $("#letterBlock").hide();
            $("#documentBlock").hide();
            $("#personBlock").show();
        }

        refreshSPARQLQuery();
    });

    //Article form management
    $("#pivotPublicationDateForm").hide();

    $('#publicationDateSelect').on('change', function () {
        if (this.value == "between") {
            $("#pivotPublicationDateForm").hide();
            $("#betweenPublicationDateForm").show();
        } else if (this.value == "before" || this.value == "after") {
            $("#pivotPublicationDateForm").show();
            $("#betweenPublicationDateForm").hide();
        }

        refreshSPARQLQuery();
    });

    $("input").bind('change input', function () {
        refreshSPARQLQuery();
    });

    $("input").bind('blur', function () {
        console.log("BLURAAA");
        refreshSPARQLQuery();
    });

    //Results table initialization
    $('#resultsTable').DataTable({
        autoWidth: true,
        bFilter: true,
        fixedColumns: false
    });

    $('#articleSearchButton').on('click', function () {

        //Send the query to the SPARQL endpoint and update results Table
        getQueryResults("article", query);

        //Prepare distribution
        console.log(query);
    });

    //Tags manager for input
    initTagsInput("articleTitleInput", "Saisir un terme");
});


function refreshSPARQLQuery() {
    query = "";
    checkEmptyInputs(ARTICLE_FORM);
    console.log($("#typeRadioOptions").val());

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

    $(".tagify__tag").unbind('hover');
}

function initTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

function checkEmptyInputs(documentType) {

    switch (documentType) {
        case ARTICLE_FORM: {
            if ($("#articlePersonAutocompleteInput").val() == "") {
                articleAuthor = null;
            }

            if ($("#articleTopicAutocompleteInput").val() == "") {
                selectedTopic = null;
            }

            if ($("#articleJournalAutocompleteInput").val() == "") {
                selectedJournal = null;
            }

            break;
        }

        default: break;
    }

}

function updateQueryInput(query) {
    queryEditor.setValue(query);
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

    if (selectedTopic) {
        body += "\t?article dcterms:subject \"" + selectedTopic + "\" .\n";
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

function updateResultsTableContent(type, results) {
    let tableCount = 1;
    let tableContent = [];
    let first = true;
    let headerRow;

    results.forEach(obj => {

        //First line? Then we create the header
        if (first) {
            first = false;
            Object.keys(obj).forEach(key => {
                headerRow = [];
                if (key != type) {
                    let column = {}
                    column.title = key;
                    headerRow.push(column);
                }
            });

            //tableContent.push(headerRow);
        }

        //Creating data row
        let row = [];
        row.push(tableCount);

        Object.keys(obj).forEach(key => {
            if (key != type) {
                row.push(obj[key].value);
            }
        });

        tableCount++;
        tableContent.push(row);
    });


    //$("#resultsTable > thead").empty();
    $("#resultsTable").dataTable().fnClearTable();

    if (tableContent.length != 0) {
        $("#resultsTable").dataTable().fnAddData(tableContent);
        $("#resultsTable tr").css("cursor", "pointer");
    }
}