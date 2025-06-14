const addAluminiModel = require("../models/recordModels");

exports.addNewAlumni = async (req, res) => {
    try {
        const { name, usn, company, batch, status, email } = req.body;

        // Validate if all required fields are provided
        if (!name || !usn || !company || !batch || !status || !email) {
            return res.status(400).json({ error: 'Name, USN, Company, Batch, Status, and Email are required fields' });
        }

        // Check if the alumni already exists
        const existingAlumni = await addAluminiModel.findOne({ usn });
        if (existingAlumni) {
            return res.status(400).json({ error: 'Alumni already exists with this USN' });
        }

        // Check for valid email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Find the smallest vacant slNo
        const existingSlNos = await addAluminiModel.find({}, 'slNo').sort('slNo');
        let vacantSlNo = 1;

        // Check for the first vacant slNo
        for (let i = 0; i < existingSlNos.length; i++) {
            if (existingSlNos[i].slNo !== vacantSlNo) {
                break; // Found vacant slNo
            }
            vacantSlNo++;
        }

        // Create a new alumni record with all fields
        const newAlumni = new addAluminiModel({
            name,
            usn,
            company,
            batch,
            status, // Added the status field
            email,  // Added the email field
            slNo: vacantSlNo // Assign the next vacant serial number
        });

        // Save the new alumni to the database
        await newAlumni.save();

        // Return success response
        return res.status(201).json({ message: 'Alumni added successfully', alumni: newAlumni });

    } catch (error) {
        console.error('Error adding alumni:', error);
        return res.status(500).json({ error: 'Server error, please try again later' });
    }
};
