<template>
    <v-row>
        <v-col cols="10" offset="1">
            <v-card class="mb-2">
                <v-toolbar color="primary" dark>
                    Edit User
                </v-toolbar>
                <v-card-text>
                    <v-breadcrumbs :items="breadcrumbs" class="pa-0" />
                    <v-form ref="form" fast-fail @submit.prevent="onSubmit">
                        <v-text-field name="fullname" label="Full Name" type="text" v-model="form.fullname"
                            :rules="rules.fullname" />
                        <v-text-field name="email" label="Email" type="email" v-model="form.email" :rules="rules.email"
                            @keydown="checkEmailExists" />
                        <v-text-field name="password" label="Password" type="password" v-model="form.password"
                            :rules="rules.password" />
                        <v-text-field name="passwordConfirm" label="Confirm Password" type="password"
                            v-model="form.passwordConfirm" :rules="rules.passwordConfirm" />
                        <v-select v-model="form.role" :items="roles" label="Role" :rules="rules.role">

                        </v-select>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" type="submit" :loading="loading" :disabled="loading">
                                Edit
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>


<script>
export default ({
    middleware: ['authenticated'],
    head: {
        title: 'Edit User'
    },
    asyncData({ params }) {
        return {
            id: params.id
        }
    },
    data() {
        return {
            breadcrumbs: [
                { text: 'Users', to: "/users", disabled: false, exact: true },
                { text: 'Edit', disabled: true },
            ],
            loading: false,
            roles: ["employee", "cashier", "admin"],
            emailExists: false,
            form: {
                fullname: '',
                email: '',
                role: '',
                password: '',
                passwordConfirm: '',
            },
            rules: {
                fullname: [
                    v => !!v || this.$t("FIELD_REQUIRED", { field: "Full name" })
                ],
                email: [
                    v => !!v || this.$t("FIELD_REQUIRED", { field: "Email" }),
                    v => /.+@.+/.test(v) || this.$t("INVALID_EMAIL"),
                    v => !this.emailExists || this.$t("EMAIL_EXISTS")
                ],
                role: [
                    v => !!v || this.$t("FIELD_REQUIRED", { field: "Role" })
                ],
                password: [
                    v => v.length == 0 || !!v || this.$t("FIELD_REQUIRED", { field: "Password" }),
                    v => v.length == 0 || v.length >= 8 || this.$t("FIELD_MIN", { field: "Password", min: 8 }),
                ],
                passwordConfirm: [
                    v => v === this.form.password || this.$t("FIELD_CONFIRM", { field: "Password", confirm: "Confirm Password" }),
                ],
            },
        }
    },

    methods: {
        checkEmailExists() {
            this.emailExists = false
        },
        fetchData() {
            this.$axios.$get(`/api/users/${this.id}`).then(response => {
                this.form.fullname = response.data.fullname;
                this.form.email = response.data.email;
                this.form.role = response.data.role;
            }).catch(error => {
                if (error.response.data.status === false) {
                    this.$toast.error(error.response.data.errors)
                }
                this.$router.push({
                    name: "users___" + this.$i18n.locale,
                    params: { message: "ID_NOT_FOUND" }
                });
                this.loading = false
            })
        },
        async onSubmit() {
            const valid = await this.$refs.form.validate()
            if (valid) {
                // Buat objek untuk menyimpan hanya bidang yang diisi
                const dataToUpdate = {};
                // Periksa setiap bidang apakah diisi, jika iya, tambahkan ke dataToUpdate
                for (const key in this.form) {
                    if (this.form[key] !== '') {
                        dataToUpdate[key] = this.form[key];
                    }
                }

                console.log(dataToUpdate);
                this.loading = true
                this.$axios.$patch(`/api/users/${this.id}`, dataToUpdate)
                    .then(response => {
                        this.loading = false
                        this.$toast.success(response.message)
                        this.$router.push({
                            name: "users___" + this.$i18n.locale,
                            params: { message: "UPDATE_SUCCESS", fullname: this.form.fullname }
                        });
                    })
                    .catch(error => {
                        if (error.response.data.status === false && error.response.data.errors === "Email already exists") {
                            this.emailExists = true
                            this.$refs.form.validate()
                            this.$toast.error(error.response.data.errors)
                        } else if (error.response.data.status === false) {
                            this.$toast.error(error.response.data.errors)

                        } else {
                            this.$toast.error(error.response.data.errors)
                        }

                        this.loading = false
                    })
            }

        },

    },
    mounted() {
        this.fetchData()
    }

})
</script>