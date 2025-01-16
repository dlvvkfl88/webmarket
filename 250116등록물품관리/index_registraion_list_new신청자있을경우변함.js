app.get('/registration_list_new', session_exists, async function (req, res) {
	try {
		// 세션에서 사용자 정보 가져오기
		var user_email = req.session.user['email'];
		var user_phone = req.session.user['tel'];
		var user_id = req.session.user['userid'];

		// 페이지 번호 파라미터 받기 (기본값 1)
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;
		const nStart = page - 1;

		// // 전체 재사용 물품 수 조회
		// var tsql = "SELECT count(*) as tot FROM tblReusable; ";
		// var res_total = await directQuery(tsql);
		// var total = res_total[0].tot;

		// // 전체 재사용 물품 목록 조회 (최신순)
		// var sql = "SELECT * FROM tblReusable ORDER BY dFixtureDate DESC";
		// sql += " LIMIT 10 OFFSET ?;";
		// var nStart = 0;
		// var rinfos = await directQuery(sql, [Number(nStart * 10)]);

		// 사용자가 등록한 재사용 물품 조회
		// 사용자가등록한 재사용,나눔합친거 물품 수 조회
		// 사용자가 등록한 재사용 물품 수 조회
		// 전체 아이템 수 조회
		var tsql = "SELECT count(*) as tot FROM tblReusable WHERE sReusableUserNo=?";
		var res_total = await directQuery(tsql, [user_id]);
		var total = res_total[0].tot;

		// 페이지네이션 계산
		const totalPages = Math.ceil(total / itemsPerPage);

		// 사용자가등록한 재사용,나눔합친거 물품 목록 조회 (최신순)
		// var sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC";
		// sql += " LIMIT 10 OFFSET ?;";
		// var nStart = 0;
		// var rinfos = await directQuery(sql, [Number(nStart * 10)]);

		// 아이템 조회
		var sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC LIMIT ? OFFSET ?";
		var rinfos = await directQuery(sql, [user_id, itemsPerPage, nStart * itemsPerPage]);

		console.log("user_id", user_id);

		// 이미지 조회
		var img_sql = 'SELECT b.* FROM tblReusable a INNER JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.sReusableUserNo=? ORDER BY a.dFixtureDate DESC LIMIT ? OFFSET ?';
		var rinfos_img = await directQuery(img_sql, [user_id, itemsPerPage, nStart * itemsPerPage]);


		//registration_list_new 라우트 내부
		const applicantQuery = 'SELECT COUNT(*) as count FROM tblReusableApplicant WHERE nReusableNo = ?';

		// rinfos 데이터를 가져온 후, 각 항목에 대해 신청자 정보를 추가
		for (let i = 0; i < rinfos.length; i++) {
			const applicantResult = await directQuery(applicantQuery, [rinfos[i].nReusableNo]);
			rinfos[i].hasApplicants = applicantResult[0].count > 0;
		}


		// rinfos_reg와 rinfos_appli변수
		// var rinfos_reg = [];
		// var rinfos_appli = [];
		// var rinfos_list = [];
		// var rinfos_result = [];
		// var rinfos_appli = [];

		// 사용자가 신청한 재사용 물품 목록 조회
		// sql = 'SELECT * FROM tblReusableApplicant WHERE sApplicantNumber=?;';
		// var rinfos_list = await directQuery(sql, [user_id]);

		// var rinfos_appli = [];

		/* 기존 신청자 목록 처리 로직 주석처리
		for(var i = 0; i < rinfos.length; i++)
		{
			if(rinfos[i].sReusableApplicant_List != "")
			{
				var resu_list_str = JSON.stringify(rinfos[i].sReusableApplicant_List);
				var resu_str = resu_list_str.replaceAll('"','');
				var resu_str2 = resu_str.replaceAll('[','');
				var resu_str3 = resu_str2.replaceAll(']','');
				var resu_list = resu_str3.split(',');
	
				var indx = resu_list.indexOf(user_id);
	
				for(var j = 0; j < resu_list.length; j++)
				{
					var resu_item = resu_list[j].replaceAll("'","");
	
					if(resu_item == user_id)
					{
						rinfos_appli.push(rinfos[i]);
						break;
					}
				}
			}
		}
		*/

		// 신청한 물품 정보 매칭
		// for (var i = 0; i < rinfos_list.length; i++) {
		// 	var appli_no = rinfos_list[i].nReusableNo;
		// 	for (var j = 0; j < rinfos.length; j++) {
		// 		if (appli_no == rinfos[j].nReusableNo) {
		// 			rinfos_appli.push(rinfos[j]);
		// 		}
		// 	}
		// }

		// 등록 및 신청 물품 목록 병합
		// var rinfos_result = [];
		// for (var i = 0; i < rinfos_reg.length; i++) {
		// 	rinfos_result.push(rinfos_reg[i]);
		// }
		// for (var i = 0; i < rinfos_appli.length; i++) {
		// 	rinfos_result.push(rinfos_appli[i]);
		// }

		// 페이지네이션 정보
		var page_data = {
			'name': req.session.user.name,
			'count': nStart,
			'currentPage': page,
			'totalPages': totalPages,
			'total': total
		};

		// 사용자 권한 정보 조회
		sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
		var authority_list = await directQuery(sql, [req.session.user.userid]);

		// 권한별 사용자 정보 조회
		sql = "SELECT * FROM tblUser WHERE sNumber=?";

		// 권한별 사용자 이름 매핑
		for (var idx = 0; idx < authority_list.length; idx++) {
			if (authority_list[idx].sStdId == "210597") {
				authority_list[idx].sName = "원격교육센터 02";
			}
			else if (authority_list[idx].sStdId == "597210") {
				authority_list[idx].sName = "테스트자산관리01";
			}
			else if (authority_list[idx].sStdId == "666308") {
				authority_list[idx].sName = "테스트자산관리02";
			}
			else {
				var result = await directQuery(sql, [authority_list[idx].sStdId]);
				if (result.length > 0) {
					authority_list[idx].sName = result[0].sName;
				}
				else {
					authority_list[idx].sName = "데이터 없음";
				}
			}
		}

		// 페이지 렌더링
		res.render("registration_list_new", {
			idx: req.session.user.name,
			uname: req.session.user.name,
			userid: req.session.user.userid,
			permission: req.session.user.permission,
			stdtype: req.session.user.stdtype,
			rinfos: rinfos,
			rinfos_img: rinfos_img,
			page_data: page_data,
			user_email: user_email,
			user_phone: user_phone,
			authority_list: authority_list,
			sel_authority: req.session.user.selectAuithority
		});

	} catch (error) {
		console.error('Error in registration_list_new:', error);
		res.status(500).send('Internal Server Error');
	}
});
