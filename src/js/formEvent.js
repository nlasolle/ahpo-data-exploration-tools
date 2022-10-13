const ARTICLE_FORM = 1,
    DOCUMENT_FORM = 2,
    LETTER_FORM = 3,
    BOOK_FORM = 4,
    PERSON_FORM = 5;

var articlePersonAutocomplete;
var articleAuthor, selectedTopic, selectedJournal, selectedOperator = "&&";
var query;
var resultsTable;
var idsMatch;

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

    clearInputValues();

    articleAuthor = null;
    selectedTopic = null;
    selectedJournal = null;

    $('input[type=radio][name=articleTitleOptions]').change(function () {
        refreshSPARQLQuery();
        selectedOperator = this.value;
    });

    $('input[type=radio][name=letterTranscriptionOptions]').change(function () {
        refreshSPARQLQuery();
        selectedOperator = this.value;
    });

    $('select').change(function () {
        refreshSPARQLQuery();
    });

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

        updateResultsTable([], this.value);
        refreshSPARQLQuery();
    });

    //Article form management
    getArticleAuthorsLabels();
    $("#pivotArticleDateForm").hide();

    $('#articleDateSelect').on('change', function () {
        if (this.value == "between") {
            $("#pivotArticleDateForm").hide();
            $("#betweenArticleDateForm").show();
        } else if (this.value == "before" || this.value == "after") {
            $("#pivotArticleDateForm").show();
            $("#betweenArticleDateForm").hide();
        }

        refreshSPARQLQuery();
    });

    $("#pivotLetterDateForm").hide();
    $('#letterDateSelect').on('change', function () {
        if (this.value == "between") {
            $("#pivotLetterDateForm").hide();
            $("#betweenLetterDateForm").show();
        } else if (this.value == "before" || this.value == "after") {
            $("#pivotLetterDateForm").show();
            $("#betweenLetterDateForm").hide();
        }

        refreshSPARQLQuery();
    });

    $("#articleDateSelect").val("between");
    $("#letterDateSelect").val("between");

    $("input").bind('change input', function () {
        refreshSPARQLQuery();
    });

    $("input").bind('blur', function () {
        refreshSPARQLQuery();
    });


    $('#articleSearchButton').on('click', function () {
        getQueryResults("article", query);
    });

    $('#letterSearchButton').on('click', function () {
        getQueryResults("letter", query);
    });


    $('#exportQueryButton').on('click', function () {
        downloadSPARQLInputContent(queryEditor);
    });


    getJournalsLabels();
    getArgotsLabels();
    articleTopics = getTopicsLabels("ahpo:Article");
    letterTopics = getTopicsLabels("ahpo:Letter");

    //Tags manager for input
    initTagsInput("articleTitleInput", "Saisir un terme");

    //Tags manager for input
    initTagsInput("letterTranscriptionInput", "Saisir un terme");

    updateResultsTable([], "article");
});



function initTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
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

function updateResultsTableContent(type, results) {
    let tableCount = 1;
    let tableContent = [];
    idsMatch = [];

    results.forEach(obj => {

        //Creating data row
        let row = [];
        row.push(tableCount);

        var i = 1;

        resultsTableColumns[type].forEach(key => {
            if (key != type) {
                if (obj[key] && obj[key].value)
                    row[i] = obj[key].value;
                else
                    row.push("");

                i++;
            } else {
               let tableId = obj[key].value.substring(
                obj[key].value.lastIndexOf("/") + 1
               );
               idsMatch[tableCount] = tableId;
            }
        });

        /*Object.keys(obj).forEach(key => {
            if (key != type) {
                if (obj[key] && obj[key].value)
                    row[i] = obj[key].value;
                else
                    row.push("");

                i++;
            } else {
               idsMatch[tableCount] = obj[key].value.substring(
                obj[key].value.lastIndexOf("/") + 1
               );
            }
        });*/

        tableCount++;
        tableContent.push(row);
    });

    updateResultsTable(tableContent, type);

}

function updateResultsTable(data, type) {
    let columns = [];

    if (type.toLowerCase() == "article") {
        columns = [
            { title: '#' },
            { title: 'Titre' },
            { title: 'Auteur' },
            { title: 'Journal' },
            { title: 'Date de publication' },
        ]
    } else if (type.toLowerCase() == "letter") {
        columns = [
            { title: '#' },
            { title: 'Titre' },
            { title: 'Incipit' }
        ]
    } else {
        columns = [
            { title: '#' },
            { title: 'Titre' }
        ];
    }

    if (resultsTable) {
        resultsTable.destroy();
        $("#resultsTable").empty();
    }


    //Results table initialization
    resultsTable = $('#resultsTable').DataTable({
        bFilter: true,
        autowidth: true,
        data: data,
        columns: columns
    });

    $("#resultsTable tr").css("cursor", "pointer");

    $('#resultsTable').on('click', 'tbody tr', function () {
        //Content of the first cell, giving the id in the table
        let tableId = resultsTable.row($(this)).data()[0];

        //Use this retrieved id to find the Omeka S website id 
        let omekaId = idsMatch[tableId];

        //Open link in new tab
        window.open(
            "http://henripoincare.fr/s/correspondance/item/" + omekaId,
            "Détails sur la ressource"
        );
    });


}

/**
 * Remove previous input values
 * Used when relodading the DOM
 */
function clearInputValues() {
    $('input[type=text]').val("");
    $('input[type=number]').val("");
}