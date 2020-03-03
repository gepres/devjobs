import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded',() => {
  const skills = document.querySelector('.lista-conocimientos')
  // limpiar las alertas
  let alertas = document.querySelector('.alertas')
  if(alertas){
    limpiarAlertas()
  }
  if(skills){
    skills.addEventListener('click',agregarSkills)
    // estamso en editar, llamar la edicion 
    skillsSeleccionados();
  }

  const vacantesListados = document.querySelector('.panel-administracion')
  if(vacantesListados){
    vacantesListados.addEventListener('click', accionesListado);
  }
})
const skills = new Set();
const agregarSkills = e => {
  if(e.target.tagName === 'LI'){
    if(e.target.classList.contains('activo')){
      // quitarlo del set y quitar la clase
      skills.delete(e.target.textContent);
      e.target.classList.remove('activo')
    }else{
      // agregarlo al ser y agregar la clase
      skills.add(e.target.textContent);
      e.target.classList.add('activo')
    }
  }
  const skillsArray = [...skills]
  document.querySelector('#skills').value = skillsArray
}

const skillsSeleccionados = () => {
  const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
  // console.log(seleccionadas)
  seleccionadas.forEach(seleccionada => {
    skills.add(seleccionada.textContent)
  })

  // inyectarlo en el hidden
  const skillsArray = [...skills]
  document.querySelector('#skills').value = skillsArray
}

const limpiarAlertas = () => {
  const alertas = document.querySelector('.alertas')
  const interval = setInterval(() => {
    if(alertas.children.length > 0){
      alertas.removeChild(alertas.children[0])
    }else if(alertas.children.length === 0){
      alertas.parentElement.removeChild(alertas)
      clearInterval(interval)
    }
  },2000)
}

// eliminar vacantes
const accionesListado = e => {
  e.preventDefault();
  // console.log(e.target);
  if(e.target.dataset.eliminar){
    // eliminar por medio de axios
    Swal.fire({
      title: '¿ Confirmar Eliminación?',
      text: "Una vez eliminada, no se puede recuperar!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!',
      cancelButtonText:'No, Cancelar.'
    }).then((result) => {
      if (result.value) {
        // enviar una peticion en axios
        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`
        // axios para eliminar el registro
        axios.delete(url,{params:{url}}).then(function(res) {
          if(res.status === 200){
            Swal.fire(
              'Eliminado!',
                res.data,
              'success'
            )
            // eliminar del DOM
            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
          }
          
        })
      }
    }).catch(() => {
      Swal.fire({
        type:'error',
        title:'Hubo un error',
        text:'No Se puedo Eliminar'
      })
    })
  }else if (e.target.tagName === 'A'){
    window.location.href = e.target.href;
  }
}