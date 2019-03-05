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
    import { mapGetters } from 'vuex'

    import Spinner from '../Partials/Spinner'
    import ItemContextMenu from './ItemContextMenu'
    import NodeContainer from './NodeContainer'
    import NodeDetail from './NodeDetail'

    function indexOfObject(obj, arr) {
        for (let idx = 0; idx < arr.length; idx++) {
            if (obj.uid == arr[idx].uid) {
                return idx;
            }
        }
        return -1;
    }

    export default {
        name: 'cluster-context',
        components: { Spinner, ItemContextMenu, NodeContainer, NodeDetail },
        data: function() {
            return {
                coordinators: null, // The array of coordinators for the cluster
                neighbors: null, // The array of neighbors to the cluster coordinator
                currentCoordUID: -1,
            };
        },
        computed: {
            ...mapGetters(['cluster']),

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
                    name: 'Open Detail',
                    call: 'openDetail',
                    event: 'open-detail',
                    requiresCordinator: false
                });
                // Push an option to expand (fetch) the neighbors of a coordinator
                options.push({
                    name: 'Expand Cluster',
                    call: 'expandCluster',
                    event: 'expand-cluster',
                    requiresCordinator: true
                });
                return options;
            }

        },
        watch: {
            cluster: function (obj) {
                if (this.coordinators === null) {
                    this.buildInitialState();
                } else {
                    if (this.expectingClusterUpdate) {
                        let neighbors = this.cluster.filter(function(node){
                            return node.uid !== this.currentCoordUID;
                        }.bind(this));

                        this.neighbors = neighbors;

                        this.$nextTick(() => {
                            this.$refs.neighbors.toggleLoader();
                        });

                        this.expectingClusterUpdate = false;
                    }
                }
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
            this.buildInitialState();
        },
        mounted: function() {
            this.$nextTick(() => {
                this.$refs.coordinators.toggleLoader();
            });
        },
        updated: function() {

        },
        methods: {
            buildInitialState: function() {
                if (this.cluster === null) {
                    return;
                }

                let root = this.cluster.filter(function(node){
                    return node.designation === 'root';
                })[0];

                let neighbors = this.cluster.filter(function(node){
                    return node.designation !== 'root';
                });

                this.currentCoordUID = root.uid;

                // TODO: Remove sessionStorage and store current coordinator ID in Vuex for rebuilding state

                let coordinatorStore = sessionStorage.getItem('coordinators'); // Read SessionStorage for stored coordinators
                // If the coordinatorStore is empty push the root node
                // Otherwise load the stored information. This handles the case of page reload
                if (coordinatorStore === null) {
                    this.pushClusterCoordinator(root);
                } else {
                    this.coordinators = JSON.parse(coordinatorStore);
                    this.coordinators.forEach(function(node) {
                        node.update_timestamp = new Date(node.update_timestamp);
                        node.registered_timestamp = new Date(node.registered_timestamp);
                    });
                }

                let neighborStore = sessionStorage.getItem('neighbors'); // Read SessionStorage for stored neighbors
                // If the neighborStore is empty query the network for the root cluster table
                // Otherwise load the stored information. This handles the case of page reload
                if (neighborStore === null) {
                    this.neighbors = neighbors;
                    sessionStorage.setItem('neighbors', JSON.stringify(neighbors)); // Store the the neighbors in the SessionStorage in case of page reload
                    this.$nextTick(() => {
                        this.$refs.neighbors.toggleLoader();
                    });
                } else {
                    this.neighbors = JSON.parse(neighborStore);
                    this.neighbors.forEach(function(node) {
                        node.update_timestamp = new Date(node.update_timestamp);
                        node.registered_timestamp = new Date(node.registered_timestamp);
                    });
                }
            },
            pushClusterCoordinator: function(node) {
                // Ensure a node to push has been provided
                if (node === null) {
                    return;
                }

                let coordinators = []; // Intialize an empty array to store the coordinators
                let coordinatorStore = sessionStorage.getItem('coordinators'); // Read SessionStorage for stored coordinators

                // If there is comething in the Store parse the contents
                if (typeof coordinatorStore === 'string') {
                    coordinators = JSON.parse(coordinatorStore);
                    coordinators.forEach(function(node) {
                        node.update_timestamp = new Date(node.update_timestamp);
                        node.registered_timestamp = new Date(node.registered_timestamp);
                    });
                }

                // Ensure that the node being pushed is not in the array
                if (indexOfObject(node, coordinators) === -1) {
                    coordinators.push(node); // Push the node into the coordinators array
                    sessionStorage.setItem('coordinators', JSON.stringify(coordinators)); // Store the updated coordinators in SessionStorage
                }

                this.coordinators = coordinators; // Update the components data with the coordinator data

            },
            popClusterCoordinator: function() {
                this.coordinators.pop(); // Pop the last coordinator in the array
                sessionStorage.setItem('coordinators', JSON.stringify(this.coordinators)); // Store the updated coordinators in SessionStorage
            },
            fetchClusterTable: function(node) {
                // Ensure a node has been provided
                if (node === null) {
                    return;
                }

                // Ensure the node is a branch
                if (node.designation == 'node') {
                    return;
                }

                let messageCommand = 0;
                let messagePhase = 0;
                let messageData = '{uid: \"'+ node.uid + '\"}';

                this.$root.$emit('bryptRequest', {
                    destination: node.uid,
                    handler: 'clusterInfoResponse',
                    payload: {
                        command: messageCommand,
                        phase: messagePhase,
                        data: messageData,
                    }
                });

            },
            expandCluster: function(node) {
                if(node.uid == this.currentCoordUID) {
                    alert('Cluster for Coordinator', node.uid, 'is already open.');
                    return;
                }

                this.expectingClusterUpdate = true;

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

                this.currentCoordUID = node.uid;

                this.$nextTick(() => {
                    this.$refs.coordinators.toggleLoader(); // Toggle the loading state of the coordinators
                });

                this.fetchClusterTable(node); // Fetch and update neighbors data
            },
            openDetail: function(node) {
                this.$refs.detailModal.showModal(node); // Display the detail modal for the selected node
            },
            itemActionMenuTriggered: function(event, node) {
                if (this.$refs.detailModal.show) {
                    this.$refs.detailModal.hideModal();
                }
                this.$refs.itemActionMenu.showMenu(event, node); // Display the context menu for the selected node
            }
        }
    }

</script>

<style scoped>

</style>
