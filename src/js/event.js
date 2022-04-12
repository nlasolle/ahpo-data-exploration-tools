
$(document).ready(function(){
  
  getPersonsLabels();
  getTopicsLabels();
  $('#exportCSV').click(function(e) {
    downloadChartCSV(years, counts);
  });

});
