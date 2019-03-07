<template>
    <div class="item-ctx-menu" v-bind:id="id" v-click-outside="onClickOutside">
        <ul v-if="itemIsBranching">
            <li class="option" v-for="option in branchOptions" @click="optionClicked(option)">
                {{ option.name }}
            </li>
        </ul>
        <ul v-else>
            <li class="option" v-for="option in leafOptions" @click="optionClicked(option)">
                {{ option.name }}
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'item-context-menu',
        props: {
            // The element id of the context menu
            id: {
                type: String,
                required: true
            },
            // The supplied array of possible actions
            options: {
                type: Array,
                required: true
            }
        },
        data: function() {
            return {
                item: null, // The item that the context menu is operating on
                menuWidth: null, // The calculated width of the menu
                menuHeight: null, // The calculated height of the menu
                itemIsBranching: false // A boolean value set when the item is a coordinator
            };
        },
        computed: {
            // The options available to a leaf node
            leafOptions: function() {
                // Filter out options that need a branching node
                return this.options.filter((opt) => {
                    return !opt.requiresCordinator;
                });
            },
            // The options available to a branch node
            branchOptions: function() {
                return this.options;
            }
        },
        methods: {
            showMenu: function(event, item) {
                // console.log('Show Menu');

                this.item = item; // Store the item being operated on

                // Set and Update the context menu based on the designation of the item
                this.itemIsBranching = (this.item.designation == 'node') ? false : true;

                // After the DOM has been updated display the context menu
                this.$nextTick(() => {
                    // Select the context menu and return if it does not exist
                    let menu = document.getElementById(this.id);
                    if (!menu) {
                        return;
                    }

                    // Compute the width of the menu if it has not been set
                    if (!this.menuWidth || !this.menuHeight) {
                        menu.style.visibility = 'hidden';
                        menu.style.display = 'block';
                        this.menuWidth = menu.offsetWidth;
                        this.menuHeight = menu.offsetHeight;
                        menu.removeAttribute('style');
                    }

                    let parentRect = this.$parent.$el.getBoundingClientRect();

                    // Set the X postion of the menu based on the item and page position
                    if ((this.menuWidth + event.pageX) >= parentRect.width) {
                        menu.style.left = (event.pageX - parentRect.x - this.menuWidth + 2) + 'px';
                    } else {
                        menu.style.left = (event.pageX - parentRect.x - 2) + 'px';
                    }

                    // Set the Y postion of the menu based on the item and page position
                    if ((this.menuHeight + event.pageY) >= window.innerHeight) {
                        menu.style.top = (event.pageY - parentRect.y - this.menuHeight + 2) + 'px';
                    } else {
                        menu.style.top = (event.pageY - parentRect.y - 2) + 'px';
                    }

                    menu.classList.add('active'); // Display the menu
                });
            },
            hideMenu: function() {
                // console.log('Hide Menu');
                let element = document.getElementById(this.id); // Get the menu
                if (element) {
                    element.classList.remove('active'); // Hide the menu
                }
            },
            optionClicked: function(option) {
                this.hideMenu();
                this.$emit(option.event, this.item); // Notify the parent of a selected option
            },
            onClickOutside: function() {
                this.hideMenu();
            }
        }
    }

</script>

<style scoped>

</style>
