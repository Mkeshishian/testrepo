
fetch('sales_data.json')
    .then(response => response.json())
    .then(data => {
        drawSalesChart(data);
        drawReceivablesChart(data);
        drawInvoicesChart(data);
        createPercentageTable(data);
        drawCustomerEngagementChart(data, "September");  // As an example
        drawRemoteUtilizationChart(data);
        drawInventoryChart(data);
        computeMetricsForMonth(data);

    });
const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


function drawSalesChart(data) {
    // Filter and separate data for each year
    const sales2022 = data.additionalData
        .filter(item => item.Year === 2022)
        .map(item => item.Sales);
    const sales2023 = data.additionalData
        .filter(item => item.Year === 2023)
        .map(item => item.Sales);

    const ctxSales = document.getElementById('sales-chart').getContext('2d');
    new Chart(ctxSales, {
        type: 'bar',
        data: {
            labels: data.additionalData.filter(item => item.Year === 2022).map(item => item.Month), // Assuming every year has all the months listed
            datasets: [{
                label: '2022 Sales',
                data: sales2022,
                backgroundColor: 'rgba(99, 132, 255, 0.5)',
                borderColor: 'rgba(99, 132, 255, 1)',
                borderWidth: 1
            },
            {
                label: '2023 Sales',
                data: sales2023,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        }
    });
}

function drawInvoicesChart(data) {
    if (!data || !data.additionalData) {
        console.error("Data structure is not as expected", data);
        return;
    }

    const invoices2022 = data.additionalData
        .filter(item => item.Year === 2022)
        .map(item => item.Invoices); // Ensure "Invoices" is the correct property name in your data

    const invoices2023 = data.additionalData
        .filter(item => item.Year === 2023)
        .map(item => item.Invoices); // Ensure "Invoices" is the correct property name in your data

    // Logging to check our extracted values
    console.log("Invoices 2022:", invoices2022);
    console.log("Invoices 2023:", invoices2023);

    const invoicesDatasets = [{
        label: '2022 Invoices',
        data: invoices2022,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
    },
    {
        label: '2023 Invoices',
        data: invoices2023,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
    }];

    const ctxInvoices = document.getElementById('invoices-chart').getContext('2d');
    new Chart(ctxInvoices, {
        type: 'bar',
        data: {
            labels: allMonths, // Ensure "allMonths" is defined at the top of your file
            datasets: invoicesDatasets
        }
    });
}


function drawReceivablesChart(data) {
    if (!data || !data.additionalData) {
        console.error("Data structure is not as expected", data);
        return;
    }

    const receivables2022 = data.additionalData
        .filter(item => item.Year === 2022)
        .map(item => item.Receivables);

    const receivables2023 = data.additionalData
        .filter(item => item.Year === 2023)
        .map(item => item.Receivables);

    // Logging to check our extracted values
    console.log("Receivables 2022:", receivables2022);
    console.log("Receivables 2023:", receivables2023);

    const receivablesDatasets = [{
        label: '2022 Receivables',
        data: receivables2022,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
    },
    {
        label: '2023 Receivables',
        data: receivables2023,
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
    }];

    const ctxReceivables = document.getElementById('receivables-chart').getContext('2d');
    new Chart(ctxReceivables, {
        type: 'bar',
        data: {
            labels: allMonths, // This should be defined at the top of your file
            datasets: receivablesDatasets
        }
    });
}


function createPercentageTable(data) {
    const formatNumberWithCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const sales2022 = data.additionalData
        .filter(item => item.Year === 2022)
        .map(item => item.Sales);

    const sales2023 = data.additionalData
        .filter(item => item.Year === 2023)
        .map(item => item.Sales);

    const table = document.getElementById('percentage-table');

    // Creating headers
    const tableHeaders = ["Month", "2022 Sales", "2023 Sales", "Percentage Change"];
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    tableHeaders.forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        headerRow.appendChild(th);
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    // Creating body
    const tableBody = document.createElement('tbody');
    table.appendChild(tableBody);

    // Rows for each month
    for (let i = 0; i < allMonths.length; i++) {
        const row = document.createElement('tr');
        ["Month", sales2022[i], sales2023[i]].forEach((cellData, idx) => {
            const td = document.createElement('td');
            if (idx === 0) td.innerText = allMonths[i];
            else if (idx === 1 || (idx === 2 && typeof cellData !== 'undefined')) td.innerText = "$" + formatNumberWithCommas(cellData.toFixed(2));
            else td.innerText = 'N/A';
            row.appendChild(td);
        });

        const percentageCell = document.createElement('td');
        if (sales2022[i] && sales2023 && sales2023[i]) {
            const change = ((sales2023[i] - sales2022[i]) / sales2022[i]) * 100;
            percentageCell.innerText = change.toFixed(2) + '%';
            percentageCell.classList.add(change > 0 ? "percentage-positive" : "percentage-negative");
        } else {
            percentageCell.innerText = 'N/A';
        }
        row.appendChild(percentageCell);
        tableBody.appendChild(row);
    }

    // Prediction row
    const predictionRow = document.createElement('tr');
    tableBody.appendChild(predictionRow);

    const total2022Sales = sales2022.reduce((a, b) => a + b, 0);
    const average2023Sales = sales2023.reduce((a, b) => a + b, 0) / (sales2023.length || 1);
    const predicted2023Sales = sales2023.length === 12 ? sales2023.reduce((a, b) => a + b, 0) : average2023Sales * 12;

    const predictionChange = ((predicted2023Sales - total2022Sales) / total2022Sales) * 100;
    ["Prediction", "$" + formatNumberWithCommas(total2022Sales.toFixed(2)), "$" + formatNumberWithCommas(predicted2023Sales.toFixed(2)), predictionChange.toFixed(2) + "%"].forEach((text, idx) => {
        const td = document.createElement('td');
        td.innerText = text;
        if (idx === 3) {
            td.classList.add(predictionChange > 0 ? "percentage-positive" : "percentage-negative");
        }
        predictionRow.appendChild(td);
    });

    // Average row
    const avgRow = document.createElement('tr');
    ["Average", "$" + formatNumberWithCommas((total2022Sales / 12).toFixed(2)), "$" + formatNumberWithCommas(average2023Sales.toFixed(2)), ""].forEach(text => {
        const td = document.createElement('td');
        td.innerText = text;
        avgRow.appendChild(td);
    });
    tableBody.appendChild(avgRow);

    // Total row
    const footer = document.createElement('tfoot');
    const footerRow = document.createElement('tr');
    footer.appendChild(footerRow);
    table.appendChild(footer);

    const total2023Sales = sales2023.reduce((a, b) => a + b, 0);
    const totalPercentageChange = ((total2023Sales - total2022Sales) / total2022Sales) * 100;

    ["Total", "$" + formatNumberWithCommas(total2022Sales.toFixed(2)), "$" + formatNumberWithCommas(total2023Sales.toFixed(2)), totalPercentageChange.toFixed(2) + "%"].forEach((text, idx) => {
        const td = document.createElement('td');
        td.innerText = text;
        td.style.fontWeight = "bold"; // Make the total row bold
        if (idx === 3) {
            td.classList.add(totalPercentageChange > 0 ? "percentage-positive" : "percentage-negative");
        }
        footerRow.appendChild(td);
    });
}
function drawCustomerEngagementChart(data, chosenMonth) {
    const monthData = data.additionalData.find(entry => entry.Month === chosenMonth && entry.Year === data.chosenYear);

    if (!monthData) {
        console.error("Data for the chosen month and year not found!");
        return;
    }

    const nonEngagedCustomers = monthData.NonEngaged;
    const longInactiveCustomers = monthData.LongInactive;

    const ctxCustomerEngagement = document.getElementById('customer-engagement-chart').getContext('2d');
    const chart = new Chart(ctxCustomerEngagement, {
        type: 'pie',
        data: {
            labels: ['Inactive Customers', 'Inactive Customers (3+ years)'],
            datasets: [{
                data: [nonEngagedCustomers, longInactiveCustomers],
                backgroundColor: [
                    'rgba(128, 216, 255, 0.6)',
                    'rgba(171, 71, 188, 0.6)'
                ],
                borderColor: [
                    'rgba(128, 216, 255, 1)',
                    'rgba(171, 71, 188, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 100
                    }
                }
            }
        }
    });

    // Custom logic to add text under the legend
    const legendContainer = document.getElementById('customer-engagement-legend');
    legendContainer.innerHTML = `
        <ul>
            <li><span style="color:rgba(128, 216, 255, 1)">●</span> Inactive Customers: ${nonEngagedCustomers}</li>
            <li><span style="color:rgba(171, 71, 188, 1)">●</span> Inactive Customers (3+ years): ${longInactiveCustomers}</li>
        </ul>
    `;

    return chart;
}

function drawInventoryChart(data) {
    const monthlyData = data.additionalData.find(record => record.Month === data.chosenMonth && record.Year === data.chosenYear);

    if (!monthlyData) {
        console.error("Data for the chosen month and year not found.");
        return;
    }

    const soldItems = monthlyData.SoldItems;
    const idleItems = monthlyData.Items - soldItems;

   const ctxInventory = document.getElementById('inventory-chart').getContext('2d');

    const chart = new Chart(ctxInventory, {
        type: 'pie',
        data: {
            labels: ['Sold Items', 'Idle Items'],
            datasets: [{
                data: [soldItems, idleItems],
                backgroundColor: ['#64B5F6', '#FFAB91'],
                borderColor: ['#2196F3', '#FF7043'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 10,
                }
            }
        }
    });

    // Custom logic to add text under the legend
    const legendContainer = document.getElementById('inventory-legend');
    legendContainer.innerHTML = `
        <ul>
            <li><span style="color:#64B5F6">●</span> Sold Items: ${soldItems}</li>
            <li><span style="color:#FFAB91">●</span> Idle Items: ${idleItems}</li>
        </ul>
    `;

    return chart; // To enable destroying this chart later
}


function drawRemoteUtilizationChart(data) {
    // Filter the data for the chosen year
    const yearlyData = data.additionalData.filter(record => record.Year === data.chosenYear);

    // Extract months and remote users for the chosen year
    const months = yearlyData.map(record => record.Month);
    const remoteUsers = yearlyData.map(record => record.RemoteUsers);

    const ctxRemoteUtilization = document.getElementById('remote-utilization-chart').getContext('2d');
    new Chart(ctxRemoteUtilization, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Customer Count Who Used Remote',
                data: remoteUsers,
                backgroundColor: '#ADD8E6'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
function computeMetricsForMonth(data) {
    console.log("Chosen month:", data.chosenMonth);  // Debugging line
    console.log("First few data entries:", data.additionalData.slice(0, 5));  // Debugging line

    // Accessing the correct capitalized fields for Year and Month
    const monthlyData2022 = data.additionalData.find(record => record.Year === 2022 && record.Month === data.chosenMonth);
    const monthlyData2023 = data.additionalData.find(record => record.Year === 2023 && record.Month === data.chosenMonth);

    if (!monthlyData2022 || !monthlyData2023) {
        console.error("Data missing for the chosen month in either 2022 or 2023");
        return;
    }

    // Calculate Average Invoice for the selected month in 2022
    const averageInvoice2022 = monthlyData2022.Sales / monthlyData2022.Invoices;

    // Calculate Average Invoice for the selected month in 2023
    const averageInvoice2023 = monthlyData2023.Sales / monthlyData2023.Invoices;

    // Display Average Invoice values
    document.getElementById('average-invoice-2022').textContent = `$${averageInvoice2022.toFixed(2)}`;
    document.getElementById('average-invoice-2023').textContent = `$${averageInvoice2023.toFixed(2)}`;

    // Calculate CR Ratio for the selected month in 2022
    const crRatio2022 = monthlyData2022.Receivables / monthlyData2022.Sales;

    // Calculate CR Ratio for the selected month in 2023
    const crRatio2023 = monthlyData2023.Receivables / monthlyData2023.Sales;

    // Display CR Ratio values
    document.getElementById('cr-ratio-2022').textContent = crRatio2022.toFixed(2);
    document.getElementById('cr-ratio-2023').textContent = crRatio2023.toFixed(2);
}


