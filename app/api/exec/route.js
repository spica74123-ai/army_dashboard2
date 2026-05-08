import { NextResponse } from 'next/server';
import connectDB, { prisma } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await connectDB();
        const { action, data } = await request.json();

        if (!action) {
            return NextResponse.json({ success: false, error: "ไม่มีคำสั่ง (Action) ที่ระบุ" }, { status: 400 });
        }

        let response = {};

        switch (action) {
            case 'checkLogin': {
                const user = await prisma.user.findUnique({ 
                    where: { username: data.username } 
                });
                if (user && await bcrypt.compare(data.password, user.password)) {
                    response = { success: true, name: user.name, role: user.role };
                } else {
                    response = { error: "ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง" };
                }
                break;
            }

            case 'getUsersData': {
                const users = await prisma.user.findMany();
                response = { rows: users.map(u => ({ 
                    username: u.username, 
                    password: u.password, 
                    name: u.name, 
                    role: u.role, 
                    rowIndex: u.id.toString() 
                })) };
                break;
            }

            case 'saveUserData': {
                const userData = { ...data };
                const rowIndex = userData.rowIndex;
                delete userData.rowIndex;

                // Hash password if it's new or changed
                if (userData.password && !userData.password.startsWith('$2')) {
                    const salt = await bcrypt.genSalt(10);
                    userData.password = await bcrypt.hash(userData.password, salt);
                }

                if (rowIndex && rowIndex !== -1 && rowIndex !== "-1") {
                    await prisma.user.update({
                        where: { id: parseInt(rowIndex) },
                        data: userData
                    });
                } else {
                    const exists = await prisma.user.findUnique({ where: { username: userData.username } });
                    if (exists) throw new Error("Username นี้มีผู้ใช้งานในระบบแล้ว");
                    
                    // If no password provided for new user, set default or throw error
                    if (!userData.password) {
                        const salt = await bcrypt.genSalt(10);
                        userData.password = await bcrypt.hash('123', salt);
                    }
                    
                    await prisma.user.create({ data: userData });
                }
                response = { success: true };
                break;
            }

            case 'deleteUserData':
                await prisma.user.delete({
                    where: { id: parseInt(data.rowIndex) }
                });
                response = { success: true };
                break;

            case 'getUnitData': {
                const units = await prisma.unit.findMany();
                const unitRows = units.map(u => [
                    u.plan || "", u.l0 || "", u.l1 || "", u.l2 || "", u.l3 || "", u.l4 || "",
                    u.g, u.n, u.s, u.p, u.total, u.checkList || "", u.statusNote || "",
                    u.prevG, u.prevN, u.prevS, u.prevP, u.prevTotal, u.id.toString(),
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

                const unitData = { ...data };
                const rowIndex = unitData.rowIndex;
                delete unitData.rowIndex;

                // Convert numbers
                unitData.g = Number(unitData.g) || 0;
                unitData.n = Number(unitData.n) || 0;
                unitData.s = Number(unitData.s) || 0;
                unitData.p = Number(unitData.p) || 0;
                unitData.lat = Number(unitData.lat) || 0;
                unitData.lng = Number(unitData.lng) || 0;

                if (rowIndex) {
                    const existingUnit = await prisma.unit.findUnique({ where: { id: parseInt(rowIndex) } });
                    if (!existingUnit) throw new Error("ไม่พบข้อมูลเดิม");
                    
                    unitData.prevG = existingUnit.g; 
                    unitData.prevN = existingUnit.n;
                    unitData.prevS = existingUnit.s; 
                    unitData.prevP = existingUnit.p;
                    unitData.prevTotal = existingUnit.total;
                    unitData.total = total;
                    unitData.statusNote = statusNote;

                    await prisma.unit.update({
                        where: { id: parseInt(rowIndex) },
                        data: unitData
                    });
                } else {
                    unitData.total = total;
                    unitData.statusNote = statusNote;
                    unitData.prevG = unitData.g; 
                    unitData.prevN = unitData.n; 
                    unitData.prevS = unitData.s; 
                    unitData.prevP = unitData.p; 
                    unitData.prevTotal = total;
                    await prisma.unit.create({ data: unitData });
                }
                response = { success: true };
                break;
            }

            case 'getPersonnelData': {
                const personnels = await prisma.personnel.findMany();
                response = { rows: personnels.map(p => ({
                    rank: p.rank, name: p.name, position_normal: p.position_normal, 
                    position_field: p.position_field, id_card: p.id_card, mil_id: p.mil_id, 
                    unit: p.unit, affiliation: p.affiliation, 
                    timestamp: p.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }), 
                    rowIndex: p.id.toString()
                }))};
                break;
            }

            case 'savePersonnelData': {
                const pData = { ...data };
                const rowIndex = pData.rowIndex;
                delete pData.rowIndex;

                let fileUrl = pData.id_card; 
                if (pData.id_card && pData.id_card.length > 500) {
                    fileUrl = `data:application/octet-stream;base64,${pData.id_card}`;
                }
                pData.id_card = fileUrl;

                if (rowIndex) {
                    await prisma.personnel.update({
                        where: { id: parseInt(rowIndex) },
                        data: pData
                    });
                } else {
                    await prisma.personnel.create({ data: pData });
                }
                response = { success: true };
                break;
            }

            case 'deletePersonnelData':
                await prisma.personnel.delete({
                    where: { id: parseInt(data.rowIndex) }
                });
                response = { success: true };
                break;

            case 'getLogsData': {
                const logs = await prisma.log.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 200
                });
                response = { rows: logs.map(l => ({
                    timestamp: l.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
                    name: l.name, role: l.role, action: l.action
                }))};
                break;
            }

            case 'saveLog':
                await prisma.log.create({ data });
                response = { success: true };
                break;

            case 'getCasualtyData': {
                const casualties = await prisma.casualty.findMany();
                response = { rows: casualties.map(c => ({
                    ...c, 
                    rowIndex: c.id.toString(),
                    createdAt: c.createdAt.toISOString(),
                    updatedAt: c.updatedAt.toISOString()
                }))};
                break;
            }

            case 'saveCasualtyData': {
                const cData = { ...data };
                const rowIndex = cData.rowIndex;
                delete cData.rowIndex;

                let picUrl = cData.picUrl || "";
                if (cData.picBase64 && cData.picBase64.length > 100) {
                     picUrl = `data:image/jpeg;base64,${cData.picBase64}`;
                }
                delete cData.picBase64;
                cData.picUrl = picUrl;

                if (rowIndex) {
                    await prisma.casualty.update({
                        where: { id: parseInt(rowIndex) },
                        data: cData
                    });
                } else {
                    await prisma.casualty.create({ data: cData });
                }
                response = { success: true };
                break;
            }

            case 'deleteCasualtyData':
                await prisma.casualty.delete({
                    where: { id: parseInt(data.rowIndex) }
                });
                response = { success: true };
                break;

            case 'getArmyStructures': {
                const structures = await prisma.armyStructure.findMany({
                    take: 100
                });
                response = { rows: structures, total: structures.length };
                break;
            }

            case 'getArmyStats': {
                const armyStatsRaw = await prisma.armyStructure.groupBy({
                    by: ['plan'],
                    _count: { _all: true },
                    _sum: {
                        total: true,
                        general: true,
                        colonel: true,
                        major: true,
                        soldier: true
                    },
                    orderBy: {
                        _sum: { total: 'desc' }
                    }
                });
                
                const armyStats = armyStatsRaw.map(s => ({
                    _id: s.plan,
                    count: s._count._all,
                    totalPersonnel: s._sum.total || 0,
                    generals: s._sum.general || 0,
                    colonels: s._sum.colonel || 0,
                    majors: s._sum.major || 0,
                    soldiers: s._sum.soldier || 0
                }));
                response = { stats: armyStats };
                break;
            }

            case 'migrateSheets': {
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

                // Delete all existing and insert new
                await prisma.armyStructure.deleteMany({});
                await prisma.armyStructure.createMany({
                    data: documents
                });

                const sheetsStatsRaw = await prisma.armyStructure.groupBy({
                    by: ['plan'],
                    _count: { _all: true },
                    _sum: { total: true },
                    orderBy: { _sum: { total: 'desc' } }
                });

                const sheetsStats = sheetsStatsRaw.map(s => ({
                    _id: s.plan,
                    count: s._count._all,
                    totalPersonnel: s._sum.total || 0
                }));

                const totalRecords = await prisma.armyStructure.count();
                const totalPersonnelResult = await prisma.armyStructure.aggregate({
                    _sum: { total: true }
                });
                const totalPersonnel = totalPersonnelResult._sum.total || 0;

                response = {
                    success: true,
                    message: `Successfully imported ${documents.length} records`,
                    stats: {
                        importedRecords: documents.length,
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
