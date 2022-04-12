var ctx;
var myChart = null;
var counts = [5,6];
var years = [];

prepareModalChart(1872, 1912);
renderChart();

$('#generateDistribution').on('click', function () {
    renderChart();
    
});

function prepareModalChart(min, max){
    years = [];
    for(var i = min; i<max; i++){
         years.push(i);
    }
 }

function renderChart(){
    if (myChart != null) {
        myChart.destroy();
    }
    
    ctx = document.getElementById('lettersChart').getContext('2d');

    myChart = new Chart("lettersChart", {
        type: 'bar',

        data: {
            labels: years,
            datasets: [{
                label: "Distribution",
                data: counts,
                backgroundColor: 'rgba(110, 211, 155, 0.5)',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

   
    myChart.render();
}