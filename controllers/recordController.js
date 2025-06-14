const recordService = require('../services/recordService');

// Handle Excel file upload and process records
exports.uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file uploaded.');
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        console.log('Processing uploaded file:', req.file.originalname);

        // Process the file directly from the buffer
        const records = await recordService.processExcelBuffer(req.file.buffer);
        console.log(`Processed ${records.length} records successfully.`);

        try {
            // Save the processed records to the database
            await recordService.saveRecords(records);
            return res.status(200).json({
                success: true,
                message: 'File uploaded, processed, and records saved successfully.',
            });
        } catch (error) {
            // Handle duplicate key errors (e.g., `slNo` conflicts)
            if (error.code === 11000) {
                const duplicateKeyMatch = error.message.match(/dup key: {.*"slNo":\s*"?(\d+)"?\s*}/);
                const duplicateSlNo = duplicateKeyMatch ? duplicateKeyMatch[1] : 'Unknown';
                console.error(`Duplicate entry found for slNo: ${duplicateSlNo}`);
                return res.status(400).json({
                    success: false,
                    error: `Duplicate entry found for slNo: ${duplicateSlNo}`,
                });
            }

            // Handle other errors
            console.error('Error saving records:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to save records',
                details: error.message,
            });
        }
    } catch (error) {
        console.error('Error processing uploaded file:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to process file',
            details: error.message,
        });
    }
};

// Render the dashboard page with statistics
exports.getDashboard = async (req, res) => {
    try {
        // Extract and sanitize pagination parameters
        const page = Math.max(1, parseInt(req.query.page, 10) || 1); // Ensure at least page 1
        const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 5), 50); // Limit between 1 and 50

        // Fetch paginated records and stats
        const { records: users, totalRecords } = await recordService.getPaginatedRecords(page, limit);
        const stats = await recordService.getDashboardStats();

        const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

        // Render the dashboard with all necessary variables
        res.render('dashboard', {
            users,
            isNoData: users.length === 0,
            alumniCount: stats.alumniCount || 0,
            higherStudiesCount: stats.higherStudiesCount || 0,
            placedCount: stats.placedCount || 0,
            entrepreneurCount: stats.entrepreneurCount || 0,
            currentPage: page,
            totalPages,
            limit, // Pass the limit for reference
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error.message);
        res.status(500).render('error', {
            message: 'Error loading dashboard',
            error,
        });
    }
};

// Fetch all records as JSON
exports.getRecords = async (req, res) => {
    try {
        const filters = {}; // Add filter handling if required
        const records = await recordService.getAllRecords(filters);

        res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error('Error fetching records:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch records',
            details: error.message,
        });
    }
};
