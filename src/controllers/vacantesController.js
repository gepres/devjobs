const Vacante = require('../models/Vacantes')
const { check,body, validationResult } = require('express-validator');
const multer = require('multer')
const shortid = require('shortid')

module.exports = {
  formularioNuevaVacante : (req,res) => {
    res.render('nueva-vacante',{
      nombrePagina:'Nueva Vacante',
      tagline:'Llena el formulario y publica tu vacante',
      cerrarSesion:true,
      nombre : req.user.nombre,
      imagen:req.user.imagen,
    })
  },
  agregarVacante: async  (req,res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.errors.map(error => error.msg));
      res.render('nueva-vacante',{
        nombrePagina:'Nueva Vacante',
        tagline:'Llena el formulario y publica tu vacante',
        cerrarSesion:true,
        nombre : req.user.nombre,
        imagen:req.user.imagen,
        mensajes: req.flash()
      });
    }else{
      const reg = new Vacante(req.body)

      // usuario autor de la vacante
      reg.autor = req.user._id;
  
      // crear arreglos de hablilidades
      reg.skills = req.body.skills.split(',')
  
      // almacenarlo en la DB
      const nuevaVacante = await reg.save()
  
      // redirecionar
      res.redirect(`/vacantes/${nuevaVacante.url}`)
    }

  },
  monstrarVacante: async (req,res,next) => {
    const vacante = await Vacante.findOne({url : req.params.url}).populate('autor').lean()
  
    // si no hay vacante
    if(!vacante) return next()

    res.render('vacante',{
      vacante,
      nombrePagina:vacante.titulo,
      barra:true
    })
  },
  formEditarVacante: async (req,res,next)=> {
    const vacante= await Vacante.findOne({url : req.params.url}).lean()
    // si no hay vacante
    if(!vacante) return next()
    res.render('editar-vacante',{
      vacante,
      nombrePagina:`Editar - ${vacante.titulo}`,
      cerrarSesion:true,
      nombre : req.user.nombre,
      imagen:req.user.imagen
    })
  },
  editarVacante: async (req,res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const vacante = await Vacante.findOne({url : req.params.url}).lean()
      req.flash('error', errors.errors.map(error => error.msg));
      res.render('editar-vacante',{
        vacante,
        nombrePagina:`Editar - ${vacante.titulo}`,
        cerrarSesion:true,
        nombre : req.user.nombre,
        imagen:req.user.imagen,
        mensajes: req.flash()
      });
    }else{
      const datos =  req.body;
      datos.skills = req.body.skills.split(',')
      const vacante = await Vacante.findOneAndUpdate({url:req.params.url},datos,{
        new:true,
        runValidators:true
      })
      // console.log(datos)
      res.redirect(`/vacantes/${vacante.url}`)
    }
  },
  eliminarVacante:async (req,res) => {
    const {id} = req.params;
    // console.log(id);
    const vacante = await Vacante.findById(id)
    if(verificarAutor(vacante,req.user)){
      // todo bien,si es el usuario eliminar
      vacante.remove()
      res.status(200).send('Vacante Eliminada correctamente')
    }else{
      res.status(403).send('Error')
    }

  },
  contactar: async (req,res)=>{
    const vacante = await Vacante.findOne({url:req.params.url})

    // si no existe la vacante
    if(!vacante) return next();

    // todo bien, construir el nuevo objecto
    const nuevoCantidato = {
      nombre:req.body.nombre,
      email:req.body.email,
      cv:req.file.filename
    }
    // almacenar la vacante
    vacante.candidatos.push(nuevoCantidato)
    await vacante.save()

    // mensaje flash y redireccion
    req.flash('correcto','Se Envió tu curruculum Correctamente')
    res.redirect('/')
  },
  subirCV :(req,res,next) => {
    upload(req,res,function(error){
      // console.log(error);
      if(error){
        // console.log(error)
        if(error instanceof multer.MulterError){
          if(error.code === 'LIMIT_FILE_SIZE'){
            req.flash('error', 'El archivo es pesado, Máximo 1MB')
          }else{
            req.flash('error', error.message)
          }
        }else{
          req.flash('error',error.message)
        }
        res.redirect('back')
        return;
      }else{
        return next()
      }
    })
  },
  mostrarCandidatos: async (req,res,next) => {
    const vacante = await Vacante.findById(req.params.id).lean()
    if(vacante.autor != req.user._id.toString()){
      return next ()
    }
    if(!vacante) return next()

    res.render('candidatos',{
      nombrePagina:`Candidatos Vacantes - ${vacante.titulo}`,
      cerrarSesion:true,
      nombre:req.user.nombre,
      candidatos:vacante.candidatos
    })
  },
  buscarVacantes:async(req,res) => {
    const vacantes = await Vacante.find({
      $text : {
        $search : req.body.q
      }
    }).lean()
    // mostrar la vacantes
    res.render('home', {
      nombrePagina:`Resultados para la búsqueda: ${req.body.q}`,
      barra:true,
      vacantes
    })
    // console.log(vacantes);
    
  },
  // validar y sanatizar los campos de las nuevas vacantes
  validarVacante:[
    // sanitizar 
    body('titulo').escape(),
    body('empresa').escape(),
    body('ubicacion').escape(),
    body('salario').escape(),
    body('contrato').escape(),
    body('skills').escape(),
    check('titulo', 'Agrega un Titulo a la Vacante').not().isEmpty(),
    check('empresa', 'Agrega una Empresa a la Vacante').not().isEmpty(),
    check('ubicacion', 'Agrega una Ubicacion a la Vacante').not().isEmpty(),
    check('skills', 'Agrega almenos una habilidad a la Vacante').not().isEmpty(),
    check('contrato', 'Agrega un Contrato a la Vacante').not().isEmpty()
  ]
}




const verificarAutor = (vacante = {},usuario = {}) => {
  if(!vacante.autor.equals(usuario._id)){
    return false
  }else{
    return true
  }
}

const configuracionMulter = {
  limits:{fileSize:1000000},
  storage: fileStorage = multer.diskStorage({
    destination:(req,file,cb) => {
      cb(null,__dirname+'../../public/uploads/cv')
    },
    filename:(req,file,cb) => {
      // console.log(file)
      const extension = file.mimetype.split('/')[1]
      cb(null,`${shortid.generate()}.${extension}`)
      
    },
  }),
  fileFilter(req,file,cb){
    // console.log(file);
    if(file.mimetype === 'application/pdf'){
      // el callback se ejecuta como tue o false | true cuando la imagen se acepta
      cb(null,true)
    }else{
      cb(new Error('Ese formato no es valido'),false)
    }
  }
}
const upload = multer(configuracionMulter).single('cv');