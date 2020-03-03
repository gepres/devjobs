const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
  })
  .then(console.log('db esta conectada'))
  .catch(err => console.error(err))