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
          :disabled="
            glucosa === null || glucosa === '' || isNaN(Number(glucosa))
          "
          @click="guardarRegistro"
        >
          Guardar
        </v-btn>
      </v-card>
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
        {{ mensaje }}
        <template v-slot:action="{ attrs }">
          <v-btn icon v-bind="attrs" @click="snackbar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-col>

    <!-- Grafica -->
    <v-col cols="12" md="8" offset-md="2">
      <v-card class="mt-4 pa-4 chart-card" elevation="8" rounded="xl">
        <v-card-title class="text-center justify-center">
          Historial
        </v-card-title>
        <v-card-text>
          <div class="chart-wrapper">
            <canvas ref="graficaGlucosa"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Tabla de registros -->
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
          <!-- Botón eliminar -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn icon color="error" @click="abrirDialogEliminar(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
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
      <!-- confirmar eliminar registro individual -->
      <v-dialog v-model="dialogEliminar" max-width="400">
        <v-card>
          <v-card-title class="text-h6"> ¿Eliminar registro? </v-card-title>
          <v-card-text> Esta acción no se puede deshacer. </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="dialogEliminar = false"> Cancelar </v-btn>
            <v-btn color="error" text @click="confirmarEliminar">
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { Chart } from "chart.js";
import {
  crearRegistro,
  obtenerRegistros,
  eliminarTodosLosRegistros,
  eliminarRegistro,
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
      chartInstance: null,
      registroAEliminar: null,
      dialogEliminar: false,
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
        {
          text: "Borrar",
          value: "actions",
          sortable: false,
        },
      ],
    };
  },
  async mounted() {
    await this.cargarTodo();
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
        await this.cargarTodo();
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
      }
    },
    async cargarTodo() {
      await this.cargarRegistros();
      this.$nextTick(() => {
        this.dibujarGrafica();
      });
    },
    formatearFecha(timestamp) {
      const fecha = new Date(timestamp);
      return fecha.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
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
    async confirmarReset() {
      this.dialogReset = false;

      try {
        await eliminarTodosLosRegistros();

        this.registros = [];

        this.mensaje = "Todos los registros fueron eliminados";
        this.snackbarColor = "success";
        this.snackbar = true;

        await this.cargarTodo();
      } catch (error) {
        console.error("Error eliminando registros:", error);

        this.snackbarColor = "error";
        this.mensaje = error.message || "Error eliminando registros";
        this.snackbar = true;
      }
    },
    dibujarGrafica() {
      const backgroundZones = {
        beforeDraw: (chart) => {
          const ctx = chart.chart.ctx;
          const chartArea = chart.chartArea;
          const yScale = chart.scales["y-axis-0"];
          const zonas = [
            { from: 0, to: 70, color: "rgba(255, 186, 8, 0.15)" }, // baja
            { from: 70, to: 120, color: "rgba(56, 176, 0, 0.10)" }, // normal
            { from: 120, to: 180, color: "rgba(244, 140, 6, 0.12)" }, // elevada
            { from: 180, to: 250, color: "rgba(220, 47, 2, 0.12)" }, // alta
            { from: 250, to: 600, color: "rgba(208, 0, 0, 0.10)" }, // muy alta
          ];

          zonas.forEach((zona) => {
            const yTop = yScale.getPixelForValue(zona.to);
            const yBottom = yScale.getPixelForValue(zona.from);

            ctx.fillStyle = zona.color;
            ctx.fillRect(
              chartArea.left,
              yTop,
              chartArea.right - chartArea.left,
              yBottom - yTop,
            );
          });
        },
      };
      const registrosOrdenados = [...this.registros].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });

      const labels = [];
      const valores = [];
      const colores = [];
      registrosOrdenados.forEach((r) => {
        const fecha = this.formatearFecha(r.timestamp);

        labels.push(fecha);
        valores.push(r.value);
        colores.push(this.obtenerColorGlucosa(r.value));
      });
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
      this.chartInstance = new Chart(this.$refs.graficaGlucosa, {
        type: "line",
        plugins: [backgroundZones],
        data: {
          labels,
          datasets: [
            {
              label: "Glucosa",
              data: valores,
              borderColor: "#1976d2",
              backgroundColor: "rgba(25, 118, 210, 0.15)",
              pointBackgroundColor: colores,
              pointBorderColor: colores,
              pointRadius: 5,
              pointHoverRadius: 7,
              lineTension: 0.3,
              fill: true,
            },
            {
              label: "Objetivo (100)",
              data: Array(this.registros.length).fill(100),
              borderColor: "#00c853",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
              lineTension: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,

          legend: {
            display: true,
          },

          tooltips: {
            mode: "index",
            intersect: false,
          },

          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                },
              },
            ],

            xAxes: [
              {
                type: "category",
                ticks: {
                  display: false, // cambiar a true para mostrar fechas
                  autoSkip: true,
                  maxTicksLimit: 10,
                  maxRotation: 90,
                  minRotation: 90,
                  fontSize: 10,
                },
                gridLines: {
                  display: true,
                  drawBorder: true,
                },
              },
            ],
          },
        },
      });
    },
    async confirmarEliminar() {
      try {
        if (!this.registroAEliminar) return;
        await eliminarRegistro(this.registroAEliminar.id);
        this.dialogEliminar = false;
        this.registroAEliminar = null;
        await this.cargarTodo();
        this.mensaje = "Registro eliminado correctamente";
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (error) {
        console.error(error);
        this.snackbarColor = "error";
        this.mensaje = "Error al eliminar registro";
        this.snackbar = true;
      }
    },
    abrirDialogEliminar(item) {
      this.registroAEliminar = item;
      this.dialogEliminar = true;
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
.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* deja que el canvas responda al contenedor */
canvas {
  max-width: 700px;
  width: 100% !important;
  height: 300px !important;
}
</style>
