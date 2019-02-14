<template>
    <div id="overview">
        <section class="highlights">
            <div id="avg-reading" class="badge">
                <p class="data">{{ statistics.avgReading }}°</p>
                <p class="label">Average Reading</p>
            </div>
            <div id="attack-count" class="badge">
                <p class="data">{{ statistics.attackCount }}</p>
                <p class="label">Attempted Attacks</p>
            </div>
        </section>
        <section class="secondary">
            <div id="node-count" class="badge">
                <p class="data">{{ statistics.nodeCount }}</p>
                <p class="label">Connected Nodes</p>
            </div>
            <div id="cluster-count" class="badge">
                <p class="data">{{ statistics.clusterCount }}</p>
                <p class="label">Connected Clusters</p>
            </div>
            <div id="uptime" class="badge">
                <p class="data">{{ statistics.uptime | getTimePassString }}</p>
                <p class="label">Network Uptime</p>
            </div>
        </section>
    </div>
</template>

<script>
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

            };
        },
        filters: {
            getTimePassString: function(timestamp) {
                let str = "";
                if (timestamp > 60 && timestamp < 3600) {
                    str = parseFloat(timestamp / 60).toFixed(2) + " minutes";
                } else if (timestamp > 3600 && timestamp < 86400) {
                    str = parseFloat(timestamp / 3600).toFixed(2) + " hours";
                } else if (timestamp > 86400 && timestamp < 604800) {
                    str = parseFloat(timestamp / 86400).toFixed(2) + " days";
                } else if (timestamp > 604800) {
                    str = parseFloat(timestamp / 604800).toFixed(2) + " weeks";
                } else {
                    str = timestamp + "seconds";
                }
                return str;
            }
        }
    }
</script>

<style scoped>

</style>
