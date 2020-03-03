const Vacante = require('../models/Vacantes')
const Usuarios = require('../models/Usuarios')
const passport = require('passport')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')


module.exports = { 
  auntenticarUsuario : passport.authenticate('local',{
    successRedirect:'/administracion',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage:'Ambos campos son obligatorios'
  }),
  // revisar si el usuario esta autentificado o no 
  verificarUsuario: async (req,res,next) => {
    // revisar el usuario  
      if(req.isAuthenticated()){
        return next(); // estan autenticados
      }
    // redirecionarlo
    res.redirect('/iniciar-sesion')
  },
  verficarUserVacante:async (req,res,next) => {
        // const userSesion = JSON.stringify(req.user._id);
    // console.log(vacante.autor)
    // console.log(req.user._id);
    
    // const userParams = JSON.stringify(vacante.autor)

      // if(userSesion === userParams){
      //   console.log('usuario correcto')
      // }else{
      //   console.log('usuario incorrecto')
      // }

      // if(req.isAuthenticated() && userSesion === userParams ){
      //   return next();
      // }
    const vacante = await Vacante.findOne({url:req.params.url})
    if(req.isAuthenticated() && vacante.autor == req.user._id.toString()){
      return next ()
    }
    res.redirect('/iniciar-sesion')
  },
  mostrarPanel: async (req,res) => {
    // consultar el usuario atentificado
    const vacantes = await Vacante.find({autor:req.user._id}).lean()
    // console.log(vacantes)
    res.render('administracion',{
      nombrePagina:'Panel de Administración',
      tagline:'Crea y Administra tus vacantes desde aquí',
      cerrarSesion:true,
      nombre : req.user.nombre,
      imagen: req.user.imagen,
      vacantes
    })
  },
  cerrarSesion: (req,res) => {
    req.logout()
    req.flash('correcto','Cerraste Sesión Correctamente')
    return res.redirect('/iniciar-sesion')
  },
  formRestablecerPassword:(req,res) => {
    res.render('reestablecer-password',{
      nombrePagina:'Restablece tu contraseña',
      tagline:'Si ya tienes una cuenta pero olvidaste tu contraseña, coloca tu correo'
    })
  },
  // genera el token de la tabla usuario
  enviarToken:async(req,res) => {
    const usuario = await Usuarios.findOne({email:req.body.email})
    if(!usuario){
      req.flash('error','No existe ese correo.')
      res.redirect('/iniciar-sesion')
    }
    // el usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex')
    usuario.expira = Date.now() + 3600000;

    // guardar usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

    // enviar notificacion por email
    await enviarEmail.enviar({
      usuario,
      subject:'Resetear contraseña',
      resetUrl,
      archivo:'reset'
    })


    req.flash('correcto','Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion')
  },
  reestablecerPassword: async (req,res) => {
    const usuario = await Usuarios.findOne({
      token: req.params.token,
      expira:{
        $gt : Date.now()
      }
    })

    if(!usuario){
      req.flash('error', 'El Formulario ya no es valido, intenta denuevo');
      return res.redirect('/reestablecer-password')
    }

    // todo bien , mostrar el formulario
    res.render('nuevo-password',{
      nombrePagina:'Nueva Contraseña'
    })
  },
  // alamacena la nueva contraseña
  guardarPassword: async  (req,res) => {
    const usuario = await Usuarios.findOne({
      token: req.params.token,
      expira:{
        $gt : Date.now()
      }
    })
    // no existe el usuario o token invalido
    if(!usuario){
      req.flash('error', 'El Formulario ya no es valido, intenta denuevo');
      return res.redirect('/reestablecer-password')
    }
    // guardar en la base datos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined

    // agregar y eliminar del objectos
    await usuario.save()
    // redirigir
    req.flash('correcto','Contraseña Modificada Correctamente.')
    res.redirect('/iniciar-sesion')
  }
}
