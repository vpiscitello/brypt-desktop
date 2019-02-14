<template>
    <transition name="pop-open">
        <div v-bind:id="id" v-if="show" v-click-outside="onClickOutside">
            <div class="context">
                <div class="header">
                    <div class="indentification">
                        <h3>Node: <span id="deviceID">{{ node.id }}</span></h3>
                        <p class="data">Designation: <span>{{ node.designation }}</span></p>
                    </div>
                    <div class="updated">
                        <p class="data">Last Update: <span>{{ node.update_timestamp | toTimeString }}</span></p>
                    </div>
                </div>
                <div class="content">
                    <div class="details">
                        <div class="col">
                            <p class="data">Et ultrices neque ornare aenean euismod elementum nisi.</p>
                            <p class="label">Description</p>
                        </div>
                        <div class="col">
                            <p class="data">{{ node.cluster }}</p>
                            <p class="label">Cluster</p>
                        </div>
                        <div class="col">
                            <p class="data">{{ node.neighbor_count }}</p>
                            <p class="label">Neighbors</p>
                        </div>
                        <div class="col">
                            <p class="data">{{ node.comm_techs | arrayToString }}</p>
                            <p class="label">Communication Technologies</p>
                        </div>
                        <div class="col">
                            <p class="data">{{ node.add_timestamp | toTimeString }}</p>
                            <p class="label">Date Added</p>
                        </div>
                    </div>
                    <div class="stats">
                        <div class="col">
                            <p class="data" v-bind:class="{ warning: irregular }">{{ node.ireg_rate | toPercentage }}</p>
                            <p class="label">Irregularity Rate</p>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <button class="danger" type="button" name="delete" v-on:click="removeDevice">
                        <h4>Remove Device</h4>
                    </button>
                    <button class="" type="button" name="edit" v-on:click="editDevice">
                        <h4>Edit Details</h4>
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'node-detail',
        props: {
            id: {
                type: String,
                required: true
            }
        },
        data: function() {
            return {
                show: false,
                node: null // The node the detail modal is providing more information on
            };
        },
        computed: {
            // Defines whether or not the node exhibits abnormal behavior on the network
            irregular: function() {
                return this.node.ireg_rate > 0.25;
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
            toPercentage: function(rate) {
                return parseFloat(rate * 100).toFixed(1) + "%";
            }
        },
        methods: {
            showModal: function(node) {
                // console.log("Show Detail");
                this.node = node; // Store the node being operated on
                this.show = true;
            },
            hideModal: function() {
                // console.log("Hide Detail");
                this.show = false;
            },
            removeDevice: function() {
                console.log("Remove Node ", this.node.id, "From the User's Network.");
                // Launch Confirmation Modal
                // Send Remove Request for the node to the Network
                // Fetch the updated cluster
                alert("Sorry, this functionality is not yet available!");
            },
            editDevice: function() {
                console.log("Edit the details of Node ", this.node.id);
                // Launch Edit Modal
                alert("Sorry, this functionality is not yet available!");
            },
            toggleShow: function() {
                this.show = !this.show;
            },
            onClickOutside: function() {
                this.hideModal();
            }
        }
    }
</script>

<style scoped>

</style>
