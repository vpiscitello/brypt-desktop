<template>
    <div id="wrapper">
        <!-- <HeaderPartial></HeaderPartial> -->
        <main>
            <FlashMessage
                v-bind:id="'flash-message'"
                v-bind:ref="'flash'"
                v-bind:message="flash.message"
                v-bind:urgency="flash.priority" >
            </FlashMessage>

            <article class="access">
                <section class="login">
                    <div class="box sw mc sg">
                        <div class="wrapper">
                            <div class="header" @click="test()">
                                <h2>Sign In</h2>
                                <!-- <img class="icon" src="./assets/img/ufo-abduct-cow-simple-black.svg" alt=""> -->
                                <img class="logo" src="~@/assets/etc/login-icon.svg" alt="">
                            </div>
                            <form action="" name="login">
                                <fieldset class="username">
                                    <input v-model="loginUsername" type="text" name="username" required="" placeholder="Username">
                                </fieldset>
                                <fieldset class="password">
                                    <input v-model="loginPassword" type="password" name="password" required="" placeholder="Password">
                                </fieldset>
                                <fieldset class="submit">
                                    <button type="button" name="login" @click="login()">
                                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                                    </button>
                                </fieldset>
                            </form>
                            <div class="footer">
                                <a href="#" id="fg-usn" class="help-link">Forgot Username</a>
                                <a href="#" id="fg-pw" class="help-link">Forgot Password</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="register bck">
                    <div class="box sw mc sg">
                        <div class="wrapper">
                            <div class="header">
                                <h2>Register</h2>
                            </div>
                            <form action="" name="register">
                                <div class="name">
                                    <fieldset class="FirstName">
                                        <input v-model="registerFirstName" type="text" name="first_name" required="" placeholder="First Name">
                                    </fieldset>
                                    <fieldset class="LastName">
                                        <input v-model="registerLastName" type="text" name="last_name" required="" placeholder="Last Name">
                                    </fieldset>
                                </div>
                                <fieldset class="UserName">
                                    <input v-model="registerUsername" type="text" name="username" required="" placeholder="Username">
                                </fieldset>
                                <fieldset class="Email">
                                    <input v-model="registerEmail" type="text" name="email" required="" placeholder="Email">
                                </fieldset>
                                <fieldset class="UserPassword">
                                    <input v-model="registerPassword" type="password" name="password" required="" placeholder="Password">
                                </fieldset>
                                <fieldset class="Region">
                                    <input v-model="registerRegion" type="text" name="Region" required="" placeholder="Region">
                                </fieldset>
                                <!-- <fieldset class="Birthday">
                                    <input v-model="registerUsername" type="date" name="Birthday" required="">
                                </fieldset> -->
                                <fieldset class="submit">
                                    <button type="button" name="register" @click="register()">
                                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                                    </button>
                                </fieldset>
                            </form>
                        </div>
                    </div>
                </section>

                <div id="chg-action" class="frnt" >
                    <button type="button" name="chg" @click="switchCard()">{{inactiveCard}}</button>
                </div>

            </article>

            <transition name="fade">
                <section class="processing" v-if="ui.processing">
                    <div class="box">
                        <div class="wrapper">
                            <div class="header">
                                <h2>Processing</h2>
                            </div>
                            <div class="context">
                                <Spinner v-if="ui.loading" v-bind:color="'#FBFBFB'"></Spinner>
                            </div>
                        </div>
                    </div>
                </section>
            </transition>

        </main>
        <Egg v-if="egg"></Egg>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    import CryptoInterface from '../../crypto/crypto'
    import MessageInterface from '../../message/message'

    import Spinner from './Partials/Spinner'
    import FlashMessage from './Partials/FlashMessage'
    import Egg from './Partials/Egg'

    const remote = require('electron').remote;
    const https = require('https');
    const session = require('electron').remote.session;
    const setCookie = require('set-cookie-parser');

    var ses = session.fromPartition('persist:name');

    export default {
        name: 'access-page',
        components: { Spinner, FlashMessage, Egg },
        data: function() {
            return {
                window: remote.getCurrentWindow(),
                ui: {
                    processing: false,
                    loading: false // A boolean value tracking the updating state of the group
                },
                activeCard: 'login',
                inactiveCard: 'register',
                loginUsername: '',
                loginPassword: '',
                registerFirstName: '',
                registerLastName: '',
                registerUsername: '',
                registerEmail: '',
                registerPassword: '',
                registerRegion: '',
                // registerBirthDate: '',
                flash: {
                    show: false,
                    message: '',
                    priority: 0
                },
            };
        },
        computed: mapGetters(['egg']),
        created: function() {
            this.$store.dispatch('setup');
            
            this.$root.$on('flash-closed', () => {
                this.toggleProcessing();
            });
        },
        methods: {
            open (link) {
                this.$electron.shell.openExternal(link)
            },
            test () {
                MessageInterface.test();
                let cipher = CryptoInterface.encrypt("The quick brown fox jumps over the lazy dog", "01234567890123456789012345678901");
                let plain = CryptoInterface.decrypt(cipher, "01234567890123456789012345678901");
            },
            switchCard() {
                var tmpCard = this.inactiveCard;
                this.inactiveCard = this.activeCard;
                this.activeCard = tmpCard;

                var active = document.getElementsByClassName(this.activeCard)[0];
                var inactive = document.getElementsByClassName(this.inactiveCard)[0];

                inactive.classList.add('top-open');
                active.classList.add('bot-open');

                setTimeout(function() {
                    active.classList.remove('bck');
                    inactive.classList.add('bck');
                    setTimeout(function() {
                        inactive.classList.remove('top-open');
                        active.classList.remove('bot-open');
                    }, 10);
                }, 450);
            },
            login() {
                this.toggleProcessing();

                const loginData = JSON.stringify({
                    username: this.loginUsername,
                    password: this.loginPassword
                });

                var requestOptions = {
                    host: 'access.brypt.com',
                    port: 443,
                    path: '/login',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': loginData.length
                    }
                };

                const request = https.request(requestOptions, (response) => {
                    switch (response.statusCode) {
                        case 202:
                            this.flash.priority = 0;
                            this.flash.message = 'Success! Launching Dashboard.';
                            let cookies = setCookie.parse(response, {decodeValues: true, map: true});
                            console.log(cookies['auth_token']);
                            let authCookie = cookies['auth_token'];
                            authCookie['url'] = 'https://brypt.com';
                            ses.cookies.set(
                                authCookie,
                                (error) => {
                                    console.log(error);
                                }
                            )
                            this.$nextTick(() => {
                                this.$refs.flash.showFlash();
                                setTimeout(() => {
                                    this.$electron.ipcRenderer.send('openDashboard');
                                }, 1500);
                            });
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
                    this.$refs.flash.showFlash();
                    response.on('data', (data) => {
                        let dataJSON = JSON.parse(data);
                        this.$store.dispatch('setProfileState', {
                            firstname: dataJSON.first_name,
                            lastname: dataJSON.last_name,
                            username: dataJSON.username,
                            email: dataJSON.email,
                        });
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

                request.write(loginData);
                request.end();
            },
            register() {
                this.toggleProcessing();

                const registerData = JSON.stringify({
                    first_name: this.registerFirstName,
                    last_name: this.registerLastName,
                    username: this.registerUsername,
                    email: this.registerEmail,
                    password: this.registerPassword,
                    region: this.registerRegion,
                    // birthdate: this.registerBirthDate,
                });

                console.log(registerData);

                var requestOptions = {
                    host: 'access.brypt.com',
                    port: 443,
                    path: '/register',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': registerData.length
                    }
                };

                const request = https.request(requestOptions, (response) => {
                    switch (response.statusCode) {
                        case 202:
                            this.flash.priority = 0;
                            this.flash.message = 'Success! You are now registered and able to log in!';
                            break;
                        case 406:
                            this.flash.priority = 2;
                            this.flash.message = 'Failed to Register! Please Try Again.';
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
                    this.$refs.flash.showFlash();
                    this.switchCard();
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

                request.write(registerData);
                request.end();
            },
            toggleProcessing: function() {
                this.ui.processing = !this.ui.processing; // Toggle the processing tracker for the group
                this.toggleLoader();

            },
            toggleLoader: function() {
                this.ui.loading = !this.ui.loading; // Toggle the loading tracker for the group
            }
        }
    }
</script>

<style>
    @import url('~@/assets/css/access.css');
</style>
