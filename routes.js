const express = require('express');
// const app = express();
const bodyParser = require('body-parser');
const products = require('./public/js/products-data');
const messages = require('./public/js/messages-data');
const customers = require('./public/js/customer-data');
const app = express.Router();
let loggedIn = false;

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const textParser = bodyParser.text();

// Homepage route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/homepage.html');
});

// Featured page
app.get('/featured', (req, res) => {
    res.sendFile(__dirname + '/public/html/featured.html');
});

// Products page
app.get('/products', (req, res) => {
    res.sendFile(__dirname + '/public/html/products.html');
});

// Contact Us page
app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/html/contact.html');
});

// Admin page
app.get('/admin', (req, res) => {
    if (loggedIn) res.sendFile(__dirname + '/public/html/admin-home.html');
    else res.sendFile(__dirname + '/public/html/admin-login.html');
})

// Customer List page
app.get('/admin/custlist', (req, res) => {
    if (loggedIn) res.sendFile(__dirname + '/public/html/custlist.html');
    else res.redirect('/admin?invalid');
});

// Customer Messages page
app.get('/admin/custmsg', (req, res) => {
    if (loggedIn) res.sendFile(__dirname + '/public/html/custmsg.html');
    else res.redirect('/admin?invalid');
});

// ******* PRODUCTS API
// Returns all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Fetches a specific product by ID.
app.get('/api/products/:id', (req, res) => {
    const product = products.find((h) => h.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found.');
    else res.send(product);
});

// Modifies rating
app.put('/api/products/:id/rating', textParser, function (req, res) {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).send('Product not found.');
    }

    if (req.body === 'good') {
        product.rating.good += 1;
    } else if (req.body === 'bad') {
        product.rating.bad += 1;
    } else {
        return res.status(400).send('Invalid rating type.');
    }

    res.send(product);
});

// ****** CONTACT API
// Get all messages
app.get('/api/contact/msg', (req, res) => {
    res.send(messages);
})

// Get message by ID
app.get('/api/contact/msg/:id', (req, res) => {
    const message = messages.find((h) => h.id === parseInt(req.params.id));
    if (!message) return res.status(404).send('Message not found.');
    else res.send(message);
})

// Adds a new customer message and redirects to social media marketing or email marketing page
app.post('/api/contact/msg/new', urlencodedParser, function (req, res) {
    // Prepare output in JSON format
    let newMessage = {
        id: messages.length + 1,
        name: req.body.name,
        email: req.body.email,
        num: req.body.num,
        subject: req.body.subject,
        message: req.body.message,
        preferred: req.body.preferred
    };

    let newCustomer = {
        id: customers.length + 1,
        name: req.body.name,
        email: req.body.email,
        num: req.body.num,
        preferred: req.body.preferred
    };

    if (newMessage.preferred == 'Social Media Marketing') {
        messages.push(newMessage);
        res.redirect('/contact/smm');
    }

    else if (newMessage.preferred == 'Email Marketing') {
        messages.push(newMessage);
        res.redirect('/contact/em');

    }

    customers.push(newCustomer);
});

// redirect to smm
app.get('/contact/smm', (req, res) => {
    res.sendFile(__dirname + '/public/html/smm.html');
});

// redirect to em
app.get('/contact/em', (req, res) => {
    res.sendFile(__dirname + '/public/html/em.html');
});

// **** CUSTOMERS API
// Get all customers
app.get('/api/customers/', (req, res) => {
    res.send(customers);
})

// Get customer by ID
app.get('/api/customers/:id', (req, res) => {
    const customer = customers.find((h) => h.id === parseInt(req.params.id));
    if (!customer) return res.status(404).send('Customer not found.');
    else res.send(customer);
})

// Get message by customer ID
app.get("/api/customers/:id/message", (req, res) => {
    const customerId = parseInt(req.params.id);
    const message = messages.find((msg) => msg.id === customerId);
    if (!message) return res.status(404).send("Message not found.");
    res.json(message);
});

// Adding a new customer will happen na doon sa contact, so no need api for post here.

// ****** ADMIN API
const adminUN = 'hanni'
const adminPW = 'abc123'

function changeLoginStatus(status) {
    loggedIn = status;
}

// For username and password checking for login
app.post('/api/admin/login', urlencodedParser, (req, res) => {
    let un = req.body.username;
    let pw = req.body.password;
    if (un == adminUN && pw == adminPW) {
        changeLoginStatus(true);
        res.redirect('/admin');
    }
    else {
        changeLoginStatus(false);
        res.redirect('/admin?incorrect');
    }
})

// For logout
app.post('/api/admin/logout', urlencodedParser, (req, res) => {
    changeLoginStatus(false);
    res.redirect('/admin');
})

module.exports = app;