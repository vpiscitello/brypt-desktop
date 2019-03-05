// TODO: Persist Auth Token inorder to not require login if already authenticated for the day
// TODO: Make persisting login an option

const state = {
    profile: {
        fullname: '',
        username: '',
        email: '',
    },
    network: null,
    nodes: null,
    cluster: null
};

const mutations = {
    SETUP: function(state) {

        if (state.nodes !== null) {
            state.nodes.forEach(function(node) {
                node.registered_timestamp = new Date(node.registered_timestamp);
            });
        }

        if (state.cluster !== null) {
            state.cluster.forEach(function(node) {
                node.registered_timestamp = new Date(node.registered_timestamp);
                node.update_timestamp = new Date(node.update_timestamp);
            });
        }

    },
    SET_PROFILE: function(state, {
        firstname, lastname, username, email
    }) {
        state.profile.fullname = firstname + ' ' + lastname;
        state.profile.username = username;
        state.profile.email = email;
    },
    SET_NETWORK: function(state, {
        network
    }) {
        state.network = network;
    },
    SET_NODES: function(state, {
        nodes
    }) {
        nodes.forEach(function(node) {
            node.registered_timestamp = new Date(node.registered_timestamp);
        });

        state.nodes = nodes;
    },
    UPDATE_CLUSTER: function(state, {
        clusterNodes
    }) {
        let matchedMap = new Map();

        let matched = state.nodes.filter(function(knownNode) {
            return clusterNodes.some(function(clusterNode) {
                if (knownNode.uid === clusterNode.uid) {
                    matchedMap.set(knownNode.uid, clusterNode);
                    return true;
                }
                return false;
            });
        }).map(function(matchedNode) {
            let clusterNode = matchedMap.get(matchedNode.uid);
            clusterNode.update_timestamp = new Date(clusterNode.update_timestamp * 1000);
            return Object.assign({}, matchedNode, clusterNode);
        });

        state.cluster = matched;
    },
    INCREMENT_ATTACKS: function(state) {
        state.network.attacks++;
    },
    UPDATE_IREG_RATE: function(state, {
        nodeID, rate
    }) {
        state.nodes[nodeID].ireg_rate = rate;
    }
};

const actions = {
    setup: function(store) {
        store.commit('SETUP');
    },
    setProfileState: function(store, payload) {
        store.commit('SET_PROFILE', {
            firstname: payload.firstname,
            lastname: payload.lastname,
            username: payload.username,
            email: payload.email
        });
    },
    setNetworkState: function(store, payload) {
        store.commit('SET_NETWORK', {
            network: payload.network,
        });
    },
    setNodesState: function(store, payload) {
        store.commit('SET_NODES', {
            nodes: payload.nodes,
        });
    },
    updateCluster: function(store, payload) {
        store.commit('UPDATE_CLUSTER', {
            clusterNodes: payload.nodes,
        });
    },
    incrementNetworkAttacks: function(store) {
        store.commit('INCREMENT_ATTACKS');
    },
    updateIregRate: function(store, payload) {
        store.commit('UPDATE_IREG_RATE', {
            nodeID: payload.nodeID,
            rate: payload.rate,
        });
    }
};

const getters = {
    fullname: function(state) {
        return state.profile.fullname;
    },
    username: function(state) {
        return state.profile.username;
    },
    email: function(state) {
        return state.profile.email;
    },
    nodes: function(state) {
        return state.nodes;
    },
    nodesCount: function(state) {
        return state.nodes.length;
    },
    node: function(state, id) {
        return state.nodes[id];
    },
    cluster: function(state) {
        return state.cluster;
    },
    nodeIregRate: function(state, id) {
        return state.nodes[id].ireg_rate;
    },
    clusters: function(state) {
        return state.network.clusters;
    },
    attacks: function(state) {
        return state.network.attacks;
    },
};

export default {
    state,
    mutations,
    actions,
    getters,
};
