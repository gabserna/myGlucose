<template>
  <v-row class="my-6">
    <v-col cols="12" md="6" offset-md="3">
      <v-card class="pa-6" elevation="8" rounded="xl">
        <h1 class="mb-4">Registro de Datos</h1>
        <v-text-field
          v-model="glucosa"
          class="glucosa-input"
          label="Ingresa el valor"
          type="number"
          outlined
          clearable
          prepend-inner-icon="mdi-water"
          hint="numeros solamente"
          persistent-hint
          inputmode="numeric"
          @keyup.enter="guardarRegistro"
        />
        <v-btn
          color="success"
          large
          block
          rounded
          elevation="2"
          :disabled="glucosa === null || glucosa === ''"
          @click="guardarRegistro"
        >
          Guardar
        </v-btn>
      </v-card>
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
        {{ mensaje }}
        <template #action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-col>
    <v-col cols="12" md="8" offset-md="2">
      <v-card class="mt-4" elevation="8" rounded="xl">
        <v-card-title> Historial de registros </v-card-title>

        <v-data-table
          :headers="headers"
          :items="registros"
          :items-per-page="10"
          class="elevation-0"
        >
          <template v-slot:[`item.estado`]="{ item }">
            <div class="d-flex align-center">
              <span
                class="estado-bullet mr-2"
                :style="{
                  backgroundColor: item.color,
                }"
              ></span>

              {{ item.estado }}
            </div>
          </template>
        </v-data-table>
      </v-card>
      <v-btn
        class="mt-4"
        color="error"
        outlined
        :disabled="!registros.length"
        @click="abrirDialogReset"
      >
        Reiniciar registros
      </v-btn>
      <v-dialog v-model="dialogReset" max-width="500">
        <v-card>
          <v-card-title>
            <v-icon color="error" class="mr-2"> mdi-alert-circle </v-icon>
            Confirmar eliminación
          </v-card-title>
          <v-card-text>
            Se eliminará{{ registros.length > 1 ? "n" : "" }}
            <strong>
              {{ registros.length }}
            </strong>
            registro{{ registros.length > 1 ? "s" : "" }}. <br />Esta acción no
            se puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="dialogReset = false"> Cancelar </v-btn>
            <v-btn color="error" text @click="confirmarReset"> Eliminar </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import {
  crearRegistro,
  obtenerRegistros,
  eliminarTodosLosRegistros,
} from "../services.js";

export default {
  name: "RegistroDatos",

  data() {
    return {
      glucosa: null,
      snackbar: false,
      mensaje: "",
      snackbarColor: "success",
      registros: [],
      dialogReset: false,
      headers: [
        {
          text: "Fecha",
          value: "fecha",
        },
        {
          text: "Glucosa",
          value: "value",
        },
        {
          text: "Estado",
          value: "estado",
        },
      ],
    };
  },
  async mounted() {
    await this.cargarRegistros();
  },
  methods: {
    async guardarRegistro() {
      if (this.glucosa === null || this.glucosa === "") {
        return;
      }
      const valor = Number(this.glucosa);
      if (Number.isNaN(valor)) {
        this.snackbarColor = "error";
        this.mensaje = "Valor inválido";
        this.snackbar = true;
        return;
      }
      if (!Number.isInteger(valor)) {
        this.snackbarColor = "error";
        this.mensaje = "Solo se permiten números enteros";
        this.snackbar = true;
        return;
      }
      if (valor < 20 || valor > 600) {
        this.snackbarColor = "error";
        this.mensaje = "El valor debe estar entre 20 y 600";
        this.snackbar = true;
        return;
      }
      const clasificacion = this.clasificarGlucosa(valor);
      const registro = {
        timestamp: new Date().toISOString(),
        value: valor,
        estado: clasificacion.estado,
      };
      try {
        await crearRegistro(registro);

        this.snackbarColor = this.obtenerColorGlucosa(valor);
        this.mensaje = `${clasificacion.estado}: ${clasificacion.mensaje}`;
        this.snackbar = true;
        this.glucosa = null;
        await this.cargarRegistros();
      } catch (error) {
        console.error("Error guardando registro:", error);

        this.snackbarColor = "error";
        this.mensaje = error.message || "Error al guardar el registro";
        this.snackbar = true;
      }
    },
    /**
     * Clasifica un valor de glucosa
     * @param {number} glucosa
     * @returns {object}
     */
    clasificarGlucosa(glucosa) {
      if (glucosa < 70) {
        return {
          estado: "Baja",
          color: "#ffba08",
          mensaje: "Posible hipoglucemia",
        };
      }

      if (glucosa <= 120) {
        return {
          estado: "Normal",
          color: "#38b000",
          mensaje: "Dentro del rango normal",
        };
      }

      if (glucosa <= 180) {
        return {
          estado: "Elevada",
          color: "#f48c06",
          mensaje: "Glucosa elevada",
        };
      }

      if (glucosa <= 250) {
        return {
          estado: "Alta",
          color: "#dc2f02",
          mensaje: "Nivel alto de glucosa",
        };
      }

      return {
        estado: "Muy alta",
        color: "#d00000",
        mensaje: "Requieres revisión médica",
      };
    },

    /**
     * Obtiene el color según la clasificación
     * @param {number} glucosa
     * @returns {string}
     */
    obtenerColorGlucosa(glucosa) {
      return this.clasificarGlucosa(glucosa).color;
    },
    async cargarRegistros() {
      try {
        const registros = await obtenerRegistros();

        this.registros = registros.map((registro) => ({
          ...registro,
          fecha: this.formatearFecha(registro.timestamp),
          color: this.obtenerColorGlucosa(registro.value),
        }));
      } catch (error) {
        console.error("Error cargando registros:", error);

        this.snackbarColor = "error";
        this.mensaje = "Error obteniendo registros";
        this.snackbar = true;
      }
    },
    formatearFecha(timestamp) {
      const fecha = new Date(timestamp);

      return fecha.toLocaleString("es-MX");
    },
    abrirDialogReset() {
      if (!this.registros.length) {
        this.mensaje = "No hay registros para eliminar";
        this.snackbarColor = "warning";
        this.snackbar = true;

        return;
      }

      this.dialogReset = true;
    },
    //resetear registros
    async confirmarReset() {
      this.dialogReset = false;

      try {
        await eliminarTodosLosRegistros();

        this.registros = [];

        this.mensaje = "Todos los registros fueron eliminados";
        this.snackbarColor = "success";
        this.snackbar = true;

        await this.cargarRegistros();
      } catch (error) {
        console.error("Error eliminando registros:", error);

        this.snackbarColor = "error";
        this.mensaje = error.message || "Error eliminando registros";
        this.snackbar = true;
      }
    },
  },
};
</script>

<style>
body {
  padding: 1rem 2rem;
  margin: 0 2rem;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.estado-bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.glucosa-input .v-input__icon--prepend-inner .v-icon {
  color: #ff0000 !important;
}
</style>
