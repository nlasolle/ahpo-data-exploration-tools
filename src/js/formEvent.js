var articlePersonAutocomplete;
var articleAuthor;

$(document).ready(function () {

    /*Management of form blocks, which are hidden/shown depending on the selected type
      Default is set to article */
    $("#articleCheckbox").prop("checked", "checked");
    $("#articleBlock").show();
    $("#letterBlock").hide();
    $("#documentBlock").hide();
    $("#personBlock").hide();


    //Remove previous input values when reloading page, but keep them when changing radio button values for ressource type
    $('#articlePersonAutocompleteInput').val("");
    articleAuthor = null;
    $('#documentPersonAutocompleteInput').val("");
    $('#senderAutocompleteInput').val("");
    $('#recipientAutocompleteInput').val("");
    $('#correspondentAutocompleteInput').val("");

    $('input[type=radio][name=typeRadioOptions]').change(function () {
        if (this.value == 'Article') {
            $("#articleBlock").show();
            $("#letterBlock").hide();
            $("#documentBlock").hide();
            $("#personBlock").hide();

        }
        else if (this.value == 'Document') {
            $("#articleBlock").hide();
            $("#letterBlock").show();
            $("#documentBlock").hide();
            $("#personBlock").hide();
        }
        else if (this.value == 'Letter') {
            $("#articleBlock").hide();
            $("#letterBlock").hide();
            $("#documentBlock").show();
            $("#personBlock").hide();
        }
        else if (this.value == 'Person') {
            $("#articleBlock").show();
            $("#letterBlock").hide();
            $("#documentBlock").hide();
            $("#personBlock").show();
        }
    });

    //Date management, seems not to be working using jQuery?
    document.getElementById("minPublicationDateInput").valueAsDate = new Date(1874, 1)
    document.getElementById("maxPublicationDateInput").valueAsDate = new Date(1913, 1)
    document.getElementById("pivotPublicationDateInput").valueAsDate = new Date(1890, 1)

    //Article form management
    $("#pivotPublicationDateForm").hide();

    $('#publicationDateSelect').on('change', function () {
        alert(this.value);
        if (this.value == "between") {
            $("#pivotPublicationDateForm").hide();
            $("#betweenPublicationDateForm").show();
        } else if (this.value == "before" || this.value == "after") {
            $("#pivotPublicationDateForm").show();
            $("#betweenPublicationDateForm").hide();
        }
    });

    //Results table initialization
    $('#resultsTable').DataTable({
        autoWidth: true,
        bFilter: true
      });

    $('#articleSearchButton').on('click', function () {

        //Generate the query
        let variables = " ?article", body = "";

        //What we want to retrieve for each result, here for each article
        //We use the OPTIONAL clause because we don't to include these properties as contraint
        resultsTableColumns.article.forEach(property => {
            variableName = "?" + property.substring(property.lastIndexOf(":") + 1);
            variables += " " + variableName;
            body += "\tOPTIONAL { ?article " + property + " " + variableName + "} .\n";
        });

        //Adding the constraint based on users input

        /* This value is an IRI, based on the label selected by the user in the input,
           see queriesManager.js getPersonsLabels() function for details */
        if (articleAuthor) {
            body += "\t?article ahpo:authoredBy <" + articleAuthor.value + "> .\n";
        }

        switch($("#resultsLimitSelect").val()){
            case 'between' : {
               
            }
            case 'before' : {
                body += "\t?article ahpo:publicationDate <" + articleAuthor.value + "> .\n";
            }
        }
         /* Publication date, before a given value or between two dates */
         console.log();
        

        //Construct the full SPARQL query
        let query = prefixHeader + "\n" +
            "SELECT" + variables + " WHERE {\n" +
            body +
            "\n}";


        //Print the query on the form
        updateQueryInput(query);
        
        //Send the query to the SPARQL endpoint
        getQueryResults("article", query);

        //Put the results in the table

        //Prepare distribution
    });

    $('#documentSearchButton').on('click', function () {

    });

    $('#letterSearchButton').on('click', function () {

    });

    $('#personSearchButton').on('click', function () {

    });
});

function updateQueryInput(query){
    queryEditor.setValue(query);
}

function updateResultsTableContent(type, results) {
    let tableCount = 1;
    let tableContent = [];
    let first = true;

    results.forEach(obj => {

        //First line? Then we create the header
        if (first) {
            first = false;
            Object.keys(obj).forEach(key => {
                let headerRow = [];
                if (key != type) {
                    let column = {}
                    column.title = key;
                    headerRow.push(column)
                }
            });
        }
        //Creating data row
        let row = [];
        row.push(tableCount);

        Object.keys(obj).forEach(key => {
            if (key != type) {
                console.log(obj[key].value);
                row.push(obj[key].value);
            }
        });

        tableCount++;
        tableContent.push(row);
    });

    $("#resultsTable > thead").empty();
    $("#resultsTable").dataTable().fnClearTable();

    if (tableContent.length != 0) {
        $("#resultsTable").dataTable().fnAddData(tableContent);
        $("#resultsTable tr").css("cursor", "pointer");
    }
}