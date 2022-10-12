
var tableContent, tableCount, map;

$(document).ready(function () {

  $('#correspondentTable').DataTable({
    autoWidth: false,
    bFilter: true
  });

  initMap();

  $('#correspondentsTable tbody').on('click', 'tr', function () {

  });

  //Only active if one of the input fields have been filled
  $('#generatePersonDistribution').prop('disabled', true);
  $('#generateTopicDistribution').prop('disabled', true);
  $('#generatePersonMarkers').prop('disabled', true);

  getPersonsLabels();

  //Statistics about correspondent are saved to nav local storage
  tableContent = JSON.parse(localStorage.getItem('correspondentStorage'));
  if (!tableContent) {
    console.log("Correspondent statistics not found on the local storage.");
    getCorrespondentsStatistics();
  } else {
    console.log("Correspondent statistics found on the local storage.");
    $("#correspondentsTable").dataTable().fnClearTable();

    if (tableContent.length != 0) {
      $("#correspondentsTable").dataTable().fnAddData(tableContent);
      $("#correspondentsTable tr").css("cursor", "pointer");
    }
  }

  prepareModalChart(1872, 1912);
  getLettersData();
  getArticlesData();

  $('#personAutocompleteInput').val("");
  $('#mapPersonAutocompleteInput').val("");
  $('#topicAutocompleteInput').val("");

  //Get chart data as CSV values
  $('#exportCSV').click(function (e) {
    downloadChartCSV(years, counts);
  });

  //Get an image of the chart
  $('#exportPNG').click(function (e) {
    var a = document.createElement('a');
    a.href = lettersChart.toBase64Image();
    a.download = "chart_distribution_" + getFormattedDate() + ".png";
    a.click();
  });

  //Get articles chart data as CSV values
  $('#exportArticlesCSV').click(function (e) {
    downloadChartCSV(years, counts);
  });

  //Get an image of the articles chart
  $('#exportArticlesPNG').click(function (e) {
    var a = document.createElement('a');
    a.href = articlesChart.toBase64Image();
    a.download = "articles_chart_distribution_" + getFormattedDate() + ".png";
    a.click();
  });

  //Remove dataset, only keep the first distribution, corresponding to the whole correspondence
  $('#reinitChart').click(function (e) {
    lettersChart.data.datasets.splice(1);
    lettersChart.update();
  });

  $('#generatePersonDistribution').click(function (e) {
    /*We need to check the status of each input field
     Because we don't want to use the value 
     which is stored in selectedPerson var or selectedTopic var
     if the corresponding input field is empty */
    let person = $('#personAutocompleteInput').val();

    if (person != '') {
      updatePersonChart(selectedPerson);
    }
  });

  //Get chart data as CSV values
  $('#generatePersonMarkers').click(function (e) {
    let personLabel = $('#mapPersonAutocompleteInput').val();

    let person = persons.find(p => {
      return p.label == personLabel;
    });
     console.log("PERSON LABEL " + personLabel);
     console.dir(persons);
 console.log("PERSON");
     console.dir(person);
    if (person != '' && person.birthPlace) {
      let id = person.birthPlace.substring(person.birthPlace.lastIndexOf("/") + 1);
      getGeonamesData(person, id);
    } else {
      alert("No information about the birth place of " + personLabel + " exists in the database.")
    }

  });

  $('#generateTopicDistribution').click(function (e) {
    /*We need to check the status of each input field
     Because we don't want to use the value 
     which is stored in selectedPerson var or selectedTopic var
     if the corresponding input field is empty */
    let topic = $('#distribTopicAutocompleteInput').val();

    if (topic != '') {
      updateTopicChart(selectedTopic);
    }
  });

  $("a[href='#tab5']").on('shown.bs.tab', function (e) {
    map.invalidateSize();
  });

});

function updateCorrespondentsTable(results) {

  tableCount = 1;
  tableContent = [];
  let row;

  results.forEach(obj => {
    row = [];
    row.push(tableCount);
    row.push(obj.title.value);
    row.push(obj.count.value);
    row.push("0");
    row.push("0");
    row.push(obj.description.value);

    tableCount++;
    tableContent.push(row);
  });


  $("#correspondentsTable").dataTable().fnClearTable();

  if (tableContent.length != 0) {
    $("#correspondentsTable").dataTable().fnAddData(tableContent);
    $("#correspondentsTable").columns.adjust().draw();
    $("#correspondentsTable tr").css("cursor", "pointer");
  }
  getCorrespondentsCitations("ahpo:citeName");
}

function setCorrespondentCitations(results, index) {

  let nbValues = parseInt(tableCount);
  let cpt = 0;
  results.forEach(res => {
    let found = false;
    for (var i = 0; i < nbValues - 1; i++) {
      cpt++;
      if (tableContent[i][1] === res.title.value) {
        tableContent[i][index] = res.count.value;
        found = true;
        break;
      }
    }

    if (!found) {
      let newRow = [];
      newRow.push(tableCount);
      newRow.push(res.title.value);
      newRow.push("0");

      /* First case is when we are settings citations for transcription
         Second case is when we are settings apparat citations, and when the person has not been
         cited in any letter */
      if (index === 3) {
        newRow.push(res.count.value);
        newRow.push("0");
      } else {
        newRow.push("0");
        newRow.push(res.count.value);
      }

      newRow.push(res.description.value);
      tableCount++;
      tableContent.push(newRow);
    }
  });

  $("#correspondentsTable").dataTable().fnClearTable();

  if (tableContent.length != 0) {
    localStorage.setItem('correspondentStorage', JSON.stringify(tableContent));
    $("#correspondentsTable").dataTable().fnAddData(tableContent);
    $("#correspondentsTable tr").css("cursor", "pointer");
  }

  if (index === 3) {
    getCorrespondentsCitations("ahpo:citeApparatName");
  }
}

