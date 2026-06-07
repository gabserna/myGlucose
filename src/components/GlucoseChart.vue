<template>
  <div>
    <canvas ref="grafica"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js";

export default {
  name: "GlucoseChart",

  data() {
    return {
      promedios: [],
      chartInstance: null,
    };
  },
  mounted() {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => this.procesarDatos(data));
  },

  methods: {
    procesarDatos(datos) {
      const porDia = {};

      datos.forEach((item, index) => {
        if (!item || !item.timestamp) {
          console.error("Registro inválido:", index, item);
          return;
        }

        const fecha = this.parseFecha(item.timestamp);
        const dia = fecha.toISOString().split("T")[0];
        const hora = fecha.getHours();
        const valor = item.value;

        if (!porDia[dia]) {
          porDia[dia] = { manana: [], tarde: [], noche: [] };
        }

        if (hora >= 6 && hora < 12) porDia[dia].manana.push(valor);
        else if (hora >= 12 && hora < 18) porDia[dia].tarde.push(valor);
        else if (hora >= 18) porDia[dia].noche.push(valor);
      });

      this.promedios = Object.keys(porDia)
        .map((dia) => ({
          dia,
          manana: this.promedio(porDia[dia].manana),
          tarde: this.promedio(porDia[dia].tarde),
          noche: this.promedio(porDia[dia].noche),
        }))
        .sort((a, b) => new Date(b.dia) - new Date(a.dia));

      this.renderGrafica();
    },

    parseFecha(fechaStr) {
      const [fecha, hora, ampm] = fechaStr.split(" ");
      const [mes, dia, anio] = fecha.split("-");
      let [h, m] = hora.split(":");

      h = parseInt(h);
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;

      return new Date(anio, mes - 1, dia, h, m);
    },

    promedio(arr) {
      if (!arr.length) return "-";
      return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    },

    obtenerColorGlucosa(valor) {
      const COLORES_GLU = {
        azul: "#0496ff",
        verde: "#008000",
        amarillo: "#ffea00",
        naranja: "#ff7b00",
        rojo: "#ff002b",
      };

      if (valor === "-") return "#e0e0e0";

      const clase = this.obtenerClaseGlucosa(valor);
      return COLORES_GLU[clase];
    },
    obtenerClaseGlucosa(valor) {
      if (valor === "-") return "";
      if (valor < 79) return "azul";
      if (valor <= 120) return "verde";
      if (valor <= 190) return "amarillo";
      if (valor <= 250) return "naranja";
      return "rojo";
    },

    renderGrafica() {
      const ctx = this.$refs.grafica;

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.promedios.map((d) => d.dia),
          datasets: [
            {
              label: "Mañana",
              data: this.promedios.map((d) =>
                d.manana === "-" ? 0 : d.manana,
              ),

              backgroundColor: this.promedios.map((d) =>
                this.obtenerColorGlucosa(d.manana),
              ),
            },
            {
              label: "Tarde",
              data: this.promedios.map((d) => (d.tarde === "-" ? 0 : d.tarde)),
              backgroundColor: this.promedios.map((d) =>
                this.obtenerColorGlucosa(d.tarde),
              ),
            },
            {
              label: "Noche",
              data: this.promedios.map((d) => (d.noche === "-" ? 0 : d.noche)),
              backgroundColor: this.promedios.map((d) =>
                this.obtenerColorGlucosa(d.noche),
              ),
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{ ticks: { beginAtZero: true } }],
          },
        },
      });
    },
  },
};
</script>
