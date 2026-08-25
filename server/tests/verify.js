const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('==================================================');
  console.log('STARTING ENHANCED AUTOMATED INTEGRATION TESTS...');
  console.log('==================================================\n');

  try {
    // -----------------------------------------------------------------
    // 1. LOGIN ADMIN WITH CUSTOM CREDENTIALS (EMAIL & ID CHECKS)
    // -----------------------------------------------------------------
    console.log('Step 1a: Logging in as Admin using Email (balisaikumar@gmial.com)...');
    const adminEmailLogin = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'balisaikumar@gmial.com',
      password: '123456'
    });
    console.log('   Success! Admin logged in via Email.');
    const adminToken = adminEmailLogin.data.token;

    console.log('\nStep 1b: Logging in as Admin using ID (12322006)...');
    const adminIdLogin = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: '12322006',
      password: '123456'
    });
    console.log('   Success! Admin logged in via ID.');

    // -----------------------------------------------------------------
    // 2. ADMIN REGISTER STUDENT
    // -----------------------------------------------------------------
    console.log('\nStep 2: Admin registering a student...');
    const studentRegData = {
      name: 'Admin Test Student',
      email: `student_admin_${Date.now()}@hostel.edu`,
      password: 'studentpassword123',
      phone: '9876543210',
      studentId: `ROLL-ADMIN-${Date.now()}`,
      department: 'Computer Science',
      year: '3rd Year',
      hostel: 'Kaveri Boys Hostel',
      roomNumber: '101'
    };

    const studentRegRes = await axios.post(`${BASE_URL}/admin/users/student`, studentRegData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   Success! Student registered by admin.');
    const studentProfileId = studentRegRes.data.student._id;
    const studentRollId = studentRegRes.data.student.studentId;

    // Login as student to get token
    console.log('   Logging in as newly created student to verify credentials...');
    const studentLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: studentRegData.email,
      password: 'studentpassword123'
    });
    const studentToken = studentLoginRes.data.token;
    console.log('   Success! Student logged in. Token generated.');

    // -----------------------------------------------------------------
    // 3. APPLY OUTPASS (STUDENT)
    // -----------------------------------------------------------------
    console.log('\nStep 3: Student applying for an outpass...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const returnTime = new Date(tomorrow);
    returnTime.setHours(tomorrow.getHours() + 5);

    const outpassData = {
      destination: 'City Market',
      purpose: 'Buying groceries',
      outingDate: tomorrow.toISOString(),
      expectedReturnDate: returnTime.toISOString(),
      emergencyContact: '9999999999',
      remarks: 'Will return before sunset'
    };

    const outpassRes = await axios.post(`${BASE_URL}/outpasses`, outpassData, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('   Success! Outpass request created with ID:', outpassRes.data._id);
    const outpassId = outpassRes.data._id;

    // -----------------------------------------------------------------
    // 4. OVERLAP PREVENTION CHECK (STUDENT)
    // -----------------------------------------------------------------
    console.log('\nStep 4: Checking outpass overlap prevention...');
    try {
      await axios.post(`${BASE_URL}/outpasses`, outpassData, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.error('   FAILED: Server allowed overlapping outpass request!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   Success! Server blocked overlapping outpass request (Status 400). Message:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // 5. ADMIN REGISTER PARENT (LINK TO STUDENT)
    // -----------------------------------------------------------------
    console.log('\nStep 5: Admin registering a parent linked to student Roll:', studentRollId);
    const parentRegData = {
      name: 'Admin Test Parent',
      email: `parent_admin_${Date.now()}@example.com`,
      password: 'parentpassword123',
      phone: '9876543211',
      relationship: 'Father',
      studentId: studentRollId
    };

    const parentRegRes = await axios.post(`${BASE_URL}/admin/users/parent`, parentRegData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const generatedParentId = parentRegRes.data.parent.parentId;
    console.log('   Success! Parent registered by admin. Generated Parent ID:', generatedParentId);

    // -----------------------------------------------------------------
    // 6. LOGIN PARENT USING UNIQUE PARENT ID & PASSWORD CHANGE
    // -----------------------------------------------------------------
    console.log('\nStep 6: Testing parent login using Parent ID...');
    const parentLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: generatedParentId,
      password: 'parentpassword123'
    });
    console.log('   Success! Logged in using Parent ID. Profile name:', parentLoginRes.data.name);
    const verifiedParentToken = parentLoginRes.data.token;

    console.log('   Testing parent password change...');
    await axios.put(`${BASE_URL}/parents/change-password`, {
      currentPassword: 'parentpassword123',
      newPassword: 'newparentpassword123'
    }, {
      headers: { Authorization: `Bearer ${verifiedParentToken}` }
    });
    console.log('   Success! Password updated.');

    // Verify login with new password
    console.log('   Testing login with new password...');
    const parentReloginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: generatedParentId,
      password: 'newparentpassword123'
    });
    console.log('   Success! Logged in with updated password.');
    const activeParentToken = parentReloginRes.data.token;

    // -----------------------------------------------------------------
    // 7. REQUEST VISIT PASS (PARENT)
    // -----------------------------------------------------------------
    console.log('\nStep 7: Parent requesting a hostel visit pass...');
    const visitData = {
      studentId: studentProfileId,
      visitorName: 'Admin Test Parent',
      relationship: 'Father',
      phone: '9876543211',
      visitDate: tomorrow.toISOString(),
      arrivalTime: '10:00 AM',
      departureTime: '03:00 PM',
      purpose: 'Meeting child',
      visitorCount: 1,
      idProofType: 'Aadhaar Card',
      idProofNumber: '1234-5678-9012'
    };

    const visitRes = await axios.post(`${BASE_URL}/visit-passes`, visitData, {
      headers: { Authorization: `Bearer ${activeParentToken}` }
    });
    console.log('   Success! Visit request created with ID:', visitRes.data._id);
    const visitId = visitRes.data._id;

    // -----------------------------------------------------------------
    // 8. DUPLICATE VISIT PREVENTION CHECK (PARENT)
    // -----------------------------------------------------------------
    console.log('\nStep 8: Checking duplicate visit prevention...');
    try {
      await axios.post(`${BASE_URL}/visit-passes`, visitData, {
        headers: { Authorization: `Bearer ${activeParentToken}` }
      });
      console.error('   FAILED: Server allowed duplicate visit request!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   Success! Server blocked duplicate visit request (Status 400). Message:', err.response.data.message);
      } else {
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // 9. ADMIN APPROVE OUTPASS
    // -----------------------------------------------------------------
    console.log('\nStep 9: Admin approving the student outpass...');
    const approveOutRes = await axios.put(`${BASE_URL}/admin/outpasses/${outpassId}/approve`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const approvedPassId = approveOutRes.data.outpass.passId;
    console.log('   Success! Outpass approved. Generated Pass ID:', approvedPassId);

    // -----------------------------------------------------------------
    // 10. ADMIN REJECT VISIT PASS (TEST REJECTION REASON REQUIREMENT)
    // -----------------------------------------------------------------
    console.log('\nStep 10a: Testing reject visit pass validation (no reason)...');
    try {
      await axios.put(`${BASE_URL}/admin/visit-passes/${visitId}/reject`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.error('   FAILED: Server allowed rejection without reason!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   Success! Server blocked rejection without reason. Message:', err.response.data.message);
      } else {
        throw err;
      }
    }

    console.log('Step 10b: Rejecting visit pass with reason...');
    const rejectVisitRes = await axios.put(`${BASE_URL}/admin/visit-passes/${visitId}/reject`, {
      rejectionReason: 'Visitor block is undergoing maintenance.'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   Success! Visit request rejected. Reason recorded:', rejectVisitRes.data.visitPass.rejectionReason);

    // -----------------------------------------------------------------
    // 11. PUBLIC PASS VERIFICATION (APPROVED OUTPASS -> VALID)
    // -----------------------------------------------------------------
    console.log('\nStep 11: Verifying approved outpass via public checker...');
    const verifyOutRes = await axios.get(`${BASE_URL}/verify/pass/${approvedPassId}`);
    console.log('   Success! Verification status:', verifyOutRes.data.status);
    if (verifyOutRes.data.status !== 'VALID') {
      console.error('   FAILED: Expected pass status to be VALID, got:', verifyOutRes.data.status);
      process.exit(1);
    }

    // -----------------------------------------------------------------
    // 12. FETCH CHILD COLLEGE DATA (PARENT)
    // -----------------------------------------------------------------
    console.log('\nStep 12: Fetching child academic records as parent...');
    const childRecordsRes = await axios.get(`${BASE_URL}/parents/child-data/${studentProfileId}`, {
      headers: { Authorization: `Bearer ${activeParentToken}` }
    });
    console.log('   Success! Child academic details retrieved successfully:');
    console.log('      Attendance Ratio:', childRecordsRes.data.collegeData.attendance);
    console.log('      Timetable Slots Count:', childRecordsRes.data.collegeData.timetable.length);

    // -----------------------------------------------------------------
    // 13. ADMIN DELETE USER
    // -----------------------------------------------------------------
    console.log('\nStep 13: Admin deleting student user account...');
    await axios.delete(`${BASE_URL}/admin/users/${studentLoginRes.data._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   Success! Student user credentials and profile deleted.');

    // Verify student can no longer login
    console.log('   Verifying deleted student login is blocked...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: studentRegData.email,
        password: 'studentpassword123'
      });
      console.error('   FAILED: Deleted student was able to login!');
      process.exit(1);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('   Success! Login blocked (Status 401). Message:', err.response.data.message);
      } else {
        throw err;
      }
    }

    console.log('\n==================================================');
    console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (14/14)');
    console.log('==================================================');
    process.exit(0);

  } catch (error) {
    console.error('\n!!! TEST EXECUTION FAILED !!!');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
      console.error(error.stack);
    }
    process.exit(1);
  }
};

runTests();
