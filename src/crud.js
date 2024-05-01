
import Swal from 'sweetalert2';
const DB = 'bd'

function getLocalDB(){
    if(!localStorage.getItem(DB)){
        localStorage.setItem(DB, JSON.stringify([]))
    }
    return JSON.parse(localStorage.getItem(DB))  
}

function updateDB(db){
    localStorage.setItem(DB, JSON.stringify(db))
}
export function add(appartement) {
    const db = getLocalDB();
    const existingAppartement = db.find(item => item.num === appartement.num || item.designation === appartement.designation);
    console.log('Existing appartement:', existingAppartement);
    if (existingAppartement) {
        Swal.fire({
            icon: 'error',
            title: 'Appartement deja existant',
            showConfirmButton: false,
            timer: 1500
        });
        return; 
    } else {
        appartement.id = Date.now() + "";
        db.push(appartement);
        updateDB(db);
        Swal.fire({
            icon: 'success',
            title: 'Ajout réussi',
            showConfirmButton: false,
            timer: 1500
        });
    }
}


export function getTotalLoyer() {
    const db = getLocalDB();
    let totalLoyer = 0;
    for (const appartement of db) {
        totalLoyer += appartement.loyer;
    }
    return totalLoyer;
}

export function getMaxLoyer() {
    const db = getLocalDB();
    let maxLoyer = -Infinity;
    for (const appartement of db) {
        if (appartement.loyer > maxLoyer) {
            maxLoyer = appartement.loyer;
        }
    }
    return maxLoyer !== -Infinity ? maxLoyer : 0;
}

export function getMinLoyer() {
    const db = getLocalDB();
    let minLoyer = Infinity;
    for (const appartement of db) {
        if (appartement.loyer < minLoyer) {
            minLoyer = appartement.loyer;
        }
    }
    return minLoyer !== Infinity ? minLoyer : 0;
}
export function update(appartement) {
    const db = getLocalDB();
    const existingAppartement = db.find(item => item.id === appartement.id);
    if (!existingAppartement) {
        Swal.fire({
            icon: 'error',
            title: "L'appartement que vous essayez de mettre à jour n'existe pas dans la base de données.",
            showConfirmButton: false,
            timer: 1500
        });
        return; 
    } else {
        const existingAppartementWithSameNumOrDesignation = db.find(item => (item.num === appartement.num || item.designation === appartement.designation) && item.id !== appartement.id);
        if (existingAppartementWithSameNumOrDesignation) {
            Swal.fire({
                icon: 'error',
                title: "Un appartement avec le même numéro ou la même désignation existe déjà dans la base de données.",
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }
        const updatedDB = db.map(cursApp => {
            if (cursApp.id === appartement.id) {
                return {
                    ...cursApp,
                    num: appartement.num,
                    designation: appartement.designation,
                    loyer: appartement.loyer
                };
            }
            return cursApp;
        });
        Swal.fire({
            icon: 'success',
            title: 'Modification réussie',
            showConfirmButton: false,
            timer: 1500
        });
        updateDB(updatedDB);
    }
}

export function deleteApp(appartement) {
    const db = getLocalDB();
    const updatedDB = db.filter(cursApp => cursApp.id !== appartement.id);
    updateDB(updatedDB);
    location.reload();
}
  

