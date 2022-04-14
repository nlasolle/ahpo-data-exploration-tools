
$(document).ready(function () {

  $('#correspondentTable').DataTable({
    pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
    bFilter: true,
    autoWidth: false
  });

  $('#correspondentsTable tbody').on('click', 'tr', function () {

  });

  //Only active if one of the input fields have been filled
  $('#generatePersonDistribution').prop('disabled', true);
  $('#generateTopicDistribution').prop('disabled', true);

  getPersonsLabels();
  getTopicsLabels();
  getCorrespondentsStatistics();
  prepareModalChart(1872, 1912);
  getLettersData();
  getArticlesData();
  $('#personAutocompleteInput').val("");
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
    console.log(lettersChart.data.datasets);
    lettersChart.data.datasets.splice(1);
    console.log(lettersChart.data.datasets);
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

  $('#generateTopicDistribution').click(function (e) {
    /*We need to check the status of each input field
     Because we don't want to use the value 
     which is stored in selectedPerson var or selectedTopic var
     if the corresponding input field is empty */
    let topic = $('#personAutocompleteInput').val();

    if (topic != '') {
      updateTopicChart(selectedTopic);
    }
  });
});

function updateCorrespondentsTable(results) {

  var count = 1;
  var tableContent = [];
  var row;
  console.log(results);

  results.forEach(obj => {
    row = [];
    row.push(count);
    row.push(obj.title.value);
    row.push(obj.count.value);
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

