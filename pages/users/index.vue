<template>
    <v-row class="frame-content">
        <v-col cols="10" offset="1">
            <v-card class="my-3">
                <v-toolbar color="primary" dark>
                    Users
                    <v-spacer>
                    </v-spacer>
                    <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details>

                    </v-text-field>
                </v-toolbar>
                <v-card-text>
                    <v-alert v-if="alert.show" :type="alert.type">
                        {{ alert.message }}
                    </v-alert>
                    <div class="d-flex mb-4">
                        <v-breadcrumbs :items="breadcrumbs" class="pa-0" />
                        <v-spacer></v-spacer>
                        <v-btn to="/users/create" color="primary" elevation="3" small>
                            User <v-icon right>mdi-plus-circle</v-icon>
                        </v-btn>
                    </div>

                    <v-data-table :headers="headers" :items-per-page="10" :server-items-length="totalData"
                        :items="users" :options.sync="options" :search.sync="search" :loading="loading" :footer-props="{
                        itemsPerPageOptions: [10, 20, 30, 40, 50]
                    }">
                        <template v-slot:top>
                            <v-dialog v-model="dialogDelete" max-width="500px">
                                <v-card>
                                    <v-card-title>Kamu yakin mau hapus data {{ itemDelete.fullname }} ?</v-card-title>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" text @click="closeDelete">
                                            Cancel
                                        </v-btn>
                                        <v-btn color="primary" text @click="deleteConfirm(itemDelete.id)"
                                            :loading="loading">
                                            Delete
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>

                        <template v-slot:item.actions="{ item }">

                            <v-btn :to="`/users/edit/${item.id}`" icon>
                                <v-icon class="small">mdi-pencil</v-icon>
                            </v-btn>

                            <v-btn icon @click="deleteUser(item)">
                                <v-icon class="small">mdi-delete</v-icon>
                            </v-btn>

                        </template>
                    </v-data-table>

                </v-card-text>
            </v-card>
        </v-col>

    </v-row>
</template>


<script>

export default ({
    head: {
        title: 'User'
    },
    data() {
        return {
            alert: {
                show: false,
                type: "",
                message: "",
            },
            itemDelete: false,
            dialogDelete: false,
            loading: false,
            options: {},
            search: "",
            totalData: 0,
            users: [],
            headers: [
                { text: '#', value: "row", sortable: false },
                { text: 'Full Name', value: "fullname", sortable: false },
                { text: 'Email', value: "email", sortable: false },
                { text: 'Role', value: "role", sortable: false },
                { text: 'Status', value: "status", sortable: false },
                { text: '', value: "actions", sortable: false },
            ],
            breadcrumbs: [
                {
                    text: 'Home',
                    disable: false,
                    to: '/'
                },
                {
                    text: 'Users',
                    disable: true,
                    to: '/users'
                }
            ]
        }
    },
    methods: {
        fetchUsers() {
            const { page, itemsPerPage } = this.options
            this.loading = true
            // console.log(page, itemsPerPage);
            // console.log(this.search);
            this.$axios.$get(`/api/users?page=${page}&limit=${itemsPerPage}&search=${this.search}`).then((response) => {
                this.loading = false
                this.users = response.data
                this.totalData = response.paging.totalDocs
                // let startItem = (page -1) * itemsPerPage + 1

                let startItem = response.paging.pagingCounter

                this.users.map(user => user.row = startItem++)
            }).catch((error) => {
                this.loading = false
                console.log(error);
            })
        },
        deleteConfirm(id) {
            this.loading = true

            this.$axios.$delete(`/api/users/${id}`).then((response) => {
                this.loading = false
                this.users = this.users.filter(user => user.id !== id)
                this.$toast.success(response.message)
                let params = {
                    message: "DELETE_SUCCESS",
                    fullname: this.itemDelete.fullname,
                }
                this.showAlert(params)
                this.closeDelete()
            }).catch((error) => {
                this.loading = false
                this.$toast.error(error.response.data.errors)
                console.log(error);
            })
        },
        deleteUser(item) {
            this.itemDelete = item
            this.dialogDelete = true
        },
        closeDelete() {
            this.dialogDelete = false
        },
        showAlert(params) {
            if (params.message == "UPDATE_SUCCESS") {
                this.alert.show = true
                this.alert.type = "success"
                this.alert.message = this.$t(params.message, {
                    title: params.fullname,
                })
            }
            if (params.message == "CREATE_SUCCESS") {
                this.alert.show = true
                this.alert.type = "success"
                this.alert.message = this.$t(params.message, {
                    title: params.fullname,
                })
            }
            if (params.message == "DELETE_SUCCESS") {
                this.alert.show = true
                this.alert.type = "success"
                this.alert.message = this.$t(params.message, {
                    title: params.fullname,
                })
            }
            if (params.message == "ID_NOT_FOUND") {
                this.alert.show = true
                this.alert.type = "error"
                this.alert.message = this.$t(params.message)
            }
        }
    },

    watch: {
        options: {
            handler() {
                this.fetchUsers();
            },
            deep: true,
        },
        search: {
            handler() {
                this.fetchUsers();
            },
        }
    },
    mounted() {
        // this.fetchUsers()
        this.showAlert(this.$route.params)
    }
})
</script>