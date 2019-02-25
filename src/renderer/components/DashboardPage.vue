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
                                <h4>Hello, <span id="name">User</span>!</h4>
                            </div>
                        </div>
                    </section>
                    <section id="clusters">
                        <cluster-context></cluster-context>
                    </section>
                </article>
                <article id="data">
                    <data-context></data-context>
                </article>
            </div>
        </main>
        <transition name="fade">
            <section class="processing" v-if="ui.processing">
                <div class="wrapper">
                    <div class="context">
                        <Spinner v-if="ui.loading" v-bind:color="'#2D383C'"></Spinner>
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
    </div>
</template>

<script>
    import HeaderPartial from './Partials/HeaderPartial';
    import Spinner from './Partials/Spinner';
    import FlashMessage from './Partials/FlashMessage';
    import ClusterContext from './DashboardPage/ClusterContext';
    import DataContext from './DashboardPage/DataContext';
    import WiFiSelect from './DashboardPage/WiFiSelect';

    const remote = require('electron').remote;
    const https = require('https');
    const session = require('electron').remote.session;
    const setCookie = require('set-cookie-parser');

    var ses = session.fromPartition('persist:name');

    export default {
        name: 'dashboard-page',
        components: { HeaderPartial, Spinner, FlashMessage, ClusterContext, DataContext, WiFiSelect },
        data () {
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
                    message: "",
                    priority: 0
                },
                info: {
                    network: null,
                    nodes: null
                }
            }
        },
        mounted: function() {
            this.$electron.ipcRenderer.on('recievedClusterInformation', (event, data) => {
                console.log("Renderer: ", data);
            })
        },
        created: function() {
            this.getNetworkConnectionInfo(function(error, data){
                // this.toggleProcessing();
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
                // setTimeout(function(self) {
                //     self.$electron.ipcRenderer.send('startBryptConnection', data);
                // }, 30 * 1000, this );
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
                        console.log(error, cookies);
                        if(cookies[0]) {
                            let authCookie = "auth_token=" + cookies[0].value;

                            const userData = JSON.stringify({});

                            var requestOptions = {
                                host: "bridge.brypt.com",
                                port: 443,
                                path: "/network",
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
                                        this.flash.message = "Success!";
                                        break;
                                    case 401:
                                        this.flash.priority = 2;
                                        this.flash.message = "Failed to Authenticate! Please Try Again.";
                                        break;
                                    case 500:
                                        this.flash.priority = 2;
                                        this.flash.message = "Internal Server Error.";
                                        break;
                                    default:
                                        this.flash.priority = 1;
                                        this.flash.message = "Unknown Error! Please Try Again.";
                                        break;
                                }
                                console.log(response.statusCode);
                                // this.$refs.flash.showFlash();
                                response.on('data', (data) => {
                                    let dataJSON = JSON.parse(data);
                                    this.info.network = dataJSON['network'];
                                    this.info.nodes = dataJSON['nodes'];
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
                this.ui.wifiselect = !this.ui.wifiselect; // Toggle the loading tracker for the group
            }
        }
    }
</script>

<style>
    @import url('~@/assets/css/dashboard.css');
</style>
