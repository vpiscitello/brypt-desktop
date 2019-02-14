<script>
    import VueChartJs from 'vue-chartjs';
    import 'chartjs-plugin-streaming';

    function CustomTooltip(tooltipModel) {
        var tooltipEl = document.getElementById('chartjs-tooltip');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = "<table></table>";
            document.body.appendChild(tooltipEl);
        }

        if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
            return bodyItem.lines;
        }

        if (tooltipModel.body) {
            var titleLines = tooltipModel.title || [];
            var bodyLines = tooltipModel.body.map(getBody);

            var innerHtml = '<tbody>';
            titleLines.forEach(function(title) {
                innerHtml += '<tr><th>' + title + '</th></tr>';
            });
            innerHtml += '</tbody>';

            var tableRoot = tooltipEl.querySelector('table');
            tableRoot.innerHTML = innerHtml;
        }

        var position = this._chart.canvas.getBoundingClientRect();


        tooltipEl.style.opacity = 1;
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX - (tooltipEl.offsetWidth /
                2) +
            'px';
        tooltipEl.style.top = position.bottom + window.pageYOffset - 50 + 'px';
        tooltipEl.style.color = '#FBFBFB';
        tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
        tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
        tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
        tooltipEl.style.padding = 4 + 'px ' + 4 + 'px';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.backgroundColor = '#1E1E1E';
        tooltipEl.style.borderRadius = 5 + 'px';
    }

    Chart.defaults.LineWithLine = Chart.defaults.line;

    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
        draw: function(ease) {
            Chart.controllers.line.prototype.draw.call(this, ease);

            if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                let activePoint = this.chart.tooltip._active[0],
                    ctx = this.chart.ctx,
                    x = activePoint.tooltipPosition().x,
                    topY = this.chart.scales['y-axis-0'].top,
                    bottomY = this.chart.scales['y-axis-0'].bottom;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(251, 251, 251, 0.2)';
                ctx.stroke();
                ctx.restore();
            }
        }
    });

    const LineWithLine = VueChartJs.generateChart('custom-line', 'LineWithLine');

    export default {
        // template: '#chart-template',
        name: 'chart-container',
        extends: LineWithLine,
        mixins: [VueChartJs.mixins.reactiveProp],
        data: function() {
            return {
                gradients: null,
                options: {
                    reactive: true,
                    responsive: true,
                    maintainAspectRatio: false,
                    defaultFontFamily: Chart.defaults.global.defaultFontFamily = 'Source Sans Pro',
                    scales: {
                        yAxes: [{
                            ticks: {
                                display: true,
                                fontColor: '#60777F',
                                fontSize: 12,
                            },
                            gridLines: {
                                display: true,
                                color: 'rgba(96, 119, 128, 0.1)'
                            },
                            scaleLabel: {
                                display: false,
                                labelString: 'Reading',
                                fontColor: '#60777F',
                                fontSize: 14
                            }
                        }],
                        xAxes: [{
                            type: 'realtime',
                            time: {
                                displayFormats: {
                                    second: 'h:mm:ss A',
                                }
                            },
                            realtime: {
                                duration: 150000, // Show 10 30 second datapoints
                                // refresh: 30000, // refresh every 30 seconds
                                delay: 30000, // Delay of the show
                                onRefresh: function(chart) {

                                }

                            },
                            ticks: {
                                display: true,
                                fontColor: '#60777F',
                                fontSize: 12
                            },
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Timestamp',
                                fontColor: 'rgba(251, 251, 251, 0.6)',
                                fontSize: 13
                            }
                        }]
                    },
                    legend: {
                        display: true,
                        labels: {
                            boxWidth: 0,
                            fontColor: 'rgba(251, 251, 251, 0.6)',
                            // fontStyle: 'bold',
                            fontSize: 14
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.2
                        }
                    },
                    hover: {
                        intersect: false
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        position: 'nearest',
                        titleFontSize: 0,
                        titleSpacing: 0,
                        titleMarginBottom: 0,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems, data) {
                                return tooltipItems[0].xLabel.toLocaleString(window.navigator.language, {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true
                                });
                            },
                            label: function(tooltipItem, data) {
                                return 'Reading: ' + tooltipItem.yLabel + '°';
                            }
                        },
                        custom: CustomTooltip
                    },
                    plugins: {
                        streaming: {
                            frameRate: 30
                        }
                    }
                }
            };
        },
        methods: {
            getBackgroundGradient: function(idx) {
                return this.gradients[idx];
            }
        },
        watch: {
            chartData: function() {
                this.$data._chart.update();
            }
        },
        mounted: function() {
            this.gradients = [];
            let gradient = this.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450);
            gradient.addColorStop(0, 'rgba(26, 204, 148, 0.6)');
            gradient.addColorStop(0.55, 'rgba(126, 238, 203, 0)');
            this.gradients.push(gradient);

            this.renderChart(this.chartData, this.options);
        },
        updated: function() {

        }
    };
</script>

<style scoped>

</style>
