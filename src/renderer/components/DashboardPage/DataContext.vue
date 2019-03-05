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
            v-bind:statistics="statistics">
        </network-overview>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import Spinner from '../Partials/Spinner'
    import ChartContainer from './ChartContainer'
    import NetworkOverview from './NetworkOverview'

    function indexOfObject(obj, arr) {
        for (let idx = 0; idx < arr.length; idx++) {
            if (obj.uid == arr[idx].uid) {
                return idx;
            }
        }
        return -1;
    }

    export default {
        name: 'data-context',
        components: { Spinner, ChartContainer, NetworkOverview },
        props: {
            readings: {
                type: Object,
                required: false
            }
        },
        data: function() {
            return {
                cycle: {
                    round: 0,
                    average: 0,
                    collected: 0,
                    timestamp: null,
                },
                statistics: {
                    rounds: 0,
                    average: 0,
                    collected: 0,
                },
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
        computed: mapGetters(['nodes', 'nodesCount', 'node', 'clusters', 'attacks']),
        watch: {
            readings: function (obj) {
                this.parseNetworkReadings(() => {
                    this.pushAggReadingToChart();
                });
            }
        },
        created: function() {

        },
        methods: {
            parseNetworkReadings: function(callback) {
                let cycleEntries = Object.entries(this.readings);
                let cycleAverage = 0;

                this.cycle.round += 1;
                this.cycle.collected = cycleEntries.length;
                this.cycle.timestamp = new Date();

                this.statistics.rounds = this.cycle.round;
                this.statistics.collected += cycleEntries.length;

                console.log('On cycle', this.cycle.round, 'there have been', this.statistics.collected, 'collected.');

                // Find missing data to increment irregularity rate
                // Reduimentary method of seeing which nodes did not respond to the request either by being blocked
                // or failed decryption/verification.
                cycleEntries.forEach(([key, value]) => {
                    console.log(key, '->', value);
                    cycleAverage += value['reading'];
                });

                cycleAverage /= cycleEntries.length;

                console.log('The average reading for this round is', cycleAverage);
                this.cycle.average = cycleAverage;

                if(this.statistics.average === 0) {
                    this.statistics.average = this.cycle.average;
                } else {
                    let prev_count = this.statistics.rounds - 1;
                    let numerator = (prev_count * this.statistics.average) + this.cycle.average;
                    this.statistics.average = numerator / this.statistics.rounds;
                    this.statistics.average = this.statistics.average;
                    console.log(prev_count, numerator, this.statistics.average);
                }

                callback();
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
                chartData.labels.push(this.cycle.timestamp);
                chartData.datasets[0].data.push(this.cycle.average.toFixed(2));

                this.chartData = chartData; // Update the bound chartData

            },
            updateStatistics: function() {

            }
        }
    }
</script>

<style scoped>

</style>
