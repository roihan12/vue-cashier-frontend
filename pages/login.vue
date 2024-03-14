<template>
    <v-row>
        <v-col cols="10" offset="1" md="4" offset-md="4">
            <v-card class="mb-2">
                <v-toolbar color="primary" dark>
                    Login
                </v-toolbar>
                <v-card-text>

                    <v-alert color="red lighten-2" dark v-if="isError">
                        {{ $t(message) }}
                    </v-alert>
                    <v-form ref="form" fast-fail @submit.prevent="onSubmit">


                        <v-text-field name="email" label="Email" type="email" v-model="form.email"
                            :rules="rules.email" />
                        <v-text-field name="password" label="Password" type="password" v-model="form.password"
                            :rules="rules.password" />

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" type="submit" :loading="loading" :disabled="loading">
                                Login
                            </v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
            <p>You don't have account? <v-btn to="/register" plain>Register</v-btn></p>

        </v-col>
    </v-row>
</template>

<script>

import { mapMutations } from 'vuex'

export default ({
    middleware: ['unauthenticated'],
    head: {
        title: 'Login'
    },
    data() {
        return {
            loading: false,
            isError: false,
            message: "",
            form: {
                email: '',
                password: '',
            },
            rules: {
                email: [
                    v => !!v || 'Email is Required',
                    v => /.+@.+/.test(v) || 'Email invalid'
                ],
                password: [
                    v => !!v || 'Password is Required',
                ],
            },
        }
    },

    methods: {
        ...mapMutations('auth', {
            setFullname: "setFullname",
            setAccessToken: "setAccessToken",
            setRefreshToken: "setRefreshToken",
        }),
        storeWelcomeScreen() {
            localStorage.setItem('welcomeScreen', true);
        },
        async onSubmit() {
            const valid = await this.$refs.form.validate()
            if (valid) {
                this.loading = true
                this.$axios.$post('/api/auth/login', this.form)
                    .then(response => {
                        this.$toast.success(response.message)
                        this.$refs.form.reset()

                        if (!localStorage.welcomeScreen) {
                            this.storeWelcomeScreen()
                        }

                        this.setFullname(response.data.fullname)
                        this.setAccessToken(response.accessToken)
                        this.setRefreshToken(response.refreshToken)
                        this.$router.push("/dashboard");
                    })
                    .catch(error => {
                        this.isError = true
                        if (error.response && error.response.data.status === false) {
                            const errorMessage = error.response.data.errors
                            this.$toast.error(errorMessage)
                            this.message = errorMessage
                        } else {
                            this.$toast.error("An error occurred. Please try again later.");
                        }

                        this.loading = false
                    });
            }

        },

    },
    mounted() {
        if (this.$route.params.message == 'AUTH_REQUIRED') {
            this.message = this.$route.params.message
            this.isError = true
        }
    }

})
</script>