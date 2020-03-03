const mongoose = require('mongoose');
const { Schema,model } = mongoose;
const bcrypt = require('bcrypt')

const Usuarios = new Schema({
  email:{
    type:String,
    unique:true,
    lowercase:true,
    trim:true
  },
  nombre:{
    type:String,
    require:[true,'Agrega tu nombre']
  },
  password:{
    type:String,
    require:[true,'Agrega tu contraseña'],
    trim:true
  },
  token:String,
  expira:Date,
  imagen:String
})

// metodos para hashear los password

Usuarios.pre('save', async function(next){
  // si el password ya esta hasheado
  if(!this.isModified('password')){
    return next();
  }
  // si no esta hasheado
  const hash = await bcrypt.hash(this.password,10)
  this.password = hash;
  next()
})

// enbvia al alerta cuando un usuario ya esta registrado
Usuarios.post('save', function(error, doc, next){
  if(error.name === 'MongoError' && error.code === 11000){
    next('Ese correo ya esta registrado')
  }else{
    next(error)
  }
})

// auntenticar usuarios
Usuarios.methods = {
  compararPassword : function (password){
    return bcrypt.compareSync(password,this.password)
  }
}

module.exports = model('usuarios', Usuarios);