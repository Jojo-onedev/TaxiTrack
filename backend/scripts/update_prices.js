const pool = require('../src/config/database');

const updatePrices = async () => {
    try {
        console.log('Updating all ride prices to 5000 CFA...');
        const result = await pool.query('UPDATE rides SET prix = 5000');
        console.log(`Updated ${result.rowCount} rides.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
};

updatePrices();
