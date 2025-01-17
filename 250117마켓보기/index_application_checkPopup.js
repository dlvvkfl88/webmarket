// 등록물품관리 신청자확인팝업

app.get('/applicant_checkPopup', async function (req, res) {
	try {
		var resuNo = req.query.resuNo;
		var appliV = false;

		//첫 번째 쿼리
		var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
		var rinfos = await directQuery(sql, [resuNo]);

		if (!rinfos || rinfos.length === 0) {
			return res.status(404).send('데이터를 찾을 수 없습니다.');
		}

		// 수정: nApplicantState가 0이거나 1일 때만 선정 버튼이 보이도록 수정
		appliV = !(rinfos[0].nApplicantState === 0 || rinfos[0].nApplicantState === 1);

		// 두 번째 쿼리
		sql = 'SELECT * FROM tblReusableApplicant WHERE nReusableNo=?;';
		var rinfos_list = await directQuery(sql, [resuNo]);

		var arr_aplic = [];

		if (rinfos_list.length > 0) {
			for (var idx = 0; idx < rinfos_list.length; idx++) {
				var userID = rinfos_list[idx].sApplicantNumber;

				console.log(userID);

				if (userID == '210597') {
					var jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': 'kbw5636@kounosoft.com', 'tel': '010-9318-5636' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '597210') {
					var jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': 'jaebeen2@kounosoft.com', 'tel': '010-6277-4800' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '666308') {
					var jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': 'sizin@kounosoft.com', 'tel': '010-3380-4340' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '') {

				}
				else {
					sql = 'SELECT distinct(b.sName) org, a.sName name,a.sEmail email, a.sTel tel, a.nPermission permission ';
					sql += 'FROM tblUser a,tblOrganization b ';
					sql += 'WHERE a.sNumber=? and a.nOrgIdx=b.nIndex';
					var res_org = await directQuery(sql, [userID]);

					jsonData = { 'userid': userID, 'potalId': userID, 'name': res_org[0].name, 'class': res_org[0].org, 'mail': res_org[0].email, 'tel': res_org[0].tel };
					arr_aplic.push(jsonData);
				}
			}
		}



		res.render("applicant_checkPopup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, resuNo: resuNo, arr_aplic: arr_aplic, appliV: appliV });
	} catch (error) {
		console.error('Error in applicant_checkPopup:', error);
		res.status(500).send('서버 오류가 발생했습니다');
	}
});
