<template>
  <div>
    <h1>Historico</h1>
    <h6 class="mb-4">Abril/2025 a Ene/2026</h6>
    <v-col cols="12" xs="1">
      <div class="grid-tabla">
        <div v-for="dia in promedios" :key="dia.dia" class="card-dia">
          <h4>{{ dia.dia }}</h4>

          <div class="datos-container">
            <div v-for="r in RANGOS" :key="r.key" class="datos">
              <span :title="r.label">{{ r.icon }}</span>

              <strong class="valor" :class="obtenerClaseGlucosa(dia[r.key])">
                {{ dia[r.key] }}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </v-col>
  </div>
</template>

<script>
export default {
  name: "PromedioDiario",

  data() {
    return {
      promedios: [],
      RANGOS: [
        { key: "manana", icon: "☀️", label: "Mañana" },
        { key: "tarde", icon: "🌤️", label: "Tarde" },
        { key: "noche", icon: "🌙", label: "Noche" },
      ],
    };
  },

  mounted() {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar data.json");
        return res.json();
      })
      .then((data) => this.procesarDatos(data))
      .catch((err) => {
        console.error("Error cargando data.json", err);
        this.promedios = []; // evita crash
      });
  },

  methods: {
    procesarDatos(datos) {
      const porDia = {};

      datos.forEach((item) => {
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
  },
};
</script>

<style scoped>
body {
  padding: 1rem 2rem;
  margin: 0 2rem;
}
.grid-tabla {
  display: grid;
  /* grid-template-columns: repeat(4, 1fr); */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
@media (max-width: 600px) {
  .grid-tabla {
    grid-template-columns: 1fr;
  }
}
.card-dia {
  border: 1px solid #ccc;
  padding: 0.3rem;
  border-radius: 6px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  min-width: 0;
}
.card-dia h4 {
  text-align: center;
  margin: 0;
  background-color: #ccc;
}
.datos-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
}
.datos {
  display: flex;
  align-items: center;
  gap: 6px;
}
.valor {
  padding: 2px 6px;
  border-radius: 4px;
  color: #000;
  transition: background-color 0.3s ease;
  overflow-wrap: break-word;
  word-break: break-word;
}
.valor.azul {
  background-color: #0496ff;
  color: #fff;
}
.valor.verde {
  background-color: #008000;
  color: #fff;
}
.valor.amarillo {
  background-color: #ffea00;
}
.valor.naranja {
  background-color: #ff7b00;
  color: #fff;
}
.valor.rojo {
  background-color: #ff002b;
  color: #fff;
}
body.dark {
  background-color: #121212;
  color: #e0e0e0;
}
body.dark .card-dia {
  background-color: #1e1e1e;
  border-color: #333;
}
body.dark .card-dia h4 {
  background-color: #333;
  color: #fff;
}
body.dark canvas {
  background-color: #121212;
}
</style>
