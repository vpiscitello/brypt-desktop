<template>
    <div class="context" >
        <div class="header">
            <i class="far fa-chart-network"></i>
            <h3>Data</h3>
        </div>
        <chart-container
            v-bind:id="'chart'"
            v-bind:ref="'chart'"
            v-bind:chart-data="chartData">
        </chart-container>
        <network-overview
            v-bind:id="'overview'"
            v-bind:ref="'overview'"
            v-bind:statistics="networkData">
        </network-overview>
    </div>
</template>

<script>
    import Spinner from '../Partials/Spinner'
    import ChartContainer from './ChartContainer'
    import NetworkOverview from './NetworkOverview'

    export default {
        name: 'data-context',
        components: { Spinner, ChartContainer, NetworkOverview },
        // components: {
        //     'spinner': Spinner,
        //     'chart-container': ChartContainer,
        //     'network-overview': NetworkOverview,
        // },
        props: {

        },
        data: function() {
            return {
                networkData: null,
                statistics: null,
                chartData: {
                    labels: [],
                    datasets: [{
                        label: 'Aggregate Readings',
                        pointColor: 'transparent',
                        pointStrokeColor: 'transparent',
                        pointHighlightFill: 'rgba(26, 204, 148, 1)',
                        pointHighlightStroke: 'rgba(126, 238, 203, 0.3)',
                        bezierCurve: true,
                        cubicInterpolationMode: 'monotone',
                        borderColor: 'rgb(126, 238, 203)',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointBackgroundColor: 'rgba(251, 251, 251, 0)',
                        pointBorderColor: 'rgba(251, 251, 251, 0)',
                        pointHoverRadius: 5,
                        pointBorderWidth: 9,
                        pointHoverBackgroundColor: 'rgba(251, 251, 251, 1)',
                        pointHoverBorderColor: 'rgba(251, 251, 251, 0.2)',
                        backgroundColor: 'rgba(126, 238, 203, 0.2)',
                        data: []
                    }]
                }
            };
        },
        computed: {

        },
        methods: {
            fetchNetworkData: function() {
                let networkData = {
                    aggReading: null,
                    avgReading: null,
                    nodeCount: null,
                    clusterCount: null,
                    attackCount: null,
                    uptime: null
                };

                // TODO: Fetch network data from the websocket

                // Create a new reading
                let reading = {
                    timestamp: new Date(),
                    data: (Math.random() * (72 - 68) + 68).toFixed(2)
                };

                networkData.aggReading = reading;
                networkData.avgReading = 68.34;
                networkData.nodeCount = 9;
                networkData.clusterCount = 2;
                networkData.attackCount = 15;
                networkData.uptime = (14 * 60 * 60) + (25 * 60);

                this.networkData = networkData;

                // Update the chart with the new network data
                this.$nextTick(() => {
                    this.pushAggReadingToChart();
                });
            },
            pushAggReadingToChart: function() {
                // Create a new chartData object to update the chart
                // Needs a new object otherwise vue-chartjs will not register the change correctly
                let chartData = {
                    labels: this.chartData.labels,
                    datasets: [{
                        label: 'Aggregate Readings',
                        pointColor: 'transparent',
                        pointStrokeColor: 'transparent',
                        pointHighlightFill: 'rgba(26, 204, 148, 1)',
                        pointHighlightStroke: 'rgba(126, 238, 203, 0.3)',
                        bezierCurve: true,
                        cubicInterpolationMode: 'monotone',
                        borderColor: 'rgb(126, 238, 203)',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointBackgroundColor: 'rgba(251, 251, 251, 0)',
                        pointBorderColor: 'rgba(251, 251, 251, 0)',
                        pointHoverRadius: 5,
                        pointBorderWidth: 9,
                        pointHoverBackgroundColor: 'rgba(251, 251, 251, 1)',
                        pointHoverBorderColor: 'rgba(251, 251, 251, 0.2)',
                        backgroundColor: this.$refs.chart.getBackgroundGradient(0),
                        data: this.chartData.datasets[0].data
                    }]
                };

                // Push the new label and data, chartjs-plugin-streaming will remove the items as they leave the chart
                chartData.labels.push(this.networkData.aggReading.timestamp);
                chartData.datasets[0].data.push(this.networkData.aggReading.data);

                this.chartData = chartData; // Update the bound chartData

            },
            updateStatistics: function() {

            }
        },
        created: function() {
            this.fetchNetworkData(); // Get initial data about the network
            this.$nextTick(() => {
                // Initiate an interval to fetch new network data every thirty seconds
                this.dataUpdateInterval = setInterval(() => this.fetchNetworkData(), 30 * 1000);
            });
        }
    }
</script>

<style scoped>

</style>
