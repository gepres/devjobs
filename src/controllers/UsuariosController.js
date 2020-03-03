const Usuarios = require('../models/Usuarios');
const { check,body, validationResult } = require('express-validator');
const multer = require('multer')
const shortid = require('shortid')
const path = require('path')

module.exports = {
  formCrearCuenta : (req,res) => {
    res.render('crear-cuenta',{
      nombrePagina:'Crea tu cuenta en devJobs',
      tagline:'Comienza a publicar tus vacantes gratis'
    })
  },
  validarRegistro:[
    // sanitizar 
    body('nombre').escape(),
    body('email').escape(),
    body('password').escape(),
    body('confirmar').escape(),
    check('nombre', 'El nombre es olbigatorio').not().isEmpty(),
    check('email', 'El email es olbigatorio').isEmail(),
    check('password', 'La contraseña es olbigatorio').not().isEmpty(),
    check('confirmar', 'El confirmar contraseña es diferente').not().isEmpty(),
    check('confirmar', 'El password es diferente').custom((value, { req }) => value == req.body.password)
  ],
  crearUsuario:async (req,res,next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      // si hay errores
      // return  console.log(errors)
      req.flash('error', errors.errors.map(error => error.msg));
      res.render('crear-cuenta',{
        nombrePagina:'Crea tu cuenta en devJobs',
        tagline:'Comienza a publicar tus vacantes gratis',
        mensajes: req.flash()
      });
      return;
    }

    // crear usuario
    const usuario = new Usuarios(req.body)
    try {
      await usuario.save()
      res.redirect('/iniciar-sesion')
    } catch (error) {
      req.flash('error',error)
      console.log(error);
      res.redirect('/crear-cuenta')
    }
  },
  formIniciarSesion:(req,res) => {
    res.render('iniciar-sesion',{
      nombrePagina: 'Iniciar Sesión DevJobs'
    })
  },
  // editar perfil
  formEditarPerfil : async (req,res) => {
    const usuario = await Usuarios.findById(req.user._id).lean()
    res.render('editar-perfil',{
      nombrePagina:'Edita tu perfil en devJobs',
      usuario:usuario,
      cerrarSesion:true,
      imagen:req.user.imagen,
      nombre : req.user.nombre,
    })
  },
  subirImagen:(req,res,next) => {
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
        res.redirect('/administracion')
        return;
      }else{
        return next()
      }
    })
  },
  // guardar cambios de editar perfil
  editarPerfil:async(req,res) => {
    // const errors = validationResult(req)
    // if (!errors.isEmpty()) {
    //   const user = await Usuarios.findById(req.user._id).lean()
    //   req.flash('error', errors.errors.map(error => error.msg));
    //   res.render('editar-perfil',{
    //     nombrePagina:'Edita tu perfil en devJobs',
    //     usuario:user,
    //     cerrarSesion:true,
    //     nombre : req.user.nombre,
    //     mensajes: req.flash()
    //   });
    //   return;
    // }

    const usuario = await Usuarios.findById(req.user._id)
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
      usuario.password = req.body.password
    }
    // console.log(req.file)
    if(req.file){
      usuario.imagen = req.file.filename
    }
    await usuario.save()
    req.flash('correcto','Cambios guardados correctamente')
    res.redirect('/administracion')
  },
  // sanitizar y validar formulario de editar cliente
  ValidarPerfil: [
    body('nombre').escape(),
    body('email').escape(),
    check('nombre', 'El Nombre el obligario').not().isEmpty(),
    check('email', 'El email es olbigatorio').isEmail()

  ]
}


const configuracionMulter = {
  limits:{fileSize:1000000},
  storage: fileStorage = multer.diskStorage({
    destination:(req,file,cb) => {
      cb(null,__dirname+'../../public/uploads/perfiles')
    },
    filename:(req,file,cb) => {
      // console.log(file)
      const extension = file.mimetype.split('/')[1]
      cb(null,`${shortid.generate()}.${extension}`)
      
    },
  }),
  fileFilter(req,file,cb){
    // console.log(file);
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
      // el callback se ejecuta como tue o false | true cuando la imagen se acepta
      cb(null,true)
    }else{
      cb(new Error('Ese formato no es valido'),false)
    }
  }
}
const upload = multer(configuracionMulter).single('imagen');