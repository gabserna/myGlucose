<template>
  <v-app style="margin-top: 0; padding-top: 0">
    <main class="content">
      <login-user v-if="!authenticated" @login-success="authenticated = true" />
      <template v-else>
        <div id="app">
          <div class="header-row mt-0">
            <h1 class="text-center my-2">Mi Glucosa</h1>
          </div>
          <div class="switch-container">
            <span class="theme-toggle" @click="darkMode = !darkMode">
              {{ darkMode ? "☀️" : "🌙" }}
            </span>
            <v-btn icon @click="logout">
              <v-icon> mdi-logout </v-icon>
            </v-btn>
          </div>
        </div>

        <v-tabs v-model="tab" fixed-tabs dark>
          <v-tab>
            <v-icon>mdi-clipboard-text-outline</v-icon>
          </v-tab>

          <v-tab>
            <v-icon>mdi-history</v-icon>
          </v-tab>

          <v-tab>
            <v-icon>mdi-chart-line</v-icon>
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item eager>
            <RegistroDatos />
          </v-window-item>

          <v-window-item eager>
            <PromedioDiario />
          </v-window-item>

          <v-window-item eager>
            <GlucoseChart />
          </v-window-item>
        </v-window>
      </template>
    </main>
    <template>
</template>
    <v-footer dark class="redBlood text-caption d-flex justify-end">
      <div>
        <i>®gabserna&nbsp;{{ currentYear }}</i>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import LoginUser from "@/components/LoginUser.vue";
import RegistroDatos from "@/components/RegistroDatos.vue";
import PromedioDiario from "@/components/PromedioDiario.vue";
import GlucoseChart from "@/components/GlucoseChart.vue";

export default {
  name: "App",
  components: {
    LoginUser,
    RegistroDatos,
    PromedioDiario,
    GlucoseChart,
  },
  data() {
    return {
      darkMode: false,
      tab: 0,
      authenticated: false,
    };
  },
  watch: {
    darkMode(val) {
      this.$vuetify.theme.dark = val;
      document.body.classList.toggle("dark", val);
      localStorage.setItem("darkMode", val);
    },
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
    currentYear() {
      return new Date().getFullYear();
    },
  },
  mounted() {
    // Recupera el tema guardado
    this.darkMode = localStorage.getItem("darkMode") === "true";

    // Obtiene la fecha en la que inició sesión
    const authenticatedAt = Number(localStorage.getItem("authenticatedAt"));

    // 24 horas en milisegundos
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // Si existe una sesión y aún no expira, permite el acceso
    if (
      localStorage.getItem("authenticated") === "true" &&
      authenticatedAt &&
      Date.now() - authenticatedAt < ONE_DAY
    ) {
      this.authenticated = true;
    } else {
      // Si expiró o no existe, limpia la sesión
      localStorage.removeItem("authenticated");
      localStorage.removeItem("authenticatedAt");

      this.authenticated = false;
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("authenticated");
      localStorage.removeItem("authenticatedAt");
      this.authenticated = false;
    },
  },
};
</script>

<style>
.content {
  flex: 1;
}
.app-content {
  min-height: 70vh;
}

@media (max-width: 600px) {
  .app-content {
    min-height: 82vh;
  }
}

@media (min-width: 1904px) {
  .app-content {
    min-height: 88vh;
  }
}
body {
  background-color: #fff;
  color: #121212;
  font-family: "Roboto", sans-serif;

  @media (max-width: 600px) {
    margin: 0;
    padding: 0;
  }
}

body.dark {
  background-color: #121212;
  color: #e0e0e0;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: 4rem;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.header-row h3,
.header-row h2 {
  margin: 0;
}

.theme-toggle {
  cursor: pointer;
  font-size: 1.8rem;
  user-select: none;
  transition: transform 0.2s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}
.redBlood {
  background-color: #d000005c !important;
  color: #fff !important;
}
</style>
