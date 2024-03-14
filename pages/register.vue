<template>
    <v-row>
        <v-col cols="10" offset="1" md="4" offset-md="4">
            <v-card class="mb-2">
                <v-toolbar color="primary" dark>
                    Register
                </v-toolbar>
                <v-card-text>
                    <v-form ref="form" fast-fail @submit.prevent="onSubmit">

                        <v-text-field name="fullname" label="Full Name" type="text" v-model="form.fullname"
                            :rules="rules.fullname" />
                        <v-text-field name="email" label="Email" type="email" v-model="form.email"
                            :rules="rules.email" />
                        <v-text-field name="password" label="Password" type="password" v-model="form.password"
                            :rules="rules.password" />
                        <v-text-field name="passwordConfirm" label="Confirm Password" type="password"
                            v-model="form.passwordConfirm" :rules="rules.passwordConfirm" />

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" type="submit" :loading="loading" :disabled="loading">
                                Register
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
            <p>Already have account? <v-btn to="/login" plain>login</v-btn></p>
        </v-col>
    </v-row>
</template>


<script>
export default ({
    middleware: ['unauthenticated'],
    head: {
        title: 'Register'
    },
    data() {
        return {
            loading: false,
            form: {
                fullname: '',
                email: '',
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
                ],
                password: [
                    v => !!v || this.$t("FIELD_REQUIRED", { field: "Password" }),
                    v => v?.length >= 8 || this.$t("FIELD_MIN", { field: "Password", min: 8 }),
                ],
                passwordConfirm: [
                    v => !!v || this.$t("FIELD_REQUIRED", { field: "Confirm Password" }),
                    v => v === this.form.password || this.$t("FIELD_CONFIRM", { field: "Password", confirm: "Confirm Password" }),
                ],
            },
        }
    },

    methods: {
        async onSubmit() {
            const valid = await this.$refs.form.validate()
            if (valid) {
                this.loading = true
                this.$axios.$post('/api/auth/register', this.form)
                    .then(response => {
                        this.loading = false
                        this.$toast.success(response.message)
                        this.$router.push("/login");
                        this.$refs.form.reset()
                    })
                    .catch(error => {

                        if (error.response && error.response.data.status === false) {
                            console.log("Bad request:", error.response.data);
                            this.$toast.error(error.response.data.errors)
                        } else {
                            console.log("Other error occurred:", error.message);
                            this.$toast.error("An error occurred. Please try again later.");
                        }
                        this.loading = false
                        this.$refs.form.reset()
                    })

                    ;

            }

        },

    }

})
</script>