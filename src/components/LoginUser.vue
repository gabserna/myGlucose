<template>
  <v-card
    :class="{
      'login-xs': $vuetify.breakpoint.xs,
      'login-xl': $vuetify.breakpoint.xl,
    }"
    class="mx-auto mt-12 pa-6"
    max-width="400"
  >
    <h2 class="mb-4 text-center">Iniciar sesión</h2>

    <v-text-field
      v-model="password"
      label="Contraseña"
      :type="showPassword ? 'text' : 'password'"
      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      outlined
      @click:append="showPassword = !showPassword"
      @keyup.enter="login"
    />

    <v-btn color="primary" block @click="login"> Entrar </v-btn>

    <v-alert v-if="error" type="error" dense class="mt-4">
      Contraseña incorrecta
    </v-alert>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      password: "",
      showPassword: false,
      error: false,
    };
  },

  methods: {
    /**
     * Convierte un texto en un hash SHA-256.
     *
     * @param {String} text Contraseña escrita por el usuario.
     * @returns {Promise<String>} Hash hexadecimal.
     */
    async sha256(text) {
      const encoder = new TextEncoder();

      const data = encoder.encode(text);

      const hash = await crypto.subtle.digest("SHA-256", data);

      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    },
    async login() {
      const hash = await this.sha256(this.password);

      if (hash === process.env.VUE_APP_PASSWORD_HASH) {
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("authenticatedAt", Date.now());
        this.$emit("login-success");
      } else {
        this.error = true;
      }
    },
  },
};
</script>

<style scoped>
.login-xs {
  min-height: 75vh;
}

.login-xl {
  min-height: 80vh;
}
</style>
