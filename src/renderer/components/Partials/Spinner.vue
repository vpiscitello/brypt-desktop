<template>
    <div class="loader">
        <div class="context">
            <div class="spinner">
                <svg width="10px" height="10px" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                    <circle :fill="color" cx="5" cy="5" r="5"></circle>
                </svg>
                <svg width="10px" height="10px" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                    <circle :fill="color" cx="5" cy="5" r="5"></circle></svg>
                <svg width="10px" height="10px" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                    <circle :fill="color" cx="5" cy="5" r="5"></circle>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'spinner',
        props: {
            // The color of the spinner elements
            color: {
                type: String,
                required: true
            }
        },
        methods: {

        }
    }
</script>

<style scoped>

</style>
