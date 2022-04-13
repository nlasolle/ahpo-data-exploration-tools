var ctx;
var distributionChart = null;
var counts = [];
var years = [];
var chartLabel = "Distribution de l'ensemble des lettres de la correspondance";


function prepareModalChart(min, max) {
    years = [];
    for (var i = min; i <= max; i++) {
        years.push(i);
    }
}

/**
 * Prepare chart data
 * @param {String} description  The chart description
 * @param {*} bindings the SPARQL query bindings (letters count + year for each row)
 */
function createDistributionData(description, bindings) {
    counts = [];

    years.forEach(year => {
        let binding = bindings.find(obj => {
            return parseInt(obj.year.value) === year;
        });

        if (binding) {
            counts.push(parseInt(binding.lettersCount.value));
        } else {
            counts.push(0);
        }
    });

    chartLabel = description;
    renderChart();
}

function renderChart() {
    if (distributionChart != null) {
        distributionChart.destroy();
    }

    ctx = document.getElementById('lettersChart').getContext('2d');

    distributionChart = new Chart("lettersChart", {
        type: 'bar',

        data: {
            labels: years,
            datasets: [{
                label: chartLabel,
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


    distributionChart.render();
}