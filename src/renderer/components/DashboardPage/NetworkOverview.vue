<template>
    <div id="overview">
        <section class="highlights">
            <div id="avg-reading" class="badge">
                <p class="data">{{ statistics.average | toFixed(2) }}°</p>
                <p class="label">Average Reading</p>
            </div>
            <div id="attack-count" class="badge">
                <p class="data">{{ attacks }}</p>
                <p class="label">Attempted Attacks</p>
            </div>
        </section>
        <section class="secondary">
            <div id="node-count" class="badge">
                <p class="data">{{ nodesCount }}</p>
                <p class="label">Connected Nodes</p>
            </div>
            <div id="cluster-count" class="badge">
                <p class="data">{{ clusters }}</p>
                <p class="label">Connected Clusters</p>
            </div>
            <div id="uptime" class="badge">
                <p class="data">{{ uptime | getSecondsPassedString }}</p>
                <p class="label">Network Uptime</p>
            </div>
        </section>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import Spinner from '../Partials/Spinner'

    export default {
        name: 'network-overview',
        components: { Spinner },
        props: {
            statistics: {
                type: Object,
                required: true
            }
        },
        data: function() {
            return {
                uptime: 0,
            };
        },
        computed: mapGetters(['nodesCount', 'clusters', 'attacks']),
        filters: {
            toFixed: function(number, places) {
                return number.toFixed(places);
            },
            getSecondsPassedString: function(seconds) {
                let str = '';
                if (seconds > 60 && seconds < 3600) {
                    str = parseFloat(seconds / 60).toFixed(2) + ' minutes';
                } else if (seconds >= 3600 && seconds < 86400) {
                    str = parseFloat(seconds / 3600).toFixed(2) + ' hours';
                } else if (seconds >= 86400 && seconds < 604800) {
                    str = parseFloat(seconds / 86400).toFixed(2) + ' days';
                } else if (seconds >= 604800) {
                    str = parseFloat(seconds / 604800).toFixed(2) + ' weeks';
                } else {
                    str = seconds + ' seconds';
                }
                return str;
            }
        },
        created: function() {

            setInterval(this.updateUptime, 1000);
        },
        methods: {
            updateUptime: function() {
                this.uptime++;
            }
        }
    }
</script>

<style scoped>

</style>
