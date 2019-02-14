<template>
    <div class="context" >
        <div class="header">
            <i class="far fa-cubes"></i>
            <h3>Clusters</h3>
        </div>
        <node-container
            v-bind:id="'coordinators'"
            title="Coordinators"
            v-bind:nodes="coordinators"
            v-bind:needSpinner="false"
            v-bind:ref="'coordinators'">
        </node-container>
        <node-container
            v-bind:id="'neighbors'"
            title="Neighbors"
            v-bind:nodes="neighbors"
            v-bind:needSpinner="true"
            v-bind:ref="'neighbors'">
        </node-container>
        <item-context-menu
            v-bind:id="'item-action-menu'"
            v-bind:options="actionMenuOptions"
            v-bind:ref="'itemActionMenu'"
            v-on:expand-cluster="expandCluster"
            v-on:open-detail="openDetail">
       </item-context-menu>
        <node-detail
            v-bind:id="'node-detail'"
            v-bind:ref="'detailModal'">
        </node-detail>
    </div>
</template>

<script>
    import Spinner from '../Partials/Spinner'
    import ItemContextMenu from './ItemContextMenu'
    import NodeContainer from './NodeContainer'
    import NodeDetail from './NodeDetail'

    function indexOfObject(obj, arr) {
        for (let idx = 0; idx < arr.length; idx++) {
            if (obj.id == arr[idx].id) {
                return idx;
            }
        }
        return -1;
    }

    export default {
        name: 'cluster-context',
        components: { Spinner, ItemContextMenu, NodeContainer, NodeDetail },
        props: {

        },
        data: function() {
            return {
                coordinators: null, // The array of coordinators for the cluster
                neighbors: null // The array of neighbors to the cluster coordinator
            };
        },
        computed: {
            // Possible action menu options for the clusters
            actionMenuOptions: function() {
                let options = [];
                // option: {
                //     name: String,    // The name of the option for the user
                //     call: String,    // The function to be called upon selecting the option
                //     event: String,   // The event to trigger upon selecting the option
                //     requiresCordinator: Boolean  // A boolean value for whether or not the option needs a branching node
                // }
                // Push an option to open the node detail modal
                options.push({
                    name: "Open Detail",
                    call: "openDetail",
                    event: "open-detail",
                    requiresCordinator: false
                });
                // Push an option to expand (fetch) the neighbors of a coordinator
                options.push({
                    name: "Expand Cluster",
                    call: "expandCluster",
                    event: "expand-cluster",
                    requiresCordinator: true
                });
                return options;
            }
        },
        methods: {
            pushClusterCoordinator: function(node) {

                // Ensure a node to push has been provided
                if (node === null) {
                    return;
                }

                let coordinators = []; // Intialize an empty array to store the coordinators
                let coordinatorStore = sessionStorage.getItem("coordinators"); // Read SessionStorage for stored coordinators

                // If there is comething in the Store parse the contents
                if (typeof coordinatorStore === "string") {
                    coordinators = JSON.parse(coordinatorStore);
                }

                // Check if the node being pushed is in the array
                if (indexOfObject(node, coordinators) == -1) {
                    coordinators.push(node); // Push the node into the coordinators array
                    sessionStorage.setItem("coordinators", JSON.stringify(coordinators)); // Store the updated coordinators in SessionStorage
                }

                this.coordinators = coordinators; // Update the components data with the coordinator data

            },
            popClusterCoordinator: function() {
                this.coordinators.pop(); // Pop the last coordinator in the array
                sessionStorage.setItem("coordinators", JSON.stringify(this.coordinators)); // Store the updated coordinators in SessionStorage
            },
            fetchClusterTable: function(node) {

                // Ensure a node has been provided
                if (node === null) {
                    return;
                }

                // Ensure the node is a branch
                if (node.designation == "node") {
                    return;
                }

                let neighbors = Object;

                // Temp for the hardcoded cluster
                switch (node.id) {
                    case 1:
                        {
                            console.log("Root Cluster");
                            neighbors = rootCluster.neighbors;
                            break;
                        }
                    case 4:
                        {
                            console.log("SubCluster Query");
                            neighbors = subCluster.neighbors;
                            break;
                        }
                    default:
                        {
                            console.log("No Cluster Exists for Coordinator");
                            break;
                        }
                }

                sessionStorage.setItem("neighbors", JSON.stringify(neighbors)); // Store the the neighbors in the SessionStorage in case of page reload
                this.neighbors = neighbors;

            },
            expandCluster: function(node) {
                console.log("Expand Cluster using: ", node.id);

                // Toggle loading state for coordinators and neighbors
                this.$refs.coordinators.toggleLoader();
                this.$refs.neighbors.toggleLoader();

                let cordIndex = indexOfObject(node, this.coordinators); // Attempt to find the node in the array of coordinators
                // If the node is not in the coordinators push it
                // Otherwise pop all nodes up to its location
                if (cordIndex == -1) {
                    this.pushClusterCoordinator(node);
                } else {
                    // Pop each node until the request coordinator
                    for (let idx = this.coordinators.length - 1; idx > cordIndex; idx--) {
                        this.popClusterCoordinator();
                    }
                }
                this.$nextTick(() => {
                    this.$refs.coordinators.toggleLoader(); // Toggle the loading state of the coordinators
                });

                this.fetchClusterTable(node); // Fetch and update neighbors data
                // this.$nextTick(() => {
                //     this.$refs.neighbors.toggleLoader(); // Toggle the loading state of the neighbors to close the spinner
                // });
                // Temp timeout to mimic async data loading
                setTimeout(function(t) {
                    t.$nextTick(() => {
                        t.$refs.neighbors.toggleLoader();
                    });
                }, 1500, this);
            },
            openDetail: function(node) {
                console.log("Open Detail using: ", node.id);
                this.$refs.detailModal.showModal(node); // Display the detail modal for the selected node
            },
            itemActionMenuTriggered: function(event, node) {
                if (this.$refs.detailModal.show) {
                    this.$refs.detailModal.hideModal();
                }
                this.$refs.itemActionMenu.showMenu(event, node); // Display the context menu for the selected node
            }
        },
        created: function() {
            // Listen for clicks to trigger an action menu on a selected node
            this.$root.$on('item-action-menu-triggered', (args) => {
                this.itemActionMenuTriggered(args.event, args.node);
            });
            // Listen for events to expand a cluster
            this.$on('expand-cluster', (node) => {
                this.expandCluster(node);
            });
            // Listen for events to open a detail modal for a node
            this.$on('open-detail', (node) => {
                this.openDetail(node);
            });
        },
        beforeMount: function() {
            // TODO: Pass Root Cluster query

            // TEMP hardcoded root
            let root = {
                "id": 1,
                "cluster": 1,
                "coordinator": 0,
                "neighbor_count": 6,
                "designation": "root",
                "comm_techs": ["WiFi", "BLE", "LoRa"],
                "add_timestamp": 1545027824,
                "update_timestamp": 1545042224,
                "ireg_rate": 0.05
            };

            let coordinatorStore = sessionStorage.getItem("coordinators"); // Read SessionStorage for stored coordinators
            // If the coordinatorStore is empty push the root node
            // Otherwise load the stored information. This handles the case of page reload
            if (coordinatorStore === null) {
                this.pushClusterCoordinator(root);
            } else {
                this.coordinators = JSON.parse(coordinatorStore);
            }

            let neighborStore = sessionStorage.getItem("neighbors"); // Read SessionStorage for stored neighbors
            // If the neighborStore is empty query the network for the root cluster table
            // Otherwise load the stored information. This handles the case of page reload
            if (neighborStore === null) {
                this.fetchClusterTable(root);
            } else {
                this.neighbors = JSON.parse(neighborStore);
            }

        },
        mounted: function() {
            this.$nextTick(() => {
                this.$refs.coordinators.toggleLoader();
                // this.$refs.neighbors.toggleLoader();
            });
            // Temp timeout to mimic async data loading
            setTimeout(function(t) {
                t.$nextTick(() => {
                    t.$refs.neighbors.toggleLoader();
                });
            }, 1500, this);
        },
        updated: function() {

        }
    }
    let rootCluster = {
        coordinators: [{
            "id": 1,
            "cluster": 1,
            "coordinator": 0,
            "neighbor_count": 6,
            "designation": "root",
            "comm_techs": ["WiFi", "BLE", "LoRa"],
            "add_timestamp": 1545027824,
            "update_timestamp": 1545042224,
            "ireg_rate": 0.05
        }],
        neighbors: [{
            "id": 2,
            "cluster": 1,
            "coordinator": 1,
            "neighbor_count": 6,
            "designation": "node",
            "comm_techs": ["WiFi"],
            "add_timestamp": 1545027990,
            "update_timestamp": 1545042222,
            "ireg_rate": 0.1
        }, {
            "id": 3,
            "cluster": 1,
            "coordinator": 1,
            "neighbor_count": 6,
            "designation": "node",
            "comm_techs": ["WiFi", "BLE"],
            "add_timestamp": 1545027991,
            "update_timestamp": 1545042222,
            "ireg_rate": 0.12
        }, {
            "id": 4,
            "cluster": 1,
            "coordinator": 1,
            "neighbor_count": 9,
            "designation": "coordinator",
            "comm_techs": ["WiFi", "BLE", "LoRa"],
            "add_timestamp": 1545027992,
            "update_timestamp": 1545042223,
            "ireg_rate": 0.05
        }, {
            "id": 5,
            "cluster": 1,
            "coordinator": 1,
            "neighbor_count": 6,
            "designation": "node",
            "comm_techs": ["BLE"],
            "add_timestamp": 1545027993,
            "update_timestamp": 1545042222,
            "ireg_rate": 0.24
        }, {
            "id": 6,
            "cluster": 1,
            "coordinator": 1,
            "neighbor_count": 6,
            "designation": "node",
            "comm_techs": ["LoRa"],
            "add_timestamp": 1545027994,
            "update_timestamp": 1545042222,
            "ireg_rate": 0.55
        }]
    };
    let subCluster = {
        coordinators: [{
            "id": 1,
            "cluster": 1,
            "coordinator": 0,
            "neighbor_count": 6,
            "designation": "root",
            "comm_techs": ["WiFi", "BLE", "LoRa"],
            "add_timestamp": 1545027824,
            "update_timestamp": 1545042222,
            "ireg_rate": 0.05
        }, {
            "id": 4,
            "cluster": 1,
            "coordinator": 1,
            "neighbor_count": 9,
            "designation": "coordinator",
            "comm_techs": ["WiFi", "BLE", "LoRa"],
            "add_timestamp": 1545027992,
            "update_timestamp": 1545042223,
            "ireg_rate": 0.05
        }],
        neighbors: [{
            "id": 7,
            "cluster": 2,
            "coordinator": 4,
            "neighbor_count": 4,
            "designation": "node",
            "comm_techs": ["BLE"],
            "add_timestamp": 1545293042,
            "update_timestamp": 1545042223,
            "ireg_rate": 0.06
        }, {
            "id": 8,
            "cluster": 2,
            "coordinator": 4,
            "neighbor_count": 4,
            "designation": "node",
            "comm_techs": ["BLE"],
            "add_timestamp": 1545293043,
            "update_timestamp": 1545042223,
            "ireg_rate": 0.08
        }, {
            "id": 9,
            "cluster": 2,
            "coordinator": 4,
            "neighbor_count": 4,
            "designation": "node",
            "comm_techs": ["BLE"],
            "add_timestamp": 1545293044,
            "update_timestamp": 1545042223,
            "ireg_rate": 0.05
        }]
    };

</script>

<style scoped>

</style>
