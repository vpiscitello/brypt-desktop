<template>
    <div v-bind:id="id" class="nd-container" v-bind:style="{ minHeight: containerHeight + 'px' }">
        <h4>{{ title }}</h4>
        <transition name="fade" appear mode="out-in">
            <spinner v-if="ui.loading" v-bind:color="'#2D383C'"></spinner>
            <div v-else class="nd-group" v-bind:style="{ minHeight: groupHeight + 'px' }">
                <node-item
                     v-for="(node, index) in nodes"
                     v-bind:key="node.uid"
                     v-bind:node="node"
                     v-bind:class="{last: index == nodes.length - 1}">
                </node-item>
            </div>
        </transition>
    </div>
</template>

<script>
    import Spinner from '../Partials/Spinner'
    import NodeItem from './NodeItem'

    export default {
        name: 'node-container',
        components: { Spinner, NodeItem },
        props: {
            id: {
                type: String,
                required: true
            },
            // The title of the node group
            title: {
                type: String,
                required: true
            },
            // The array of nodes in the group
            nodes: {
                type: Array,
                required: true
            },
            // Defines whether or not the group needs an async loading spinner
            needSpinner: {
                type: Boolean,
                required: true
            }
        },
        data: function() {
            return {
                ui: {
                    loading: true // A boolean value tracking the updating state of the group
                }
            };
        },
        computed: {
            // The total height of items in the group
            groupHeight: function() {
                return (60 * this.nodes.length);
            },
            containerHeight: function() {
                return (this.groupHeight + 30);
            }
        },
        methods: {
            toggleLoader: function() {
                this.ui.loading = !this.ui.loading; // Toggle the loading tracker for the group
            }
        }
    }
</script>

<style scoped>

</style>
