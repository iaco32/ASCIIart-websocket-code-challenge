<template>
  <div>
    <input type="file" @change="selectFile" />
    <input id="msec" type="number" v-model="interval" />
    <label for="msec">ms</label>
    <button :disabled="printdisabled" @click="printFile">Print</button>
    <p v-if="imageAscii">{{ progress }}%</p>
    <pre>
    <div v-for="(line, index) in lines" :style="{ color: getLineColor(index) }">{{ line }}</div>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const socket = new WebSocket('ws://localhost:3000');
const imageAscii = ref('');
const interval = ref(300); //default interval at 300 ms
const progress = ref(0);
let lines = [''];
const totalLines = ref(0);
let printdisabled = ref(true);
let lineIndex = 1;
let file: File | null = null;

const selectFile = (event: Event) => {
  file = (event.target as HTMLInputElement).files![0];
  printdisabled.value = false;
};

const printFile = () => {
  printdisabled.value = true;
  lineIndex = 1;
  lines = [''];
  imageAscii.value = '';
  progress.value = 0;
  const reader = new FileReader();
  reader.onload = () => {
    socket.send(JSON.stringify({ data: reader.result, interval: interval.value }));
  };
  if (file) {
    reader.readAsText(file);
  }
};

const getLineColor = (index: number) => {
  if (totalLines.value > 0) {
    const red = Math.round(255 * (index / totalLines.value));
    const green = Math.round(255 * (1 - (index / totalLines.value)));
    const blue = Math.round(255 * (1 - (index / totalLines.value)));
    console.log("index: ", index, " - totalLines: ", totalLines.value, " - red: ", red, " - green: ", green, " - blue: ", blue)
    return `rgb(${red}, ${green}, ${blue})`;
  }
  return `rgb(0, 255, 255)`;
};

onMounted(() => {
  socket.onmessage = event => {
    const response = JSON.parse(event.data);
    lines.push(response.data);
    totalLines.value = response.totallines;
    imageAscii.value += response.data + '\n';
    // I used this formula to calculate progress percentage
    // The backend returns the number of lines of the file (response.totallines)
    // I started the lineIndex from 1 to simplyfy the calculation
    progress.value = Number((lineIndex * (100 / response.totallines)).toFixed(1));
    lineIndex++;
    if (progress.value === 100) {
      printdisabled.value = false;
    }
  };

});

onUnmounted(() => {
  socket.close();
});
</script>

<style scoped>
input[type="file"] {
  padding: 5px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

input[type="number"] {
  padding: 5px;
  font-size: 16px;
  border-radius: 5px;
  margin-left: 25px;
}

label {
  font-size: 16px;
  margin-left: 10px;
}

button {
  font-size: 16px;
  display: flex;
  justify-content: center;
  margin: 1rem auto;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button[disabled] {
  background-color: #ccc;
  color: #8d8989;
  cursor: not-allowed;
}

pre {
  padding: 0.5rem;
}

p {
  background-color: red;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: fit-content;
  padding: 0.2rem;
  margin: 1rem auto;
  border-radius: 5px;
}
</style>