const mongoose = require('mongoose');
mongoose
  .connect(
    `mongodb+srv://john:john@cluster0.kwqmn8j.mongodb.net/new4?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("connected to db");
  });