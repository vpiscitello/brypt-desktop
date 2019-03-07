// TODO: Persist Auth Token inorder to not require login if already authenticated for the day
// TODO: Make persisting login an option

const state = {
    profile: {
        fullname: '',
        username: '',
        email: '',
        egg: false
    },
    network: null,
    nodes: null,
    cluster: null,
    cycle: {
        round: 0,
    }
};

function indexOfObjectUID(uid, arr) {
    for (let idx = 0; idx < arr.length; idx++) {
        if (uid == arr[idx].uid) {
            return idx;
        }
    }
    return -1;
}

const mutations = {
    SETUP: function(state) {

        state.profile.egg = false;

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

        state.cycle.round = 0;

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
    FLIP_EGG: function(state) {
        state.profile.egg = !state.profile.egg;
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
    INCREMENT_CYCLE_ROUND: function(state) {
        state.cycle.round++;
    },
    INCREMENT_ATTACKS: function(state) {
        state.network.attacks++;
    },
    UPDATE_IREG_RATE: function(state, {
        nodeUID,
        missed,
    }) {
        let nodeIDX = indexOfObjectUID(nodeUID, state.nodes);
        let old_rate = state.nodes[nodeIDX].ireg_rate;
        if (old_rate == 0) {
            if (missed) {
                state.nodes[nodeIDX].ireg_rate = 1;
            }
        } else {
            let cycle_ratio = missed ? 1 : 0;
            let old_count = state.cycle.round - 1;
            let numerator = (old_count * old_rate) + cycle_ratio;
            state.nodes[nodeIDX].ireg_rate = (numerator / state.cycle.round);
        }
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
    flipEgg: function(store) {
        store.commit('FLIP_EGG');
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
    incrementCycleRound: function(store) {
        store.commit('INCREMENT_CYCLE_ROUND');
    },
    incrementNetworkAttacks: function(store) {
        store.commit('INCREMENT_ATTACKS');
    },
    updateIregRate: function(store, payload) {
        store.commit('UPDATE_IREG_RATE', {
            nodeUID: payload.nodeUID,
            missed: payload.missed
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
    egg: function(state) {
        return state.profile.egg;
    },
    nodes: function(state) {
        return state.nodes;
    },
    nodesCount: function(state) {
        return state.nodes.length;
    },
    fetchNode: function(state, uid) {
        let nodeIDX = indexOfObjectUID(uid, state.nodes);
        return state.nodes[nodeIDX];
    },
    cluster: function(state) {
        return state.cluster;
    },
    cycleRounds: function(state) {
        return state.cycle.rounds;
    },
    fetchIregRate: (state) => (uid) => {
        let nodeIDX = indexOfObjectUID(uid, state.nodes);
        return state.nodes[nodeIDX].ireg_rate;
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
