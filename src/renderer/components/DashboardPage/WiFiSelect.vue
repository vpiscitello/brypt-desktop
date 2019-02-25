<template>
    <div v-if="ui.show" class="wifi-select">
        <div v-if="!found.empty == true" class="found context">
            <i class="fas fa-broadcast-tower"></i>
            <h2>Brypt Network Found!</h2>
            <p>Please select the Brypt Access Point name below to continue.</p>
            <ul>
                <li v-for="network in found.networks">
                    <button type="button" name="button" @click="connectAP()">{{found.networks[found.key].ssid}} <i class="fas fa-chevron-right"></i></button>
                </li>
            </ul>
        </div>
        <div v-else class="notfound context">
            <i class="fas fa-wifi-slash"></i>
            <h2>No Brypt Networks Found.</h2>
            <p>Please ensure you are within range of your root coordinator!</p>
            <button type="button" name="button" @click="scanForNetwork()">Retry <i class="fas fa-redo-alt"></i></button>
        </div>
    </div>
</template>

<script>
    const remote = require('electron').remote;
    const wifi = require('node-wifi');

    export default {
        name: 'wifi-select',
        props: {
            target: {
                type: Object,
                required: true
            }
        },
        data: function() {
            return {
                ui: {
                    show: false
                },
                found: {
                    key: null,
                    networks: null,
                    empty: true
                },
            };
        },
        computed: {

        },
        methods: {
            connectAP() {
                this.ui.show = false;
                this.$root.$emit('needProcessing');

                wifi.connect( this.found.networks[this.found.key], function(error) {
                    if(error) {
                        console.log(error);
                    }
                    this.$root.$emit('accessPointConnected');
                }.bind(this));
            },
            scanForNetwork() {
                this.ui.show = false;
                this.$root.$emit('needProcessing');

                wifi.scan( function(error, networks) {
                    if(error) {
                        console.log(error);
                    } else {
                        let foundBryptNet = Object.keys(networks).filter( function(key) {
                            return networks[key].ssid == this.target.root_ap;
                        }.bind(this)).reduce(function(object, key) {
                            this.found.key = key;
                            object[key] = networks[key];
                            return object;
                        }.bind(this), {});

                        if(Object.keys(foundBryptNet).length != 0) {
                            this.found.empty = false;
                        }

                        this.found.networks = foundBryptNet;
                        this.$root.$emit('doneProcessing');

                        setTimeout(function() {
                            this.ui.show = true;
                        }.bind(this), 500)

                    }
                }.bind(this));
            }
        },
        created: function() {
            console.log(this.target);

            wifi.init({
                iface: null
            });

            this.scanForNetwork();

        }
    }
</script>

<style scoped>

</style>
