// Initialize charts
let mainChart;
let pieChart;

// Function to initialize charts
function initializeCharts() {
    const mainCtx = document.getElementById('mainChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    mainChart = new Chart(mainCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Values Over Time',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Sales', 'Expenses', 'Profit'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Function to update charts
function updateCharts(data) {
    // Update line chart
    mainChart.data.labels = data.map(item => item.timestamp);
    mainChart.data.datasets[0].data = data.map(item => item.value);
    mainChart.update();

    // Update pie chart
    const categoryTotals = {
        sales: 0,
        expenses: 0,
        profit: 0
    };

    data.forEach(item => {
        categoryTotals[item.category] += parseFloat(item.value);
    });

    pieChart.data.datasets[0].data = Object.values(categoryTotals);
    pieChart.update();
}

// Handle form submission
document.getElementById('dataForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        value: parseFloat(document.getElementById('value').value),
        category: document.getElementById('category').value
    };

    try {
        const response = await fetch('/add_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Clear form
            document.getElementById('dataForm').reset();
            
            // Fetch updated data and refresh charts
            fetchData();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to fetch data
async function fetchData() {
    try {
        const response = await fetch('/get_data');
        const data = await response.json();
        updateCharts(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    fetchData();
});
