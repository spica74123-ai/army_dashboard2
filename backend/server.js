// 1. ติดตั้ง Dependencies ก่อนใช้งาน:
// npm install express mongoose cors dotenv

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// อนุญาตให้เรียกข้ามโดเมนและรับ Payload ขนาดใหญ่ (สำหรับรูปภาพ Base64)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 🔴 1. MONGODB SCHEMAS (โครงสร้างข้อมูล)
// ==========================================

const UnitSchema = new mongoose.Schema({
    plan: String, l0: String, l1: String, l2: String, l3: String, l4: String,
    g: { type: Number, default: 0 }, n: { type: Number, default: 0 },
    s: { type: Number, default: 0 }, p: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 },
    checkList: String, statusNote: String,
    prevG: { type: Number, default: 0 }, prevN: { type: Number, default: 0 },
    prevS: { type: Number, default: 0 }, prevP: { type: Number, default: 0 },
    prevTotal: { type: Number, default: 0 }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, default: 'Viewer' }
});

// Middleware เผื่อ Hash รหัสผ่านก่อนบันทึก
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// เปรียบเทียบรหัสผ่าน (ใช้ bcrypt)
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const PersonnelSchema = new mongoose.Schema({
    rank: String, // ชื่อหน่วย
    name: String, // อัตรา
    position_normal: String, // บรรจุจริง
    position_field: String, // ชื่อไฟล์
    id_card: String, // URL ไฟล์ หรือ Base64
    mil_id: String, // เจ้าหน้าที่
    unit: String, // isConfirmed (true/false)
    affiliation: String,
    line_id: String,
}, { timestamps: true });

const LineUserSchema = new mongoose.Schema({
    lineId: { type: String, required: true, unique: true },
    rank: String, name: String, position: String, affiliation: String,
    unit: String, phone: String, email: String, role: String, profilePic: String
});

const LogSchema = new mongoose.Schema({
    name: String, role: String, action: String
}, { timestamps: true });

const CasualtySchema = new mongoose.Schema({
    date: String, name: String, unit: String, cause: String,
    status: String, picUrl: String, doctorConfirm: String
}, { timestamps: true });

// Models
const Unit = mongoose.model('Unit', UnitSchema);
const User = mongoose.model('User', UserSchema);
const Personnel = mongoose.model('Personnel', PersonnelSchema);
const LineUser = mongoose.model('LineUser', LineUserSchema);
const Log = mongoose.model('Log', LogSchema);
const Casualty = mongoose.model('Casualty', CasualtySchema);


// ==========================================
// 🔴 2. MAIN API ROUTE (ใช้แทน doPost ของ GAS)
// ==========================================

app.post('/api/exec', async (req, res) => {
    const { action, data } = req.body;
    
    if (!action) {
        return res.json({ success: false, error: "ไม่มีคำสั่ง (Action) ที่ระบุ" });
    }

    try {
        let response = {};

        switch (action) {
            // --- ระบบ Login & Users ---
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

            // --- ระบบ โครงสร้างหน่วย ---
            case 'getUnitData':
                const units = await Unit.find();
                // แปลง Format ให้ตรงกับที่ Frontend เดิมคาดหวัง (Array of Arrays)
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

            // --- ระบบ นำเข้ากำลังพล ---
            case 'getPersonnelData':
                const personnels = await Personnel.find();
                response = { rows: personnels.map(p => ({
                    rank: p.rank, name: p.name, position_normal: p.position_normal, 
                    position_field: p.position_field, id_card: p.id_card, mil_id: p.mil_id, 
                    unit: p.unit, affiliation: p.affiliation, line_id: p.line_id, 
                    timestamp: p.createdAt.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }), rowIndex: p._id.toString()
                }))};
                break;

            case 'savePersonnelData':
                // จำลองการอัปโหลดไฟล์ (ในโปรเจกต์จริงควรใช้ AWS S3 หรือเก็บลง Disk)
                let fileUrl = data.id_card; 
                if (data.id_card && data.id_card.length > 500) {
                    fileUrl = `data:application/octet-stream;base64,${data.id_card}`; // เก็บเป็น Base64 ไว้ใน DB ชั่วคราว
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

            // --- ระบบ LINE Login ---
            case 'checkLineLogin':
                const lUser = await LineUser.findOne({ lineId: data.lineId });
                if (lUser) response = { success: true, rank: lUser.rank, name: lUser.name, role: lUser.role, profilePic: lUser.profilePic };
                else response = { error: "NOT_FOUND" };
                break;

            case 'registerLineUser':
                if (!data.role) data.role = 'Editor';
                await LineUser.create(data);
                response = { success: true };
                break;

            // --- ระบบ Logs ---
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

            // --- ระบบ ผู้บาดเจ็บ/สูญเสีย ---
            case 'getCasualtyData':
                const casualties = await Casualty.find();
                response = { rows: casualties.map(c => ({
                    ...c.toObject(), rowIndex: c._id.toString()
                }))};
                break;

            case 'saveCasualtyData':
                let picUrl = data.picUrl || "";
                if (data.picBase64 && data.picBase64.length > 100) {
                     picUrl = `data:image/jpeg;base64,${data.picBase64}`; // เก็บเป็น Base64
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

            // --- ระบบ PDF ---
            case 'generateSinglePDF':
                // PDF จำเป็นต้องใช้ไลบรารีเพิ่มเติมใน Node (เช่น pdfkit หรือ puppeteer)
                response = { url: "https://example.com/mock-pdf-url.pdf", message: "ฟังก์ชันออก PDF ต้องติดตั้งไลบรารีเพิ่มเติมใน Node.js" };
                break;

            default:
                throw new Error(`ไม่รู้จักคำสั่ง API: ${action}`);
        }

        res.json(response);

    } catch (error) {
        console.error(`Error in action [${action}]:`, error);
        res.json({ error: error.message || error.toString() });
    }
});

// ==========================================
// 🔴 3. START SERVER
// ==========================================
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rta_tactical_db";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("✅ เชื่อมต่อ MongoDB สำเร็จ!");
        
        // สร้าง Admin เริ่มต้นถ้ายังไม่มีในระบบ
        User.findOne({ username: 'admin' }).then(async admin => {
            if (!admin) {
                // สร้าง User Admin (รหัสผ่านจะถูก hash โดย pre-save hook)
                await User.create({ username: 'admin', password: '123', name: 'System Admin', role: 'Admin' });
                console.log("👤 สร้าง User 'admin' รหัส '123' เริ่มต้นให้แล้ว (Hashed)");
            }
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server เปิดทำงานที่พอร์ต http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error("❌ ไม่สามารถเชื่อมต่อ MongoDB ได้:", err));