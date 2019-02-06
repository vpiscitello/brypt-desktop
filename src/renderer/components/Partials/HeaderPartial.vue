<template>
    <header class="navigation sw">
        <div class="company">
            <!-- <img class="logo" src="./assets/img/small-line-logo.svg" alt=""> -->
            <h2 class="title">Brypt</h2>
        </div>
        <nav class="primary nv-m hd-m">
            <div class="cover">
                <div class="toggle" id="menu-toggle" @click="openMenu()"><span></span></div>
            </div>
            <div class="menu drsw sc">
                <ul class="sc mi">
                    <li>
                        <a href="#">Dashboard</a>
                    </li>
                    <li>
                        <a href="#">Profile</a>
                    </li>
                    <li>
                        <a href="#">Settings</a>
                    </li>
                    <li>
                        <a href="#">Logout</a>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
    export default {
        data () {
            return {
                electron: process.versions.electron,
                name: this.$route.name,
                node: process.versions.node,
                path: this.$route.path,
                platform: require('os').platform(),
                vue: require('vue/package.json').version
            }
        },
        methods: {
            open (link) {
                this.$electron.shell.openExternal(link)
            },
            openMenu() {
                var nav = document.getElementsByTagName('nav')[0];
                var overlay = document.getElementsByClassName('overlay')[0];

                if (nav.classList.contains('open-m')) {
                    this.closeMenuModule(overlay, nav);
                    // setTimeout(handleOverlay, overlay, nav, 1, 100);
                } else {
                    this.openMenuModule(overlay, nav);
                    // setTimeout(handleOverlay, 100, overlay, nav, 1);
                }
            },
            openMenuModule(overlay, nav) {
                // overlay.classList.remove('nd');
                nav.classList.remove('hd-m');
                setTimeout(function() {
                    nav.classList.remove('nv-m');
                    nav.classList.add('open-m');
                    // overlay.classList.remove('nv');
                }, 10, nav);
            },
            closeMenuModule(overlay, nav) {
                // overlay.classList.add('nv');
                nav.classList.add('nv-m');
                nav.classList.remove('open-m');
                setTimeout(function() {
                    nav.classList.add('hd-m');
                    // overlay.classList.add('nd');
                }, 400, nav);
            }
        }
    }
</script>

<style scoped>

</style>
