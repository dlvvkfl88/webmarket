app.post('/completeReusableReceipt', async function (req, res) {
	var resu_no = req.body.resu_no;

	var sql = "UPDATE tblReusable SET nReusableState=? WHERE nReusableNo=?";
	await directQuery(sql, [3, resu_no]);

	sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
	var sql_res = await directQuery(sql, [resu_no]);

	if (sql_res[0].nReusableShare == 0 && sql_res[0].nApplicantState == 3) {
		var PrevUser = sql_res[0].sReusableNowUser;

		//var ApplicantEmail = sql_res[0].sReusableApplicant;
		//var ApplicantName = "";

		var ApplicantEmail = "";
		var ApplicantName = sql_res[0].sReusableApplicant;
		var ApplicantOrg = "";
		var ApplicantUserOrg = "";
		var ApplicantUserNo = "";
		var ApplicantUserDptCode = "";

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

		sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
		await directQuery(sql, [PrevUser, ApplicantName, resu_no]);

		sql = "UPDATE tblFixture SET sOrg=?, sUserOrg=?, sUser=?, sUserNo=?, sDepartmentCode=? WHERE sFixtureNo=?";
		await directQuery(sql, [ApplicantOrg, ApplicantUserOrg, ApplicantName, ApplicantUserNo, ApplicantUserDptCode, sql_res[0].sFixtureNo]);
	}
	else if (sql_res[0].nReusableShare == 1 && sql_res[0].nApplicantState == 3) {
		var PrevUser = sql_res[0].sReusableNowUser;

		//var ApplicantEmail = sql_res[0].sReusableApplicant;
		//var ApplicantName = "";

		var ApplicantEmail = "";
		var ApplicantName = sql_res[0].sReusableApplicant;

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
			sql = "SELECT * FROM tblUser WHERE sName=? ";
			var email_res = await directQuery(sql, [ApplicantName]);

			ApplicantEmail = email_res[0].sEMail;
		}

		sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
		await directQuery(sql, [PrevUser, ApplicantName, resu_no]);
	}

	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
	<body><script>alert ('수령이 완료되었습니다.');window.close ();</script></body>
	</html>`;
	res.send(html);
});
