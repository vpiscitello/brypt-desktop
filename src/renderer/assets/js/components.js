var rootCluster = {
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
var subCluster = {
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

function indexOfObject(obj, arr) {
    for (var idx = 0; idx < arr.length; idx++) {
        if (obj.id == arr[idx].id) {
            return idx;
        }
    }
    return -1;
}

// // https://stackoverflow.com/questions/36170425/detect-click-outside-element
Vue.directive('click-outside', {
    bind: function(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
            if (!(el == event.target || el.contains(event.target))) {
                vnode.context[binding.expression](event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unbind: function(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
});

// TODO: Get Network connection from Central Server
// TODO: Set up Control and Data websockets to network

var Spinner = {
    template: '#spinner-template',
    props: {
        // The color of the spinner elements
        color: {
            type: String,
            required: true
        }
    }
};

// Based on https://github.com/johndatserakis/vue-simple-context-menu
var ItemContextMenu = {
    template: '#ctx-menu-template',
    props: {
        // The element id of the context menu
        id: {
            type: String,
            required: true
        },
        // The supplied array of possible actions
        options: {
            type: Array,
            required: true
        }
    },
    data: function() {
        return {
            item: null, // The item that the context menu is operating on
            menuWidth: null, // The calculated width of the menu
            menuHeight: null, // The calculated height of the menu
            itemIsBranching: false // A boolean value set when the item is a coordinator
        };
    },
    computed: {
        // The options available to a leaf node
        leafOptions: function() {
            // Filter out options that need a branching node
            return this.options.filter((opt) => {
                return !opt.requiresCordinator;
            });
        },
        // The options available to a branch node
        branchOptions: function() {
            return this.options;
        }
    },
    methods: {
        showMenu: function(event, item) {
            // console.log("Show Menu");

            this.item = item; // Store the item being operated on

            // Set and Update the context menu based on the designation of the item
            this.itemIsBranching = (this.item.designation == "node") ? false : true;

            // After the DOM has been updated display the context menu
            this.$nextTick(() => {
                // Select the context menu and return if it does not exist
                var menu = document.getElementById(this.id);
                if (!menu) {
                    return;
                }

                // Compute the width of the menu if it has not been set
                if (!this.menuWidth || !this.menuHeight) {
                    menu.style.visibility = "hidden";
                    menu.style.display = "block";
                    this.menuWidth = menu.offsetWidth;
                    this.menuHeight = menu.offsetHeight;
                    menu.removeAttribute("style");
                }

                var parentRect = this.$parent.$el.getBoundingClientRect();

                // Set the X postion of the menu based on the item and page position
                if ((this.menuWidth + event.pageX) >= parentRect.width) {
                    menu.style.left = (event.pageX - parentRect.x - this.menuWidth + 2) + "px";
                } else {
                    menu.style.left = (event.pageX - parentRect.x - 2) + "px";
                }

                // Set the Y postion of the menu based on the item and page position
                if ((this.menuHeight + event.pageY) >= window.innerHeight) {
                    menu.style.top = (event.pageY - parentRect.y - this.menuHeight + 2) + "px";
                } else {
                    menu.style.top = (event.pageY - parentRect.y - 2) + "px";
                }

                menu.classList.add('active'); // Display the menu
            });
        },
        hideMenu: function() {
            // console.log("Hide Menu");
            var element = document.getElementById(this.id); // Get the menu
            if (element) {
                element.classList.remove('active'); // Hide the menu
            }
        },
        optionClicked: function(option) {
            this.hideMenu();
            this.$emit(option.event, this.item); // Notify the parent of a selected option
        },
        onClickOutside: function() {
            this.hideMenu();
        }
    }
};

var NodeDetail = {
    template: '#detail-template',
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
        },
        // The left zero pading for the node ID
        zeroPad: function() {
            zeros = "0000";
            // Make a subtring the ensure all IDs are aligned on four characters
            return zeros.substring(0, zeros.length - ("" + this.node.id).length);
        }
    },
    filters: {
        toTimeString: function(timestamp) {
            var date = new Date(timestamp * 1000); // Convert the provided timestamp to a Date object
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
};

var NodeItem = {
    template: '#node-template',
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
            zeros = "0000";
            // Make a subtring the ensure all IDs are aligned on four characters
            return zeros.substring(0, zeros.length - ("" + this.node.id).length);
        }
    },
    filters: {
        toTimeString: function(timestamp) {
            var date = new Date(timestamp * 1000); // Convert the provided timestamp to a Date object
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
};

var NodeContainer = {
    template: '#ng-template',
    components: {
        'spinner': Spinner,
        'node-item': NodeItem
    },
    props: {
        id: {
            type: String,
            required: true
        },
        // The title of the node group
        title: {
            type: String,
            required: true
        },
        // The array of nodes in the group
        nodes: {
            type: Array,
            required: true
        },
        // Defines whether or not the group needs an async loading spinner
        needSpinner: {
            type: Boolean,
            required: true
        }
    },
    data: function() {
        return {
            ui: {
                loading: true // A boolean value tracking the updating state of the group
            }
        };
    },
    computed: {
        // The total height of items in the group
        groupHeight: function() {
            return (60 * this.nodes.length);
        },
        containerHeight: function() {
            return (this.groupHeight + 30);
        }
    },
    methods: {
        toggleLoader: function() {
            this.ui.loading = !this.ui.loading; // Toggle the loading tracker for the group
        }
    }
};

var ClusterContext = {
    template: '#cluster-template',
    components: {
        'spinner': Spinner,
        'node-container': NodeContainer,
        'item-context-menu': ItemContextMenu,
        'node-detail': NodeDetail
    },
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
            var options = [];
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

            var coordinators = []; // Intialize an empty array to store the coordinators
            var coordinatorStore = sessionStorage.getItem("coordinators"); // Read SessionStorage for stored coordinators

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

            var neighbors = Object;

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

            cordIndex = indexOfObject(node, this.coordinators); // Attempt to find the node in the array of coordinators
            // If the node is not in the coordinators push it
            // Otherwise pop all nodes up to its location
            if (cordIndex == -1) {
                this.pushClusterCoordinator(node);
            } else {
                // Pop each node until the request coordinator
                for (var idx = this.coordinators.length - 1; idx > cordIndex; idx--) {
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
        var root = {
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

        var coordinatorStore = sessionStorage.getItem("coordinators"); // Read SessionStorage for stored coordinators
        // If the coordinatorStore is empty push the root node
        // Otherwise load the stored information. This handles the case of page reload
        if (coordinatorStore === null) {
            this.pushClusterCoordinator(root);
        } else {
            this.coordinators = JSON.parse(coordinatorStore);
        }

        var neighborStore = sessionStorage.getItem("neighbors"); // Read SessionStorage for stored neighbors
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
};

var DataContext = {

};

// Bootstrap the Clusters
var clustersVue = new Vue({
    el: '#clusters',
    components: {
        'cluster-context': ClusterContext,
        'node-container': NodeContainer,
        'node-item': NodeItem
    },
    data: {

    }
});

// Bootstrap the Data
var dataVue = new Vue({
    el: '#data',
    components: {

    },
    data: {

    }
});
