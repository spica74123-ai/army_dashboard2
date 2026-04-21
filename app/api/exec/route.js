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
            case 'checkLogin':
                const user = await User.findOne({ username: data.username });
                if (user && await user.comparePassword(data.password)) {
                    response = { success: true, name: user.name, role: user.role };
                } else {
                    response = { error: "ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง" };
                }
                break;

            case 'getUsersData':
                const users = await User.find();
                response = { rows: users.map(u => ({ username: u.username, password: u.password, name: u.name, role: u.role, rowIndex: u._id.toString() })) };
                break;

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

            case 'getUnitData':
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

            case 'saveUnitData':
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

            case 'getPersonnelData':
                const personnels = await Personnel.find();
                response = { rows: personnels.map(p => ({
                    rank: p.rank, name: p.name, position_normal: p.position_normal, 
                    position_field: p.position_field, id_card: p.id_card, mil_id: p.mil_id, 
                    unit: p.unit, affiliation: p.affiliation, 
                    timestamp: p.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }), rowIndex: p._id.toString()
                }))};
                break;

            case 'savePersonnelData':
                let fileUrl = data.id_card; 
                if (data.id_card && data.id_card.length > 500) {
                    fileUrl = `data:application/octet-stream;base64,${data.id_card}`;
                }
                const pData = { ...data, id_card: fileUrl };
                if (data.rowIndex) await Personnel.findByIdAndUpdate(data.rowIndex, pData);
                else await Personnel.create(pData);
                response = { success: true };
                break;

            case 'deletePersonnelData':
                await Personnel.findByIdAndDelete(data.rowIndex);
                response = { success: true };
                break;

            case 'getLogsData':
                const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
                response = { rows: logs.map(l => ({
                    timestamp: l.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
                    name: l.name, role: l.role, action: l.action
                }))};
                break;

            case 'saveLog':
                await Log.create(data);
                response = { success: true };
                break;

            case 'getCasualtyData':
                const casualties = await Casualty.find();
                response = { rows: casualties.map(c => ({
                    ...c.toObject(), rowIndex: c._id.toString()
                }))};
                break;

            case 'saveCasualtyData':
                let picUrl = data.picUrl || "";
                if (data.picBase64 && data.picBase64.length > 100) {
                     picUrl = `data:image/jpeg;base64,${data.picBase64}`;
                }
                const cData = { ...data, picUrl };
                if (data.rowIndex) await Casualty.findByIdAndUpdate(data.rowIndex, cData);
                else await Casualty.create(cData);
                response = { success: true };
                break;

            case 'deleteCasualtyData':
                await Casualty.findByIdAndDelete(data.rowIndex);
                response = { success: true };
                break;

            default:
                throw new Error(`ไม่รู้จักคำสั่ง API: ${action}`);
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
