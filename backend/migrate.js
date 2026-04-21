const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const UnitSchema = new mongoose.Schema({
    plan: String, l0: String, l1: String, l2: String, l3: String, l4: String,
    g: Number, n: Number, s: Number, p: Number, total: Number,
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    checkList: String,
    statusNote: String,
    prevG: Number, prevN: Number, prevS: Number, prevP: Number, prevTotal: Number
}, { timestamps: true });

const Unit = mongoose.model('Unit', UnitSchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!');

        const csvPath = 'C:/Users/noomi/.gemini/antigravity/brain/10afa16b-7b6f-45d2-bf65-eeed79003d08/.system_generated/steps/486/content.md';
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n');

        const units = [];
        // Header is at row 5 in spreadsheet, content starts at row 6.
        // In our content.md, line 1 is source, line 5 is header.
        // We start from line 6 (index 5)
        for (let i = 5; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',');
            if (cols.length < 11) continue;

            // Mapping columns
            const unit = {
                plan: cols[0],
                l0: cols[1],
                l1: cols[2],
                l2: cols[3],
                l3: cols[4],
                l4: cols[5],
                g: parseInt(cols[6]) || 0,
                n: parseInt(cols[7]) || 0,
                s: parseInt(cols[8]) || 0,
                p: parseInt(cols[9]) || 0,
                total: parseInt(cols[10]) || 0,
                checkList: cols[11],
                statusNote: cols[12] || '',
                prevG: parseInt(cols[6]) || 0,
                prevN: parseInt(cols[7]) || 0,
                prevS: parseInt(cols[8]) || 0,
                prevP: parseInt(cols[9]) || 0,
                prevTotal: parseInt(cols[10]) || 0
            };
            
            // Re-calculate total if it seems wrong
            if (unit.total === 0 && (unit.g || unit.n || unit.s || unit.p)) {
                unit.total = unit.g + unit.n + unit.s + unit.p;
                unit.prevTotal = unit.total;
            }

            units.push(unit);
        }

        console.log(`Parsed ${units.length} units.`);

        console.log('Clearing existing units...');
        await Unit.deleteMany({});
        console.log('Inserting new units...');
        await Unit.insertMany(units);

        console.log('🚀 Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
