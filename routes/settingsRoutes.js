
const express = require("express");
const addAdminController = require("../controllers/addAdminController");
const addNewAluminiController= require("../controllers/addNewAluminiController")
const router = express.Router();
const isAuthenticated = require("../middleware/authMiddleware");


router.get("/", (req, res) => {
    const user = {
        name: "Rheya",
        role: "Admin",
        fullname: "Rheya Kumar",
        email: "rheya@example.com",
        phone: "9876543210",
    };
    
    const activeSidebar = req.query.sidebar || "accountSettings";
    
    res.render("settings", {
        user: user,
        activeSidebar: activeSidebar,
    });
});

// Add New Admin page route
router.get("/addNewAdmin", isAuthenticated, (req, res) => {
    res.render("settings", {
        user: req.user,
        activeSidebar: "addNewAdmin"
    });
});

// Handle the POST request for adding new admin
router.post("/addNewAdmin", addAdminController.addNewAdmin);
router.post("/addNewAlumini",addNewAluminiController.addNewAlumni);
module.exports = router;