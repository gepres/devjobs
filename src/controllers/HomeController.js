const Vacante = require('../models/Vacantes')
module.exports = { 
  mostrarTrabajos : async (req,res,next) => {
    // el .lean() despues del find es para resolver un problema de actualizacion de handlebars
    // Handlebars: Access has been denied to resolve the property "empresa" because it is not an "own property" of its parent.
    const vacantes = await Vacante.find().lean()
    if(!vacantes) return next();
    res.render('home', {
      nombrePagina : 'devJobs',
      tagline :'Encuentra y publica trabajos  para desarrolladores web',
      barra:true,
      boton:true,
      dash:true,
      vacantes
    })
  }
  
}