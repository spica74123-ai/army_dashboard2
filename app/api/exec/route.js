import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import mongoose from 'mongoose';

export async function POST(request) {
    try {
        await connectDB();
        const { action, data } = await request.json();

        if (!action) {
            return NextResponse.json({ success: false, error: "ไม่มีคำสั่ง (Action) ที่ระบุ" }, { status: 400 });
        }

        const Unit = mongoose.models.Unit;
        const User = mongoose.models.User;
        const Personnel = mongoose.models.Personnel;
        const Log = mongoose.models.Log;
        const Casualty = mongoose.models.Casualty;

        let response = {};

        switch (action) {
            case 'checkLogin': {
                const user = await User.findOne({ username: data.username });
                if (user && await user.comparePassword(data.password)) {
                    response = { success: true, name: user.name, role: user.role };
                } else {
                    response = { error: "ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง" };
                }
                break;
            }

            case 'getUsersData': {
                const users = await User.find();
                response = { rows: users.map(u => ({ username: u.username, password: u.password, name: u.name, role: u.role, rowIndex: u._id.toString() })) };
                break;
            }

            case 'saveUserData':
                if (data.rowIndex && data.rowIndex !== -1) {
                    await User.findByIdAndUpdate(data.rowIndex, data);
                } else {
                    const exists = await User.findOne({ username: data.username });
                    if (exists) throw new Error("Username นี้มีผู้ใช้งานในระบบแล้ว");
                    await User.create(data);
                }
                response = { success: true };
                break;

            case 'deleteUserData':
                await User.findByIdAndDelete(data.rowIndex);
                response = { success: true };
                break;

            case 'getUnitData': {
                const units = await Unit.find();
                const unitRows = units.map(u => [
                    u.plan || "", u.l0 || "", u.l1 || "", u.l2 || "", u.l3 || "", u.l4 || "",
                    u.g, u.n, u.s, u.p, u.total, u.checkList || "", u.statusNote || "",
                    u.prevG, u.prevN, u.prevS, u.prevP, u.prevTotal, u._id.toString(),
                    u.lat || 0, u.lng || 0
                ]);
                const headers = ["แผนยุทธศาสตร์", "ส่วนภูมิภาค", "จัดกำลัง", "กองกำลัง", "หน่วยเฉพาะกิจ", "หน่วย", "นายพล", "น.", "ส.", "พลฯ", "รวม", "Check List", "อัปเดต", "นายพล(เดิม)", "น.(เดิม)", "ส.(เดิม)", "พลฯ(เดิม)", "รวม(เดิม)", "rowIndex"];
                response = { headers, rows: unitRows, sheetName: "DB" };
                break;
            }

            case 'saveUnitData': {
                const dt = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
                const statusNote = `Updated: ${dt}`;
                const total = (Number(data.g) || 0) + (Number(data.n) || 0) + (Number(data.s) || 0) + (Number(data.p) || 0);

                if (data.rowIndex) {
                    const existingUnit = await Unit.findById(data.rowIndex);
                    if (!existingUnit) throw new Error("ไม่พบข้อมูลเดิม");
                    
                    data.prevG = existingUnit.g; data.prevN = existingUnit.n;
                    data.prevS = existingUnit.s; data.prevP = existingUnit.p;
                    data.prevTotal = existingUnit.total;
                    data.total = total;
                    data.statusNote = statusNote;

                    await Unit.findByIdAndUpdate(data.rowIndex, data);
                } else {
                    data.total = total;
                    data.statusNote = statusNote;
                    data.prevG = data.g; data.prevN = data.n; data.prevS = data.s; data.prevP = data.p; data.prevTotal = total;
                    await Unit.create(data);
                }
                response = { success: true };
                break;
            }

            case 'getPersonnelData': {
                const personnels = await Personnel.find();
                response = { rows: personnels.map(p => ({
                    rank: p.rank, name: p.name, position_normal: p.position_normal, 
                    position_field: p.position_field, id_card: p.id_card, mil_id: p.mil_id, 
                    unit: p.unit, affiliation: p.affiliation, 
                    timestamp: p.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }), rowIndex: p._id.toString()
                }))};
                break;
            }

            case 'savePersonnelData': {
                let fileUrl = data.id_card; 
                if (data.id_card && data.id_card.length > 500) {
                    fileUrl = `data:application/octet-stream;base64,${data.id_card}`;
                }
                const pData = { ...data, id_card: fileUrl };
                if (data.rowIndex) await Personnel.findByIdAndUpdate(data.rowIndex, pData);
                else await Personnel.create(pData);
                response = { success: true };
                break;
            }

            case 'deletePersonnelData':
                await Personnel.findByIdAndDelete(data.rowIndex);
                response = { success: true };
                break;

            case 'getLogsData': {
                const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
                response = { rows: logs.map(l => ({
                    timestamp: l.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
                    name: l.name, role: l.role, action: l.action
                }))};
                break;
            }

            case 'saveLog':
                await Log.create(data);
                response = { success: true };
                break;

            case 'getCasualtyData': {
                const casualties = await Casualty.find();
                response = { rows: casualties.map(c => ({
                    ...c.toObject(), rowIndex: c._id.toString()
                }))};
                break;
            }

            case 'saveCasualtyData': {
                let picUrl = data.picUrl || "";
                if (data.picBase64 && data.picBase64.length > 100) {
                     picUrl = `data:image/jpeg;base64,${data.picBase64}`;
                }
                const cData = { ...data, picUrl };
                if (data.rowIndex) await Casualty.findByIdAndUpdate(data.rowIndex, cData);
                else await Casualty.create(cData);
                response = { success: true };
                break;
            }

            case 'deleteCasualtyData':
                await Casualty.findByIdAndDelete(data.rowIndex);
                response = { success: true };
                break;

            case 'getArmyStructures': {
                const ArmyStructureQuery = mongoose.models.ArmyStructure;
                if (!ArmyStructureQuery) {
                    response = { rows: [], total: 0 };
                    break;
                }

                const structures = await ArmyStructureQuery.find().limit(100);
                response = { rows: structures, total: structures.length };
                break;
            }

            case 'getArmyStats': {
                const ArmyStructureStats = mongoose.models.ArmyStructure;
                if (!ArmyStructureStats) {
                    response = { stats: [] };
                    break;
                }

                const armyStats = await ArmyStructureStats.aggregate([
                    {
                        $group: {
                            _id: '$plan',
                            count: { $sum: 1 },
                            totalPersonnel: { $sum: '$total' },
                            generals: { $sum: '$general' },
                            colonels: { $sum: '$colonel' },
                            majors: { $sum: '$major' },
                            soldiers: { $sum: '$soldier' }
                        }
                    },
                    { $sort: { totalPersonnel: -1 } }
                ]);
                response = { stats: armyStats };
                break;
            }

            case 'migrateSheets': {
                const armyStructureSchema = new mongoose.Schema({
                    plan: String,
                    level0: String,
                    level1: String,
                    level2: String,
                    level3: String,
                    level4: String,
                    name: String,
                    general: { type: Number, default: 0 },
                    colonel: { type: Number, default: 0 },
                    major: { type: Number, default: 0 },
                    soldier: { type: Number, default: 0 },
                    total: { type: Number, default: 0 },
                    checkList: Boolean,
                    note: String,
                    createdAt: { type: Date, default: Date.now },
                    updatedAt: { type: Date, default: Date.now }
                });

                const ArmyStructure = mongoose.models.ArmyStructure || 
                    mongoose.model('ArmyStructure', armyStructureSchema);

                // Fetch CSV from Google Sheets
                const SHEET_ID = '1Jbr9BJOO6-gsrK82JQNd-RCNetFmegSq4EjuO0TR3cM';
                const SHEET_GID = '46911911';
                const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

                const csvResponse = await fetch(CSV_URL);
                const csvText = await csvResponse.text();

                // Parse CSV
                const lines = csvText.trim().split('\n');
                const headers = parseCSVLine(lines[0]);

                const documents = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = parseCSVLine(line);
                    const row = {};
                    headers.forEach((header, idx) => {
                        row[header] = values[idx] || '';
                    });

                    if (!row['ปฏิบัติการหน้างาน (Level 4)'] && !row['นายพล']) continue;

                    const doc = {
                        plan: row['การจัดแผน'] || '',
                        level0: row['ระดับยุทธศาสตร์ (Level 0)'] || '',
                        level1: row['การจัดกำลัง (Level 1)'] || '',
                        level2: row['ระดับยุทธการ (Level 2)'] || '',
                        level3: row['ระดับยุทธวิธี (Level 3)'] || '',
                        level4: row['ปฏิบัติการหน้างาน (Level 4)'] || '',
                        name: row['ปฏิบัติการหน้างาน (Level 4)'] || '',
                        general: parseInt(row['นายพล']) || 0,
                        colonel: parseInt(row['น.']) || 0,
                        major: parseInt(row['ส.']) || 0,
                        soldier: parseInt(row['พลฯ']) || 0,
                        total: parseInt(row['รวม']) || 0,
                        checkList: (row['เช็ค List'] || '').toUpperCase() === 'TRUE',
                        note: row['หมายเหตุ'] || ''
                    };
                    documents.push(doc);
                }

                await ArmyStructure.deleteMany({});
                const importResult = await ArmyStructure.insertMany(documents);

                const sheetsStats = await ArmyStructure.aggregate([
                    {
                        $group: {
                            _id: '$plan',
                            count: { $sum: 1 },
                            totalPersonnel: { $sum: '$total' }
                        }
                    },
                    { $sort: { totalPersonnel: -1 } }
                ]);

                const totalRecords = await ArmyStructure.countDocuments({});
                const totalPersonnelResult = await ArmyStructure.aggregate([
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);
                const totalPersonnel = totalPersonnelResult[0]?.total || 0;

                response = {
                    success: true,
                    message: `Successfully imported ${importResult.length} records`,
                    stats: {
                        importedRecords: importResult.length,
                        totalRecords,
                        totalPersonnel,
                        byPlan: sheetsStats
                    }
                };
                break;
            }

            default:
                throw new Error(`ไม่รู้จักคำสั่ง API: ${action}`);
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// Helper function to parse CSV line with quote handling
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}
