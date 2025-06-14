const xlsx = require('xlsx');
const Record = require('../models/recordModels');
const moment = require('moment-timezone');

class RecordService {
    /**
     * Process Excel data from a buffer.
     * @param {Buffer} buffer - The buffer of the Excel file.
     * @returns {Array} Array of transformed records.
     */
    async processExcelBuffer(buffer) {
        try {
            // Read workbook from buffer
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Get the highest existing slNo in the database
            const highestSlNoRecord = await Record.findOne().sort({ slNo: -1 }).select('slNo');
            let highestSlNo = highestSlNoRecord ? highestSlNoRecord.slNo : 0;

            // Transform data to match schema
            const records = data.map(record => {
                const slNo = record.slNo || ++highestSlNo; // Use provided slNo or assign the next available one
                return {
                    name: record.Name || record.name || 'Unknown', // Default value if missing
                    company: record.Company || record.company || 'N/A',
                    usn: record.Usn || record.usn || 'Unknown',
                    dateUpdated: moment(record.DateUpdated || record.dateUpdated || Date.now())
                        .tz('Asia/Kolkata')
                        .format('YYYY-MM-DD'),
                    batch: record.Batch || record.batch || 'Unknown',
                    status: (record.Status || record.status || 'Unknown')
                        .trim()
                        .toLowerCase()
                        .replace(/\b\w/g, char => char.toUpperCase()),
                    requestUpdate: record.RequestUpdate === 'true' || record.RequestUpdate === true || false,
                    slNo, // Assign the resolved slNo
                };
            });

            return records;
        } catch (error) {
            console.error('Error processing Excel buffer:', error);
            throw new Error('Failed to process Excel file');
        }
    }

    /**
     * Save multiple records to the database.
     * @param {Array} records - Array of records to save.
     * @returns {Promise} Promise resolving with saved records.
     */
    async saveRecords(records) {
        try {
            if (records.length > 0) {
                for (const record of records) {
                    // Use `upsert` to avoid duplicate entries
                    await Record.updateOne(
                        { slNo: record.slNo },
                        { $set: record },
                        { upsert: true }
                    );
                }
                return records;
            } else {
                throw new Error('No valid records to save.');
            }
        } catch (error) {
            console.error('Error saving records:', error);
            throw error;
        }
    }

    // Other methods remain unchanged
    async getAllRecords(filters = {}) {
        try {
            return await Record.find(filters).sort({ dateUpdated: -1 });
        } catch (error) {
            console.error('Error fetching records:', error);
            throw error;
        }
    }

    async getPaginatedRecords(page = 1, limit = 5, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const records = await Record.find(filters)
                .skip(skip)
                .limit(limit)
                .sort({ dateUpdated: -1 });
            const totalRecords = await Record.countDocuments(filters);

            return { records, totalRecords };
        } catch (error) {
            console.error('Error fetching paginated records:', error);
            throw error;
        }
    }

    async getDashboardStats() {
        try {
            const records = await this.getAllRecords();

            return {
                alumniCount: records.length,
                higherStudiesCount: records.filter(record => record.status === 'Higher Studies').length,
                placedCount: records.filter(record => record.status === 'Placed').length,
                entrepreneurCount: records.filter(record => record.status === 'Entrepreneur').length,
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async updateRecord(id, data) {
        try {
            return await Record.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    }

    async deleteRecord(id) {
        try {
            return await Record.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    }
}

module.exports = new RecordService();
