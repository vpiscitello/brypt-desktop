<template>
    <transition name="slide-in" appear>
        <div class="easter-egg" @click="close()">
            <img src="~@/assets/img/clippy-easter-egg.png" alt="">
        </div>
    </transition>
</template>

<script>
    // TODO: Transition
    export default {
        name: 'easter-egg',
        created: function() {
            setTimeout(function() {
                this.$store.dispatch('flipEgg');
            }.bind(this), 3000);
        },
        methods: {
            close: function() {
                this.$store.dispatch('flipEgg');
            }
        }
    }
</script>

<style scoped>
    .slide-in-enter-active, .slide-in-leave-active {
        /* transition: top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.25); */
        transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.05) all;
    }

    .slide-in-enter {
        bottom: -300px !important;
        right: -300px !important;
    }

    .slide-in-leave-to {
        bottom: -300px !important;
        right: -300px !important;
    }

    .slide-in-enter-to {
        bottom: -40px !important;
        right: 0 !important;
    }
    .easter-egg {
        position: absolute;
        bottom: -40px;
        right: 0;
        height: 200px;
        width: auto;
        z-index: 999999;
        transform: rotate(-30deg);
    }
    .easter-egg img {
        max-height: 100%;
        width: auto;
    }
</style>
