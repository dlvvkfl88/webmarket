// 등록자 확인 팝업 페이지 라우터
app.get('/registrar_checkPopup', async function (req, res) {
	try {
		// ... existing code ...
		var resuNo = req.query.resuNo;

		var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
		var rinfos = await directQuery(sql, [resuNo]);

		console.log(rinfos);

		var registrar_Email = rinfos[0].sReusableEmail;
		var jsonData = {};

		if (registrar_Email == 'kbw5636@kounosoft.com') {
			jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': registrar_Email, 'tel': '010-9318-5636' };
		}
		else if (registrar_Email == 'jaebeen2@kounosoft.com') {

			jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': registrar_Email, 'tel': '010-6277-4800' };
		}
		else if (registrar_Email == 'sizin@kounosoft.com') {

			jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': registrar_Email, 'tel': '010-3380-4340' };
		}

		// 일반 사용자의 경우 DB에서 정보 조회
		else {
			sql = 'SELECT distinct(b.sName) org, a.sName name,a.sNumber email, a.sTel tel, a.sNumber employeeNum, a.nPermission permission ';
			sql += 'FROM tblUser a,tblOrganization b ';
			sql += 'WHERE a.sEMail=? and a.nOrgIdx=b.nIndex';
			var res_org = await directQuery(sql, [registrar_Email]);

			// DB 조회 결과가 없는 경우 기본값 설정
			if (!res_org || res_org.length === 0) {
				jsonData = {
					'userid': 'N/A',
					'potalId': 'N/A',
					'name': '미등록 사용자',
					'class': '미등록',
					'mail': registrar_Email,
					'tel': '연락처 없음'
				};
			} else {
				jsonData = {
					'userid': res_org[0].employeeNum,
					'potalId': res_org[0].employeeNum,
					'name': res_org[0].name,
					'class': res_org[0].org,
					'mail': registrar_Email,
					'tel': res_org[0].tel
				};
			}
		}

		// 등록자 확인 팝업 페이지 렌더링
		res.render("registrar_checkPopup", {
			idx: req.session.user.name,
			uname: req.session.user.name,
			userid: req.session.user.userid,
			permission: req.session.user.permission,
			stdtype: req.session.user.stdtype,
			modex: req.session.mode,
			jsonData: jsonData
		});
	} catch (error) {
		console.error('Error in registrar_checkPopup:', error);
		res.status(500).send('서버 오류가 발생했습니다.');
	}
});
