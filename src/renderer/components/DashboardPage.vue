<template>
    <div class="wrapper">
        <HeaderPartial></HeaderPartial>
        <main class="">
            <div class="wrapper">
                <!-- <flag-message
                    v-bind:id="'flag-message'"
                    v-bind:ref="'flag'"
                    v-bind:message="'This is a basic message'"
                    v-bind:urgency="0">
                </flag-message> -->
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
                        <!-- <cluster-context></cluster-context> -->
                    </section>
                </article>
                <article id="data">
                    <!-- <data-context></data-context> -->
                </article>
            </div>
        </main>
    </div>
</template>

<script>
    // var crypto = require('brypt-crypto');

    import {CryptoInterface} from "../../crypto/crypto.js"

    import HeaderPartial from './Partials/HeaderPartial'

    export default {
        name: 'dashboard-page',
        components: { HeaderPartial },
        data () {
            return {

            }
        },
        methods: {
            open (link) {
                this.$electron.shell.openExternal(link)
            },
        }
    }
</script>

<style>

</style>
