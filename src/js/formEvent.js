const ARTICLE_FORM = 1,
    DOCUMENT_FORM = 2,
    LETTER_FORM = 3,
    BOOK_FORM = 4,
    PERSON_FORM = 5;

var articlePersonAutocomplete;
var articleAuthor, selectedTopic, selectedJournal, selectedOperator = "&&";
var query;
var resultsTable;

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

    $("input").bind('change input', function () {
        refreshSPARQLQuery();
    });

    $("input").bind('blur', function () {
        refreshSPARQLQuery();
    });



    $('#articleSearchButton').on('click', function () {
        //Send the query to the SPARQL endpoint and update results Table
        getQueryResults("article", query);
    });

    getJournalsLabels();
    articleTopics = getTopicsLabels("ahpo:Article");
    letterTopics = getTopicsLabels("ahpo:Letter");

    //Tags manager for input
    initTagsInput("articleTitleInput", "Saisir un terme");

    //Tags manager for input
    initTagsInput("letterTitleInput", "Saisir un terme");

});



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

        //console.dir(obj);

        var i = 1;

        Object.keys(obj).forEach(key => {
            //console.log("KEY " + key)
            if (key != type) {
                //console.log(obj[key]);
                if (obj[key] && obj[key].value)
                    row[i] = obj[key].value;
                else
                    row.push("");

                i++;
            }
            //console.dir(row);
            //console.dir(headerRow);
            for (let k = i; k < headerRow.length; k++) {
                row.push("");
            }

            //console.dir(row);
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

function updateResultsTable(data, type) {
    let columns = [];

    if (type == "Article") {
        columns = [
            { title: '#' },
            { title: 'Titre' },
            { title: 'Auteur' },
            { title: 'Journal' },
            { title: 'Date de publication' },
        ]
    } else if (type == "Letter") {
        columns = [
            { title: '#' },
            { title: 'Titre' },
            { title: 'Date de rédaction' },
            { title: 'Incipit' }
        ]
    }

    if (resultsTable) {
        resultsTable.destroy();       
        $("#resultsTable").empty();
    }


    //Results table initialization
    resultsTable = $('#resultsTable').DataTable({
        bFilter: true,
        data: data,
        columns: columns
    });
}
