<template>
    <div class="wrapper">
        <HeaderPartial></HeaderPartial>
        <main v-if="ui.dashboard" class="">
            <div class="wrapper">
                <FlashMessage
                    v-bind:id="'flash-message'"
                    v-bind:ref="'flash'"
                    v-bind:message="flash.message"
                    v-bind:urgency="flash.priority" >
                </FlashMessage>
                <article id="network">
                    <section id="user">
                        <div class="context">
                            <div class="icon">
                                <i class="fas fa-user-astronaut"></i>
                            </div>
                            <div class="info">
                                <h4>Hello, <span id="name">{{fullname}}</span>!</h4>
                            </div>
                        </div>
                    </section>
                    <section id="clusters">
                        <cluster-context></cluster-context>
                    </section>
                </article>
                <article id="data">
                    <data-context v-bind:readings="this.info.readings"></data-context>
                </article>
            </div>
        </main>
        <transition name="fade">
            <section class="processing" v-if="ui.processing">
                <div class="wrapper">
                    <div class="context">
                        <Pulser v-if="ui.loading" v-bind:color="'#2D383C'"></Pulser>
                    </div>
                </div>
            </section>
        </transition>
        <transition name="fade">
            <WiFiSelect
                v-if="ui.wifiselect"
                v-bind:target="info.network">
            </WiFiSelect>
        </transition>
        <Egg v-if="egg"></Egg>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import HeaderPartial from './Partials/HeaderPartial';
    import Spinner from './Partials/Spinner';
    import Pulser from './Partials/Pulser'
    import FlashMessage from './Partials/FlashMessage';
    import Egg from './Partials/Egg';
    import ClusterContext from './DashboardPage/ClusterContext';
    import DataContext from './DashboardPage/DataContext';
    import WiFiSelect from './DashboardPage/WiFiSelect';

    const remote = require('electron').remote;
    const https = require('https');
    const session = require('electron').remote.session;
    const setCookie = require('set-cookie-parser');

    const bryptMessage = require('../../../build/Release/brypt-message.node');

    var ses = session.fromPartition('persist:name');

    export default {
        name: 'dashboard-page',
        components: { HeaderPartial, Spinner, Pulser, FlashMessage, Egg, ClusterContext, DataContext, WiFiSelect },
        data: function() {
            return {
                window: remote.getCurrentWindow(),
                ui: {
                    processing: true,
                    loading: true,
                    dashboard: false,
                    wifiselect: false
                },
                flash: {
                    show: false,
                    message: '',
                    priority: 0
                },
                info: {
                    readings: null
                }
            }
        },
        computed: mapGetters(['fullname', 'email', 'egg']),
        mounted: function() {

        },
        created: function() {

            this.$store.dispatch('setup');

            this.$electron.ipcRenderer.on('responseReceived', (event, message) => {
                // TODO: Move to be handled in connection process
                let response = new bryptMessage.Init(message);
                console.log(JSON.parse(response.getData()));
            });

            this.$electron.ipcRenderer.on('clusterInfoResponse', (event, message) => {
                // TODO: Move to be handled in connection process
                let clusterInfoResponse = new bryptMessage.Init(message.payload);
                let clusterNodes = JSON.parse(clusterInfoResponse.getData());
                this.$store.dispatch('updateCluster', {
                    nodes: clusterNodes,
                });

            });

            this.$electron.ipcRenderer.on('cycleReadingsRecieved', (event, message) => {
                this.info.readings = message;
            });

            this.$electron.ipcRenderer.on('bryptConnectionCompleted', (event, message) => {
                // TODO: Move to be handled in connection process
                let clusterInfoResponse = new bryptMessage.Init(message.payload.clusterInformation);
                let clusterNodes = JSON.parse(clusterInfoResponse.getData());
                this.$store.dispatch('updateCluster', {
                    nodes: clusterNodes,
                });

                this.toggleProcessing();
                this.$nextTick(() => {
                    this.toggleDashboard();
                });
            });

            this.$root.$on('bryptRequest', (message) => {
                this.$electron.ipcRenderer.send('sendBryptMessage', message);
            });

            this.getNetworkConnectionInfo(function(error, data){
                this.toggleWiFiSelect();
                this.$root.$on('needProcessing', () => {
                    if(!this.ui.processing) {
                        this.ui.processing = true;
                        this.ui.loading = true;
                    }
                });
                this.$root.$on('doneProcessing', () => {
                    this.toggleProcessing();
                });
                this.$root.$on('accessPointConnected', () => {
                    this.toggleWiFiSelect();
                    this.$electron.ipcRenderer.send('startBryptConnection', data);
                });
            }.bind(this));

        },
        methods: {
            openLink(link) {
                this.$electron.shell.openExternal(link)
            },
            getNetworkConnectionInfo(callback) {
                ses.cookies.get(
                    { name: 'auth_token' },
                    (error, cookies) => {
                        if(cookies[0]) {
                            let authCookie = 'auth_token=' + cookies[0].value;

                            const userData = JSON.stringify({});

                            var requestOptions = {
                                host: 'bridge.brypt.com',
                                port: 443,
                                path: '/network',
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Cookie': authCookie
                                }
                            };

                            const request = https.request(requestOptions, (response) => {
                                switch (response.statusCode) {
                                    case 202:
                                        this.flash.priority = 0;
                                        this.flash.message = 'Success!';
                                        break;
                                    case 401:
                                        this.flash.priority = 2;
                                        this.flash.message = 'Failed to Authenticate! Please Try Again.';
                                        break;
                                    case 500:
                                        this.flash.priority = 2;
                                        this.flash.message = 'Internal Server Error.';
                                        break;
                                    default:
                                        this.flash.priority = 1;
                                        this.flash.message = 'Unknown Error! Please Try Again.';
                                        break;
                                }
                                response.on('data', (data) => {
                                    let dataJSON = JSON.parse(data);
                                    this.info.network = dataJSON['network'];
                                    this.info.nodes = dataJSON['nodes'];

                                    // TODO: Update to get this data from the network
                                    this.info.network.clusters = 2;
                                    this.info.network.attacks = 0.0;

                                    this.info.nodes.forEach(function(node){
                                        node["ireg_rate"] = 0;
                                        node["registered_timestamp"] = new Date(node["registered_timestamp"]);
                                    });

                                    this.$store.dispatch('setNetworkState', {
                                        network: this.info.network,
                                    });

                                    this.$store.dispatch('setNodesState', {
                                        nodes: this.info.nodes,
                                    });

                                    callback(null, data);
                                });
                            });

                            request.on('error', (error) => {
                                console.error(error);
                            });

                            request.on('socket', function(socket) {
                                socket.setTimeout(5000);
                                socket.on('timeout', function() {
                                    request.abort();
                                });
                            });

                            request.write(userData);
                            request.end();
                        }
                    }
                );
            },
            toggleProcessing: function() {
                this.ui.processing = !this.ui.processing; // Toggle the processing tracker for the group
                this.ui.loading = !this.ui.loading; // Toggle the loading tracker for the group
            },
            toggleLoader: function() {
                this.ui.loading = !this.ui.loading; // Toggle the loading tracker for the group
            },
            toggleWiFiSelect: function() {
                this.ui.wifiselect = !this.ui.wifiselect; // Toggle the WiFi selection component
            },
            toggleDashboard: function() {
                this.ui.dashboard = !this.ui.dashboard; // Toggle the main dashboard component
            }
        }
    }
</script>

<style>
    @import url('~@/assets/css/dashboard.css');
</style>
