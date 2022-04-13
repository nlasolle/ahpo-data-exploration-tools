
$(document).ready(function () {
  $('#correspondentTable').DataTable({
    pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
    bFilter: true,
    autoWidth: false,
    class: "display"
  });

  $('#correspondentsTable tbody').on('click', 'tr', function () {
    
  });

  //Only active if one of the input fields have been filled
  $('#generateDistribution').prop('disabled', true);

  getPersonsLabels();
  getTopicsLabels();
  getCorrespondentsStatistics();
  prepareModalChart(1872, 1912);
  getInitialChartData();
  $('#personAutocompleteInput').val("");
  $('#topicAutocompleteInput').val("");

  $('#exportCSV').click(function (e) {
    downloadChartCSV(years, counts);
  });

  $('#exportPNG').click(function (e) {
    //Get the png
    var a = document.createElement('a');
    a.href = distributionChart.toBase64Image();
    a.download = "charts_distribution_" + getFormattedDate() + ".png";
    a.click();
  });


  $('#generateDistribution').click(function (e) {
    /*We need to check the status of each input field
     Because we don't want to use the value 
     which is stored in selectedPerson var or selectedTopic var
     if the corresponding input field is empty */
    let person = $('#personAutocompleteInput').val();
    let topic = $('#topicAutocompleteInput').val();

    if (person != '') {
      if (topic != '') {
        updateCombinedChart(selectedPerson, selectedTopic);
      } else {
        updatePersonChart(selectedPerson);
      }
    } else if (topic != '') {
      updateTopicChart(selectedTopic);
    } else {
      getInitialChartData();
    }
  });
});

function updateCorrespondentTable(results) {

  var count = 1;
  var tableContent = [];
  var row;
  console.log(results);

  results.forEach(obj => {
    row = [];
    row.push(count);
    row.push(obj.title.value);
    row.push(obj.lettersCount.value);
    row.push(obj.description.value);

    count++;
    tableContent.push(row);
  });


  $("#correspondentsTable").dataTable().fnClearTable();

  if (tableContent.length != 0) {
    $("#correspondentsTable").dataTable().fnAddData(tableContent);
    $("#correspondentsTable tr").css("cursor", "pointer");
  }
}

