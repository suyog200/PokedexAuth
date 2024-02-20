require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
require('./db/conn');
const User = require('./models/userModel');


const PORT = 3000;
const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'default_secret';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const createToken = (username) => {
    return jwt.sign({ username }, jwtSecret, {
        expiresIn: '1h'
    });
};



//middleware function to check token
const checkToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/index.html');
    }

    jwt.verify(token, 'pokemon', (err, decoded) => {
        if (err) {
            return res.redirect('/index.html');
        } else {
            next();
        }
    });
};

app.get('/', (req, res) => {
    res.status(200).send('index');
});

app.get('/home', checkToken, (req, res) => {
    res.redirect('/home.html');
});


app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if(password != confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashPassword = await bcrypt.hash(password,saltRounds);
        const newUser = new User({
            username,
            email,
            password : hashPassword
        });
        await newUser.save();
        return res.status(200).redirect('/home.html');

    } catch (err) {
        return res.status(500).redirect('/index.html');
    }
});

//login user==================================================
app.post('/login', async (req,res) => {
    try {
        const {username,password} = req.body;
        const userData = await User.findOne({username: username});
        if(!userData) {
            return res.status(404).send('User not found');
        };
        const passwordVerify = bcrypt.compare(password,userData.password);
        if(!passwordVerify) {
            return res.status(401).send('Password do not match');
        };

        //create jwt token
        const token = createToken(username);

        //create cookie and store it
        res.setHeader('Set-Cookie', cookie.serialize('jwt', token, {
            httpOnly: true,
            maxAge: 50000, 
            path: '/', // Cookie is valid for all paths
            sameSite: 'strict' // Enforces same-site policy
        }));

        console.log(`jwt token: ${token}`);

        console.log(`${userData.username} logged in`);
        return res.status(200).redirect('/home.html');
        
        
    } catch (error) {
        return res.status(500).redirect('/index.html');
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});