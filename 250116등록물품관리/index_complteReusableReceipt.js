// 재사용 물품 수령 완료 처리 API
app.post('/completeReusableReceipt', async function (req, res) {
    // 재사용 물품 번호 가져오기
    var resu_no = req.body.resu_no;

    // 재사용 물품 상태를 3(수령완료)으로 업데이트
    var sql = "UPDATE tblReusable SET nReusableState=? WHERE nReusableNo=?";
    await directQuery(sql, [3, resu_no]);

    // 재사용 물품 정보 조회
    sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
    var sql_res = await directQuery(sql, [resu_no]);

    // 공유하지 않는 물품이고 신청 상태가 3(수령완료)인 경우
    if (sql_res[0].nReusableShare == 0 && sql_res[0].nApplicantState == 3) {
        // 이전 사용자 정보 저장
        var PrevUser = sql_res[0].sReusableNowUser;

        // 신청자 정보 초기화
        var ApplicantEmail = "";
        var ApplicantName = sql_res[0].sReusableApplicant;
        var ApplicantOrg = "";
        var ApplicantUserOrg = "";
        var ApplicantUserNo = "";
        var ApplicantUserDptCode = "";

        // 테스트 유저별 정보 설정
        if (ApplicantName == "고려대 테스트 유저") {
            ApplicantEmail = "korea@korea.ac.kr";
            ApplicantOrg = "본부";
            ApplicantUserOrg = "본부"; 
            ApplicantUserNo = "000000";
            ApplicantUserDptCode = "0000";
        }
        else if (ApplicantName == "원격교육센터 02") {
            ApplicantEmail = "kbw5636@kounosoft.com";
            ApplicantOrg = "총무부";
            ApplicantUserOrg = "총무부";
            ApplicantUserNo = "210597";
            ApplicantUserDptCode = "5022";
        }
        else if (ApplicantName == "테스트자산관리01") {
            ApplicantEmail = "jaebeen2@kounosoft.com";
            ApplicantOrg = "관리팀";
            ApplicantUserOrg = "관리팀";
            ApplicantUserNo = "597210";
            ApplicantUserDptCode = "5846";
        }
        else if (ApplicantName == "테스트자산관리02") {
            ApplicantEmail = "sizin@kounosoft.com";
            ApplicantOrg = "관리팀";
            ApplicantUserOrg = "관리팀";
            ApplicantUserNo = "666308";
            ApplicantUserDptCode = "0014";
        }
        else {
            // 일반 사용자의 경우 DB에서 정보 조회
            sql = "SELECT * FROM tblUser WHERE sName=? ";
            var email_res = await directQuery(sql, [ApplicantName]);

            ApplicantEmail = email_res[0].sEMail;
            ApplicantUserNo = email_res[0].sNumber;
            ApplicantUserDptCode = email_res[0].sDepartmentCode;

            sql = "SELECT * FROM tblOrganization WHERE nIndex=? ";
            var org_res = await directQuery(sql, [email_res[0].nOrgIdx]);

            ApplicantOrg = org_res[0].sName;
            ApplicantUserOrg = org_res[0].sName;
        }

        // 재사용 물품 정보 업데이트 (이전/현재 사용자, 완료일자)
        sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
        await directQuery(sql, [PrevUser, ApplicantName, resu_no]);

        // 자산 정보 업데이트 (조직, 사용자 정보)
        sql = "UPDATE tblFixture SET sOrg=?, sUserOrg=?, sUser=?, sUserNo=?, sDepartmentCode=? WHERE sFixtureNo=?";
        await directQuery(sql, [ApplicantOrg, ApplicantUserOrg, ApplicantName, ApplicantUserNo, ApplicantUserDptCode, sql_res[0].sFixtureNo]);
    }
    // 공유 물품이고 신청 상태가 3(수령완료)인 경우
    else if (sql_res[0].nReusableShare == 1 && sql_res[0].nApplicantState == 3) {
        // 이전 사용자 정보 저장
        var PrevUser = sql_res[0].sReusableNowUser;

        // 신청자 정보 초기화
        var ApplicantEmail = "";
        var ApplicantName = sql_res[0].sReusableApplicant;

        // 테스트 유저별 이메일 설정
        if (ApplicantName == "고려대 테스트 유저") {
            ApplicantEmail = "korea@korea.ac.kr";
        }
        else if (ApplicantName == "원격교육센터 02") {
            ApplicantEmail = "kbw5636@kounosoft.com";
        }
        else if (ApplicantName == "테스트자산관리01") {
            ApplicantEmail = "jaebeen2@kounosoft.com";
        }
        else if (ApplicantName == "테스트자산관리02") {
            ApplicantEmail = "sizin@kounosoft.com";
        }
        else {
            // 일반 사용자의 경우 DB에서 이메일 조회
            sql = "SELECT * FROM tblUser WHERE sName=? ";
            var email_res = await directQuery(sql, [ApplicantName]);

            ApplicantEmail = email_res[0].sEMail;
        }

        // 재사용 물품 정보 업데이트 (이전/현재 사용자, 완료일자)
        sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
        await directQuery(sql, [PrevUser, ApplicantName, resu_no]);
    }

    // 완료 메시지를 포함한 HTML 응답
    const html = `<!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
    <body><script>alert ('수령이 완료되었습니다.');window.close ();</script></body>
    </html>`;
    res.send(html);
});
