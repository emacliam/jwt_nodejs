const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
let refreshTokens = [];
app.use(express.json());

function auth(req, res, next) {
    const tokenk = req.headers['authorization'];
    token = tokenk.split(" ")[1];
    if (!token) {
        return res.status(404).json({ message: 'no token' })
    }
    jwt.verify(token, "access", (err, user) => {
        if (!err) {
            req.user = user;
            next();
        } else {
            return res.status(403).json({ message: "user not authenticated" })
        }
    })


}

app.post("/renewAccessToken", (req, res) => {

    const refreshToken = req.body.token;
    console.log(refreshTokens)
    console.log(refreshTokens.includes(refreshToken))
    if (!refreshToken) {
        return res.status(400).json({ message: "User not Authenticated" });
    }
    jwt.verify(refreshToken, "refresh", (err, user) => {
        if (!err) {
            const accessToken = jwt.sign({ username: user.name }, 'access', { expiresIn: '20s' })
            return res.status(201).json({ accessToken });
        } else {
            return res.status(403).json({ message: 'user not authenticated' })
        }
    })
})

app.post('/protected', auth, (req, res) => {
    res.send('inside protected route');
})



app.post('/login', (req, res) => {
    console.log(req.body)
    const { user } = req.body;
    if (!user) {
        return res.status(404).json({ message: 'Body empty' })
    }

    let accessToken = jwt.sign(user, 'access', { expiresIn: '20s' });
    let refreshToken = jwt.sign(user, 'refresh', { expiresIn: '5m' });
    refreshTokens.push(refreshToken);

    return res.status(201).json({
        accessToken,
        refreshToken
    })
})

app.listen(3000, (error) => {
    if (error) {
        console.log('error occured');
    } else {
        console.log('server started at port', 3000)
    }

});