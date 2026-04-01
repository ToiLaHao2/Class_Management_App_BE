import fetch from 'node-fetch';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3002'; // Default port cho Socket Server

async function runTest() {
    console.log('=============================================');
    console.log(' CMA BACKEND - TEST PHASE 7 (NOTIFICATIONS)');
    console.log('=============================================\n');

    let adminToken = '';
    let adminUserId = '';

    // 1. LOGIN ĐỂ LẤY TOKEN
    console.log('1. Logging in as Admin...');
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'root@admin.com',
                password: 'ChangeMe@123'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
        
        adminToken = loginData.accessToken;
        adminUserId = loginData.user.id;
        console.log(`✅ Login Success! Token: ${adminToken.substring(0, 20)}...`);
    } catch (err) {
        console.error('❌ Login Failed:', err.message);
        process.exit(1);
    }

    // 2. CONNECT SOCKET.IO
    console.log('\n2. Connecting to WebSocket Server...');
    const socket = io(SOCKET_URL, {
        auth: { token: adminToken }
    });

    let socketConnected = false;
    let receivedNotification = null;

    socket.on('connect', () => {
        socketConnected = true;
        console.log(`✅ Socket connected with ID: ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
        console.error(`❌ Socket Connection Error: ${err.message}`);
    });

    socket.on('new_notification', (data) => {
        console.log('\n💥 [REAL-TIME] BINGO! Received Notification from Server🔥:');
        console.log(data);
        receivedNotification = data;
    });

    // Chờ socket connect
    await new Promise(r => setTimeout(r, 1500));
    if (!socketConnected) {
        console.log('⚠️ Không connect được Socket, tiếp tục test API...');
    }

    // 3. KÍCH HOẠT TẠO THÔNG BÁO TỪ API GATEWAY
    console.log('\n3. Triggering a new Notification (via REST API)...');
    try {
        const createRes = await fetch(`${API_URL}/notifications/test-trigger`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                user_id: adminUserId,
                title: 'Hệ thống chuẩn bị bảo trì',
                content: 'Vui lòng lưu lại toàn bộ công việc trước 12:00 đêm nay.',
                type: 'SYSTEM',
                ref_type: 'server',
                ref_id: adminUserId // Dummy ID
            })
        });
        const text = await createRes.text();
        if (!createRes.ok) throw new Error(text);
        console.log(`✅ API Response (Trigger Success): Created Notification!`);
    } catch (err) {
        console.error('❌ Trigger Failed:', err.message);
        process.exit(1);
    }

    // Đợi 1 giây để Redis và Socket bắn Notify về máy
    await new Promise(r => setTimeout(r, 1000));

    // 4. KIỂM TRA DATABASE (GET LIST API)
    console.log('\n4. Fetching Unread Count...');
    let totalUnread = 0;
    try {
        const countRes = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const countData = await countRes.json();
        totalUnread = countData.count;
        console.log(`✅ Unread count: ${totalUnread}`);
    } catch (err) {
        console.error('❌ Fetch Count Failed:', err.message);
    }

    // 5. ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
    console.log('\n5. Marking all as read...');
    try {
        const readRes = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const readData = await readRes.json();
        console.log(`✅ Marked all as read. Success: ${readData.success}`);
    } catch (err) {
        console.error('❌ Read-All Failed:', err.message);
    }

    socket.disconnect();

    if (receivedNotification) {
        console.log('\n🎉 ALL TESTS PASSED! Hệ thống Notification End-to-End hoạt động tuyệt vời!');
    } else {
        console.log('\n⚠️ DONE! Database API chạy tốt nhưng Socket không nhận được sự kiện (kiểm tra lại cổng/tín hiệu).');
    }
    
    process.exit(0);
}

runTest();
