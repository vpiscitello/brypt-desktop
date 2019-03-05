<template>
    <div class="loader">
        <div class="context">
            <div class="pulser">
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 120 120" style="enable-background:new 0 0 120 120;" xml:space="preserve">
                    <g>
                        <path :fill="color" class="tower"d="M11.1,27.2v63.9c0,1.8,0.9,3.5,2.5,4.5l15.4,10c1.8,1.1,4.2-0.1,4.2-2.3V10c0-2.4-2.8-3.6-4.5-1.9L12.8,23.3 C11.7,24.3,11.1,25.8,11.1,27.2z" trasnform="translate(50% 50%)"/>
                        <path :fill="color" class="tower" d="M39.3,61.6V102c0,1.1,0.7,2.2,1.8,2.8l11.7,6.3c1.3,0.8,3.1-0.1,3.1-1.4V50.6c0-1.5-2.2-2.3-3.4-1.2l-12,9.7 C39.7,59.8,39.3,60.6,39.3,61.6z"/>
                        <path :fill="color" class="tower" d="M80.5,61.6V102c0,1.1-0.8,2.2-1.9,2.8l-12,6.3c-1.4,0.8-3.2-0.1-3.2-1.4V50.6c0-1.5,2.2-2.3,3.5-1.2l12.3,9.7 C80,59.8,80.5,60.6,80.5,61.6z"/>
                        <path :fill="color" class="tower" d="M108.8,27.2v63.9c0,1.8-0.9,3.5-2.5,4.5l-15.4,10c-1.8,1.1-4.2-0.1-4.2-2.3V10c0-2.4,2.8-3.6,4.5-1.9 L107,23.4C108.1,24.3,108.8,25.8,108.8,27.2z"/>
                    </g>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'pulser',
        props: {
            color: {
                type: String,
                required: true
            }
        }
    }
</script>

<style scoped>
    .loader .context {
        height: 120px;
        width: 120px;
    }

    .pulser {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    svg {
      height: 320px;
    }

    .tower {
      opacity: 0.4;
      transform: scale(0.95);
      transform-origin: center center;
    }

    .tower:nth-of-type(1) {
      animation: pulse 2000ms 0ms linear infinite;
    }

    .tower:nth-of-type(2) {
      animation: pulse 2000ms 200ms linear infinite;
    }
    .tower:nth-of-type(3) {
      animation: pulse 2000ms 400ms linear infinite;
    }

    .tower:nth-of-type(4) {
      animation: pulse 2000ms 600ms linear infinite;
    }

    @keyframes pulse {
      0% {
        opacity: 0.4;
      }
      5% {
    /*     transform: scale(0.98); */
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
      95% {
    /*     transform: scale(0.98); */
      }
      100% {
        opacity: 0.4;
      }
    }
</style>
