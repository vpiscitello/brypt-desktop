<template>
    <div id="wrapper">
        <HeaderPartial></HeaderPartial>
        <main>
            <article class="access">
                <section class="login">
                    <div class="box sw mc sg">
                        <div class="wrapper">
                            <div class="header" @click="test()">
                                <h2>Sign In</h2>
                                <!-- <img class="icon" src="./assets/img/ufo-abduct-cow-simple-black.svg" alt=""> -->
                            </div>
                            <form action="" name="login">
                                <fieldset class="username">
                                    <input type="text" name="username" required="" placeholder="Username">
                                </fieldset>
                                <fieldset class="password">
                                    <input type="password" name="password" required="" placeholder="Password">
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
                            <form action="javascript:;" onsubmit="register()" method="post" name="register">
                                <div class="name">
                                    <fieldset class="FirstName">
                                        <input type="text" name="first_name" required="" placeholder="First Name">
                                    </fieldset>
                                    <fieldset class="LastName">
                                        <input type="text" name="last_name" required="" placeholder="Last Name">
                                    </fieldset>
                                </div>
                                <fieldset class="UserName">
                                    <input type="text" name="username" required="" placeholder="Username">
                                </fieldset>
                                <fieldset class="Email">
                                    <input type="text" name="email" required="" placeholder="Email">
                                </fieldset>
                                <fieldset class="UserPassword">
                                    <input type="password" name="password" required="" placeholder="Password">
                                </fieldset>
                                <fieldset class="Region">
                                    <input type="text" name="Region" required="" placeholder="Region">
                                </fieldset>
                                <fieldset class="Birthday">
                                    <input type="date" name="Birthday" required="">
                                </fieldset>
                                <fieldset class="submit">
                                    <button id="register" type="submit" name="register">
                                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                                    </button>
                                </fieldset>
                            </form>
                            <div class="footer">

                            </div>
                        </div>
                    </div>
                </section>

                <div id="chg-action" class="frnt" >
                    <button type="button" name="chg" @click="switchCard()">{{inactiveCard}}</button>
                </div>

            </article>

        </main>
    </div>
</template>

<script>
    import CryptoInterface from "../../crypto/crypto"

    import HeaderPartial from './Partials/HeaderPartial'

    export default {
        name: 'access-page',
        components: { HeaderPartial },
        data: function() {
            return {
                activeCard: "login",
                inactiveCard: "register"
            };
        },
        methods: {
            open (link) {
                this.$electron.shell.openExternal(link)
            },
            test () {
                CryptoInterface.encrypt("Pineapple", "01234567890123456789012345678901");
                // CryptoInterface.decrypt();
            },
            switchCard() {
                var active = document.getElementsByClassName(this.activeCard)[0];
                var inactive = document.getElementsByClassName(this.inactiveCard)[0];

                inactive.classList.add('lft-open');
                active.classList.add('rgt-open');

                var tmpCard = this.inactiveCard;
                this.inactiveCard = this.activeCard;
                this.activeCard = tmpCard;

                setTimeout(function() {
                    active.classList.remove('bck');
                    inactive.classList.add('bck');
                    setTimeout(function() {
                        inactive.classList.remove('lft-open');
                        active.classList.remove('rgt-open');
                    }, 10);
                }, 450);
            },
            login() {
                // window.location.href = './dashboard';
                console.log(this.$router);
                this.$router.push('dashboard');
            },
            register() {
                alert( "Register..." );
            }
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,200i,300,300i,400,400i,600,600i,700,700i,900,900i');
    @import url('https://fonts.googleapis.com/css?family=Chivo:400,700,900');
    /* @import url('~@/assets/assets/BebasNeueBold.otf'); */
    @import url('https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css');
    @import url('~@/assets/css/base.css');
    @import url('~@/assets/css/access.css');
</style>
