const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    // Specify the write concern mode
    writeConcern: {
        w: 'majority'
    } 
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
