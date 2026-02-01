// Firebase Admin SDK load karein
const admin = require('firebase-admin');

// Firebase Initialization (Server-side security ke liye)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "movie-1e6fc",
            // Note: Private key handle karne ka sahi tareeka Vercel Environment Variables hain
            // Lekin asan setup ke liye hum direct database use kar rahe hain
        }),
        databaseURL: "https://movie-1e6fc-default-rtdb.firebaseio.com" 
    });
}

const db = admin.database();

export default async function handler(req, res) {
    // Sirf POST request allow karein
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;
    const path = email.replace(/\./g, ',');

    try {
        // 1. Database se User check karein
        const userSnap = await db.ref('premium_members/' + path).once('value');
        const userData = userSnap.val();

        if (userData && userData.password === password) {
            // Check Expiry
            const now = new Date().getTime();
            if (now > userData.expiry) {
                return res.status(403).json({ success: false, message: "Expired" });
            }

            // 2. Database se Active Tools uthayein (Jo aapne Admin se add kiye)
            const toolsSnap = await db.ref('active_tools').once('value');
            const toolsData = toolsSnap.val() || {};

            // 3. Tools ka HTML generate karein
            let toolsHtml = '<div class="tool-grid">';
            Object.keys(toolsData).forEach(key => {
                const tool = toolsData[key];
                toolsHtml += `
                    <div class="tool-card" onclick="window.open('${tool.link}', '_blank')">
                        <img src="${tool.icon}" width="50" style="border-radius:10px;">
                        <h4 style="color:#00ff88; margin:10px 0 5px 0;">${tool.name}</h4>
                        <p style="font-size:10px; color:#888;">Premium Tool Active</p>
                    </div>`;
            });
            toolsHtml += '</div>';

            // 4. Asli code User ko bhejien (Inject karne ke liye)
            return res.status(200).json({
                success: true,
                injectHtml: `
                    <div style="animation: fadeIn 0.8s;">
                        <h3 style="color:#00ff88;">🔓 WELCOME BACK, ${email.split('@')[0].toUpperCase()}</h3>
                        <p style="font-size:12px; color:#aaa;">Your Premium Access is Active</p>
                        <hr style="border:0.5px solid #222; margin:20px 0;">
                        ${toolsHtml}
                    </div>`
            });

        } else {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}
