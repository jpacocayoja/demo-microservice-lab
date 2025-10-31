const express = require('express');
const cors = require('cors');

class Server {
    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;
        //middlewares
        this.middlewares();
        //routes
        this.routes();
    }

    middlewares(){
        this.app.use(express.json());
        this.app.use(cors());
        this.app.options('*', cors());
    }

    routes(){
        this.app.use('/', require('./routes/home'));
        this.app.use('/contents', require('./routes/content'));
    }

    listen(){
        this.app.listen(this.port, ()=> {
            console.log('Server is running on port', this.port);
        })
    }
}

module.exports = Server;