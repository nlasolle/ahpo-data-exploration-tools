var ctx;
var lettersChart = null, articlesChart = null;
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
 function initDistributionData(description, bindings, type) {
    counts = [];

    years.forEach(year => {
        let binding = bindings.find(obj => {
            return parseInt(obj.year.value) === year;
        });

        if (binding) {
            counts.push(parseInt(binding.count.value));
        } else {
            counts.push(0);
        }
    });

    chartLabel = description;
    if(type === "letters"){
        renderLettersChart();
    } else if(type === "articles") {
        renderArticlesChart();
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
            counts.push(parseInt(binding.count.value));
        } else {
            counts.push(0);
        }
    });

    chartLabel = description;
    /**** Creating the new dataset ****/

    //Random bar colo generation
    var x = Math.floor(Math.random() * 256);
    var y = 100+ Math.floor(Math.random() * 256);
    var z = 50+ Math.floor(Math.random() * 256);

    //The dataset object, check chart.js doc for other attributes
    var newDataset = {
        label: description,
        backgroundColor: "rgb(" + x + "," + y + "," + z + ", 1)",
        borderWidth: 1,
        data: counts
    }

    // You add the newly created dataset to the list of `data`
    lettersChart.data.datasets.push(newDataset);

    // You update the chart to take into account the new dataset
    lettersChart.update();

}

function renderLettersChart() {
    if (lettersChart != null) {
        lettersChart.destroy();
    }

    ctx = document.getElementById('lettersChart').getContext('2d');

    lettersChart = new Chart("lettersChart", {
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


    lettersChart.render();
}

function renderArticlesChart() {
    if (articlesChart != null) {
        articlesChart.destroy();
    }

    ctx = document.getElementById('articlesChart').getContext('2d');

    articlesChart = new Chart("articlesChart", {
        type: 'bar',

        data: {
            labels: years,
            datasets: [{
                label: chartLabel,
                data: counts,
                backgroundColor: 'rgba(43, 45, 170, 0.6)',
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


    articlesChart.render();
}