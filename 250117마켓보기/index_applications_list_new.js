	app.get('/applications_list_new', session_exists, async function (req, res) {
		try {
			// 세션에서 사용자 정보 가져오기
			var user_email = req.session.user['email'];
			var user_phone = req.session.user['tel'];
			var user_id = req.session.user['userid'];

			// 페이지 번호 파라미터 받기 (기본값 1)
			const page = parseInt(req.query.page) || 1;
			const itemsPerPage = 10;
			const nStart = page - 1;

			// 사용자가 신청한 재사용 물품 수 조회
			var tsql = "SELECT count(*) as tot FROM tblReusableApplicant WHERE sApplicantNumber=?";
			var res_total = await directQuery(tsql, [user_id]);
			var total = res_total[0].tot;

			// 페이지네이션 계산
			const totalPages = Math.ceil(total / itemsPerPage);

			// 사용자가 신청한 재사용 물품 목록 조회
			var sql = `
            SELECT r.* 
            FROM tblReusable r 
            INNER JOIN tblReusableApplicant ra ON r.nReusableNo = ra.nReusableNo 
            WHERE ra.sApplicantNumber = ? 
            ORDER BY r.dFixtureDate DESC 
            LIMIT ? OFFSET ?
        `;
			var rinfos = await directQuery(sql, [user_id, itemsPerPage, nStart * itemsPerPage]);

			// 이미지 정보 조회
			var img_sql = `
            SELECT b.* 
            FROM tblReusable a 
            INNER JOIN tblReusableImg b ON a.nReusableNo = b.nReusableIdx 
            INNER JOIN tblReusableApplicant ra ON a.nReusableNo = ra.nReusableNo 
            WHERE ra.sApplicantNumber = ? 
            ORDER BY a.dFixtureDate DESC 
            LIMIT ? OFFSET ?
        `;
			var rinfos_img = await directQuery(img_sql, [user_id, itemsPerPage, nStart * itemsPerPage]);

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
			res.render("applications_list_new", {
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
			console.error('Error in applications_list_new:', error);
			res.status(500).send('Internal Server Error');
		}
	});
