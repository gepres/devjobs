const mongoose = require('mongoose');
const { Schema,model } = mongoose;
const slug = require('slug');
const shortid = require('shortid')


const Vacantes = new Schema({
  titulo:{
    type:String,
    require:[true,'El nombre de la vacante es obligatorio'],
    trim:true
  },
  empresa:{
    type:String,
    trim:true
  },
  ubicacion:{
    type:String,
    trim:true,
    require:[true,'La ubicacion es obligaria']
  },
  salario:{
    type:String,
    default:0,
    trim:true
  },
  contrato:{
    type:String,
    trim:true
  },
  descripcion:{
    type:String,
    trim:true
  },
  url:{
    type:String,
    lowercase:true
  },
  skills:[],
  candidatos:[{
    nombre:String,
    email:String,
    cv:String
  }],
  autor:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'usuarios',
    require:[true,'El autor el obligatorio']
  },
  date:{
    type:Date,
    default: Date.now
  }
})

Vacantes.pre('save', function(next){
  // crear la url
  const url = slug(this.titulo)
  this.url = `${url}-${shortid.generate()}`

  next();
})

// crear un indice 
Vacantes.index({titulo:'text'})


module.exports = model('vacante', Vacantes);
