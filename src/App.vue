<script setup>
import { ref, onMounted, watch } from 'vue';
import { add, getTotalLoyer, getMaxLoyer, getMinLoyer, update, deleteApp } from './crud.js';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';

const showForm = ref(false);
const showHome = ref(true);
const editingAppartement = ref(null);
const appartements = ref([]);

const num = ref('');
const designation = ref('');
const loyer = ref('');

let myChart = null; 

const toggleForm = () => {
  showHome.value = !showHome.value;
  showForm.value = !showForm.value;
};

const toggleHome = () => {
  showHome.value = !showHome.value;
  showForm.value = !showForm.value;
};

const submitForm = () => {
  const appartement = {
    num: num.value,
    designation: designation.value,
    loyer: loyer.value
  };
  if (editingAppartement.value) {
    update({ ...appartement, id: editingAppartement.value.id });
    editingAppartement.value = null;
  } else {
    add(appartement);
  }

  num.value = '';
  designation.value = '';
  loyer.value = '';

  showHome.value = true;
  showForm.value = false;
  updateChart();
};



const deleteAppartement = (appartement) => {
  Swal.fire({
    title: 'Êtes-vous sûr?',
    text: "Vous ne pourrez pas revenir en arrière!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer!',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      const index = appartements.value.findIndex(item => item.id === appartement.id);
      if (index > -1) {
        appartements.value.splice(index, 1);
      }
      deleteApp(appartement);
      Swal.fire(
        'Supprimé!',
        'L\'appartement a été supprimé avec succès.',
        'success'
      );
      updateChart();
      displayData();
    }
  });
};

const editAppartement = (appartement) => {
  num.value = appartement.num;
  designation.value = appartement.designation;
  loyer.value = appartement.loyer;
  editingAppartement.value = appartement;
  showHome.value = false;
  showForm.value = true;
};

const displayData = () => {
  const data = JSON.parse(localStorage.getItem('bd')) || [];
  return data.map(appartement => ({
    id: appartement.id,
    num: appartement.num,
    designation: appartement.designation,
    loyer: appartement.loyer
  }));
};

const createOrUpdateChart = (data) => {
  if (!myChart) {
    const ctx = document.getElementById('myChart');
    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(appartement => appartement.designation),
        datasets: [{
          label: 'Loyer',
          data: data.map(appartement => appartement.loyer),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    myChart.data.labels = data.map(appartement => appartement.designation);
    myChart.data.datasets[0].data = data.map(appartement => appartement.loyer);
    myChart.update();
  }
};

watch(appartements, () => {
  const data = displayData();
  createOrUpdateChart(data);
});

onMounted(() => {
  const data = displayData();
  createOrUpdateChart(data);
});

const getObservation = (loyer) => {
  if (loyer < 1000) {
    return 'Bas';
  } else if (loyer >= 1000 && loyer <= 5000) {
    return 'Moyen';
  } else {
    return 'Élevé';
  }
};

const updateChart = () => {
  const data = displayData();
  createOrUpdateChart(data);
  console.log(data);
};
</script>


<template>
  <div class="flex">
    <!-- Navbar -->
    <div class="w-48 bg-gray-800">
      <ul>
        <a href="#" class="text-white flex items-center p-4 bg-gray-900" >
          <span class="font-bold text-2xl">CRUD</span><span class="font-bold text-amber-500 ml-1">  Manager</span>
        </a>
          <a href="#" class="text-white flex items-center p-4">
            <img src="/src/components/icons/icons8-accueil-24.png" alt="Icone" class="h-5 w-5 mr-2">
            Accueil
          </a>  
          <button class="text-white flex items-center p-4">
            <img src="/src/components/icons/icons8-classement-48.png" alt="Icone" class="h-5 w-5 mr-2">
            Histogramme
          </button> 
      </ul>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 bg-gray-900" >
      <div class="bg-gray-800" style=" height: 64px;border-left: 1px solid rgb(55 65 81) ; " >
      </div>

      <!-- Formulaire -->
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
              <div class="mb-4" v-if="showForm">
                <button @click="toggleHome" class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                    <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Retour
                    </span></button>
                  <form class="max-w-md mx-auto" @submit.prevent="submitForm">
                    <div class="relative z-0 w-full mb-5 group">
                        <input v-model="num" type="number" name="floating_email" id="floating_email" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required  min="0" />
                        <label for="floating_email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Numero appartement</label>
                    </div>
                    <div class="relative z-0 w-full mb-5 group">
                        <input v-model="designation" type="text" name="floating_password" id="floating_password" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label for="floating_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Designation</label>
                    </div>
                    <div class="relative z-0 w-full mb-5 group">
                        <input v-model="loyer" type="number" name="repeat_password" id="floating_repeat_password" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required  min="1" />
                        <label for="floating_repeat_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Loyer</label>
                    </div>
                    <button type="submit" class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                    <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Ajouter
                    </span>
                  </button>
                  </form>
              </div>
        <!-- Contenu de la Liste -->
            <div v-if="showHome">
              <div class="flex items-center justify-between">
                <div class="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                </div>
                <div>
                  <button @click="toggleForm"  class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                    <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Ajouter
                    </span>
                  </button>
                </div>
              </div>
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="p-4">
                                <div class="flex items-center">
                                </div>
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Designation
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Loyer
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Obs
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(appartement, index) in displayData()" :key="index" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td class="w-4 p-4">
                            <div class="flex items-center">
                            </div>
                          </td>
                          <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {{ appartement.designation }}
                          </td>
                          <td class="px-6 py-4">
                            {{ appartement.loyer }}
                          </td>
                          <td class="px-6 py-4">
                            {{ getObservation(appartement.loyer) }}
                          </td>
                          <td class="px-6 py-4">
                            <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3" @click="editAppartement(appartement)">Modifier</a>
                            <button class="font-medium text-red-600 dark:text-red-500 hover:underline" @click ="deleteAppartement(appartement)">Supprimer</button>
                          </td>
                      </tr>
                    </tbody>
                </table>  
            </div>
          </div>
          <div v-if="showHome" class="flex justify-center mx-4 my-6" style="justify-content: space-between;">
            <h1 class="font-bold text-white">1) Total des loyer : <span style="text-decoration: underline;">{{ getTotalLoyer() }}</span> Ar</h1>
            <h1 class="font-bold text-white">2) Minimal des loyer : <span style="text-decoration: underline;">{{ getMinLoyer() }}</span> Ar</h1>
            <h1 class="font-bold text-white">3) Maximal des loyer : <span style="text-decoration: underline;">{{ getMaxLoyer() }}</span> Ar</h1>
          </div>
            <h1 class=" bg-gray-800 text-2xl text-center font-bold text-white mx-4 mt-5 p-2" style=" border-radius: 10px">Histogramme :</h1>
            <br>
            <div class="flex justify-center">
              <div class="w-3/4">
                <canvas id="myChart"></canvas>
              </div>
            </div> 
      </div>
   </div>
</template>



