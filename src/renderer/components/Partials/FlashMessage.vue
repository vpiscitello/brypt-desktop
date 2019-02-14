<template>
    <transition name="slide-down" appear>
        <div v-if="show" v-bind:class="alertClass">
            <div class="context">
                <div class="header" v>
                    <i v-if="urgency > 0" class="fas fa-exclamation"></i>
                    <i v-else class="far fa-envelope"></i>
                </div>
                <div class="content">
                    <p class="data">{{ message }}</p>
                </div>
                <div class="footer">
                    <button class="sc" type="button" name="close" v-on:click="closeFlash">
                        <i class="far fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: 'flash-message',
        props: {
            message: {
                type: String,
                required: true
            },
            urgency: {
                type: Number,
                default: 0
            }
        },
        data: function() {
            return {
                show: false
            };
        },
        computed: {
            alertClass: function() {
                let alertClass = "";
                switch (this.urgency) {
                    case 2:
                        alertClass = "danger";
                        break;
                    case 1:
                        alertClass = "warning";
                        break;
                    default:
                        alertClass = "basic";
                        break;
                }
                return alertClass;
            }
        },
        methods: {
            showFlash: function() {
                this.show = true;
            },
            closeFlash: function() {
                this.show = false;
                this.$root.$emit("flash-closed");
            }
        }
    }
</script>

<style scoped>
    #flash-message {
        position: absolute;
        top: 120px;
        height: 50px;
        width: 80vw;
        min-width: 360px;
        max-width: 420px;
        margin: 0 auto;
        background: #FBFBFB;
        border-radius: 8px;
        box-shadow: 2px 8px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000000;
        overflow: hidden;
    }

    .slide-down-enter-active, .slide-down-leave-active {
        transition: opacity 0.4s ease, top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.25);
    }

    .slide-down-enter {
        opacity: 0 !important;
        top: 0px !important;
    }

    .slide-down-leave-to {
        opacity: 0 !important;
    }

    .slide-down-enter-to {
        opacity: 1;
        top: 120px;
    }

    #flash-message .context {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        overflow: hidden;
    }

    #flash-message .context .header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 0 1 60px;
        height: 100%;
        width: 60px;
        padding: 8px;
        color: #FBFBFB;
        font-size: 18px;
    }

    #flash-message.basic .context .header {
        background: rgb(26, 204, 148);
        background: linear-gradient(to top right, rgb(26, 204, 148) 0%, rgb(126, 238, 203) 100%);
    }

    #flash-message.warning .context .header {
        background: #FFB75E;
        background: -webkit-linear-gradient(to top right, #ED8F03, #FFB75E);
        background: linear-gradient(to top right, #ED8F03, #FFB75E);
    }

    #flash-message.danger .context .header {
        background: #E74C3C;
    }

    #flash-message .context .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
        padding: 8px 24px;

    }

    #flash-message .context .footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 60px;
        margin-left: auto;
        padding: 8px;
    }

    #flash-message .footer button {
        height: 100%;
        width: 100%;
        padding: 0;
        color: #4a5c62;
        font-size: 16px;
        opacity: 0.6;
        background: transparent;
    }
</style>
