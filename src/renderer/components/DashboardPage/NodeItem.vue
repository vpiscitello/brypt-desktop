<template>
    <div class="nd-item" v-bind:class="{ warning: irregular }" @click.prevent.stop="handleClick($event, node)">
        <div class="header">
            <div class="icon"><i class="fas fa-atom"></i></div>
            <h4><span class="dim">{{ zeroPad }}</span>{{ node.id }}</h4>
        </div>
        <div class="content">
            <div class="col">
                <p class="label">Designation</p>
                <p class="data">{{ node.designation }}</p>
            </div>
            <div class="col">
                <p class="label">Communication Technologies</p>
                <p class="data">{{ node.comm_techs | arrayToString }}</p>
            </div>
            <div class="col">
                <p class="label">Irregularity Rate</p>
                <p class="data">{{ node.ireg_rate }}</p>
            </div>
            <div class="col">
                <p class="label">Date Added</p>
                <p class="data">{{ node.add_timestamp | toTimeString }}</p>
            </div>
        </div>
        <div class="footer">
            <button class="sc" type="button" name="expand">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'node-item',
        props: {
            node: {
                type: Object,
                required: true,
                validator: function(node) {
                    return (
                        typeof node.id === "number" &&
                        typeof node.cluster === "number" &&
                        typeof node.coordinator === "number" &&
                        typeof node.neighbor_count === "number" &&
                        typeof node.designation === "string" &&
                        typeof node.comm_techs === "object" &&
                        typeof node.add_timestamp === "number" &&
                        typeof node.update_timestamp === "number" &&
                        typeof node.ireg_rate === "number"
                    );
                }
            }
        },
        data: function() {
            return {

            };
        },
        computed: {
            // Defines whether or not the node exhibits abnormal behavior on the network
            irregular: function() {
                return this.node.ireg_rate > 0.25;
            },
            // The left zero pading for the node ID
            zeroPad: function() {
                let zeros = "0000";
                // Make a subtring the ensure all IDs are aligned on four characters
                return zeros.substring(0, zeros.length - ("" + this.node.id).length);
            }
        },
        filters: {
            toTimeString: function(timestamp) {
                let date = new Date(timestamp * 1000); // Convert the provided timestamp to a Date object
                // Return a Locale Date string in the format Month Day, Year, Hour:Minute
                return date.toLocaleString(window.navigator.language, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                });
            },
            arrayToString: function(arr) {
                return arr.join(", "); // Join an array seperated by ", " i.e. "1, 2, 3"
            },
            capitalize: function(str) {
                return str.charAt(0).toUpperCase() + str.slice(1); // Capitalize the first letter of a string
            }
        },
        methods: {
            handleClick: function(event, node) {
                // Send an event to the root listener about a click on the item
                this.$root.$emit("item-action-menu-triggered", {
                    event: event,
                    node: node
                });
            }
        }
    }
</script>

<style scoped>

</style>
