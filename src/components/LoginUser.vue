<template>
  <v-card
    class="mx-auto mt-12 pa-6"
    max-width="400"
  >
    <h2 class="mb-4 text-center">
      Iniciar sesión
    </h2>

    <v-text-field
      v-model="password"
      label="Contraseña"
      type="password"
      outlined
      @keyup.enter="login"
    />

    <v-btn
      color="primary"
      block
      @click="login"
    >
      Entrar
    </v-btn>

    <v-alert
      v-if="error"
      type="error"
      dense
      class="mt-4"
    >
      Contraseña incorrecta
    </v-alert>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      password: "",
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

      const hash = await crypto.subtle.digest(
        "SHA-256",
        data
      );

      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    },

    /**
     * Compara el hash generado con el hash almacenado
     * en la variable de entorno.
     */
    async login() {
      const hash = await this.sha256(this.password);

      if (
        hash === process.env.VUE_APP_PASSWORD_HASH
      ) {
        localStorage.setItem(
          "authenticated",
          "true"
        );

        this.$emit("login-success");
      } else {
        this.error = true;
      }
    },
  },
};
</script>