import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';
const EMAIL = 'root@admin.com';
const PASS = 'ChangeMe@123';

async function testAttachments() {
    console.log('=============================================');
    console.log(' CMA BACKEND - TEST PHASE 6 (ATTACHMENTS)   ');
    console.log('=============================================\n');

    try {
        console.log('1. Logging in...');
        let loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASS })
        });
        
        let loginData = await loginRes.json();
        
        if (loginRes.status === 401 || (loginData && loginData.message === "User not found")) {
            console.log('   => Admin not found, auto-registering...');
            await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASS, first_name: 'System', last_name: 'Admin', role: 'teacher' })
            });

            // Re-login
            loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASS })
            });
            loginData = await loginRes.json();
        }

        if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
        const token = loginData.accessToken;
        console.log(`✅ Login Success! Token: ${token.substring(0, 20)}...`);

        // 2. Prepare Dummy File
        console.log('\n2. Creating dummy file...');
        const dummyPath = path.join(process.cwd(), 'dummy_test.txt');
        fs.writeFileSync(dummyPath, 'This is a test document payload.', { encoding: 'utf8' });
        console.log('✅ File created:', dummyPath);

        const refId = '00000000-0000-0000-0000-000000000000'; // Fake UUID
        const refType = 'schedule';

        // 3. Upload File
        console.log('\n3. Uploading file via MultipartFormData...');
        
        // Use Node 20's global FormData + Blob
        const formData = new FormData();
        formData.append('ref_type', refType);
        formData.append('ref_id', refId);
        
        const fileBuffer = fs.readFileSync(dummyPath);
        const fileBlob = new Blob([fileBuffer], { type: 'text/plain' });
        formData.append('file', fileBlob, 'dummy_test.txt');

        const uploadRes = await fetch(`${API_URL}/attachments/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const uploadText = await uploadRes.text();
        let uploadData;
        try {
            uploadData = JSON.parse(uploadText);
        } catch {
            throw new Error(`Upload Failed (Non-JSON): ${uploadText}`);
        }
        
        if (!uploadRes.ok) {
            throw new Error(`Upload Failed: ${JSON.stringify(uploadData)}`);
        }

        console.log('✅ Upload Success!');
        console.log('   => ID:', uploadData.id);
        console.log('   => URL:', uploadData.url);
        console.log('   => Provider:', uploadData.provider);

        // 4. List Attachments
        console.log('\n4. Fetching Attachments...');
        const getRes = await fetch(`${API_URL}/attachments?ref_type=${refType}&ref_id=${refId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();
        if (!getRes.ok) throw new Error(`Fetch Failed: ${JSON.stringify(getData)}`);
        
        console.log(`✅ Check Success! Found ${getData.length} attachments`);
        console.table(getData.map(x => ({ id: x.id, name: x.file_name, url: x.url })));

        // 5. Delete Attachment
        console.log('\n5. Deleting Attachment...');
        const delRes = await fetch(`${API_URL}/attachments/${uploadData.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const delData = await delRes.json();
        if (!delRes.ok) throw new Error(`Delete Failed: ${JSON.stringify(delData)}`);
        
        console.log(`✅ Delete Success: ${delData.message}`);

        // Cleanup
        fs.unlinkSync(dummyPath);
        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (err) {
        console.error('\n❌ TEST FAILED:');
        console.error(err.message);
        process.exit(1);
    }
}

testAttachments();
