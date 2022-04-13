
$(document).ready(function () {

  //Only active if one of the input fields have been filled
  $('#generateDistribution').prop('disabled', true);

  getPersonsLabels();
  getTopicsLabels();
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
