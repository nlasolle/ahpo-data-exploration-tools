
function convertJSONArrayToCSV(args) {
    var result, ctr, keys, propertiesKeys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);
    keys = keys.filter(item => item !== "conditions" && item !== "properties");
    propertiesKeys = Object.keys(data[0].properties);

    result = '';
    result += keys.join(columnDelimiter);
    result += columnDelimiter + propertiesKeys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
        ctr = 0;
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key].replaceAll('\n', '');
            ctr++;
        });

        var propertiesValues = item.properties;
        propertiesKeys.forEach(function (propertyKey) {
            result += columnDelimiter;
            if (propertiesValues[propertyKey]) {
                result += '"' + propertiesValues[propertyKey].replaceAll(',', ';').replaceAll('\n', '') + '"';
            }

        });
        console.log(result);
        result += lineDelimiter;
    });
    console.log(result);
    return result;
}

function downloadChartCSV(years, counts) {
    var data = "",
        link,
        columnSeparator = ','
    lineDelimiter = '\n';


    for (i in years) {
        data += years[i] + columnSeparator + counts[i] + lineDelimiter;
    }

    var title = "charts_distribution_" + getFormattedDate() + ".csv";

    if (!data.match(/^data:text\/csv/i)) {
        data = 'data:text/csv;charset=utf-8,' + data;
    }

    data = encodeURI(data);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', title);
    link.click();
}

function getFormattedDate() {
    const now = new Date(Date.now());

    var month = now.getMonth().toString();
    if (month.length == 1) {
        month = "0" + month;
    }

    var day = now.getDay().toString();

    if (day.length == 1) {
        day = "0" + day;
    }

    var hours = now.getHours().toString();
    if (hours.length == 1) {
        hours = "0" + hours;
    }

    var minutes = now.getMinutes().toString();
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }

    return now.getFullYear() + month + day + "_" + hours + minutes;
}

/**
 * Save the content of the generated SPARQL query to a text file
 */
function downloadSPARQLInputContent(element) {

    var content = element.getValue();
    var link = document.createElement('a');
    mimeType = 'text/plain';

    link.setAttribute('download', "sparql_query_" + getFormattedDate() + ".txt");
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
    link.click();
}