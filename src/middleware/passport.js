const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
  usernameField:'email',
  passwordField:'password'
}, async (email, password,done) => {
  const usuario = await Usuarios.findOne({email})

  if(!usuario){
    return done(null,false,{
      message:'Usuario no existe'
    })
  }
  // el usuario existe, vamos a verificarlo
  const verificarPass = usuario.compararPassword(password)

  if(!verificarPass){
    return done(null,false,{
      message:'Contraseña Incorrecta'
    })
  }

  // usuario existe y password correcto
  return done(null,usuario)

}));

passport.serializeUser((usuario,done) => done(null,usuario._id))
passport.deserializeUser(async (id,done) => {
  const usuario = await Usuarios.findById(id)
  return done(null,usuario)
})

module.exports = passport;