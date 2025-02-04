app.post('/searchStaffQuiry', async function (req, res) {
	var ssearch = req.body.ssearch;
	var svalue = req.body.svalue;

	var sql = 'SELECT distinct(b.sNameKor) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a, tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode = b.sDepartmentCode and a.nPermission <= 4 and a.nPermission != 0 and a.sPortal != ""';

	if (ssearch == 1) {
		// 만약 교직원 번호 검색일 경우, 최소 4자리 이상 입력되었는지 확인
		if (svalue.trim().length < 4) {
			return res.send({ result: [], message: "교직원 번호는 최소 4자리 이상 입력해주세요." });
		}
		// 접두어 검색(예: "8010" 입력 시 "8010%" 형태로 처리)
		svalue = svalue.trim() + "%";
		sql += " and a.sNumber LIKE ?;";
	} else if (ssearch == 2) {
		// 이름 검색은 부분 일치 처리
		svalue = "%" + svalue.trim() + "%";
		sql += " and a.sName LIKE ?;";
	} else if (ssearch == 3) {
		// 소속부서 이름 검색은 부분 일치 처리
		svalue = "%" + svalue.trim() + "%";
		sql += " and b.sNameKor LIKE ?";
	}

	var result = await directQuery(sql, [svalue]);
	res.send({ result: result });
});
