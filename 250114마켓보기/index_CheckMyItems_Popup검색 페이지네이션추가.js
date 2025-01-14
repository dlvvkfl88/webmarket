app.get('/CheckMyItems_Popup', async function (req, res) {
	try {
		// 세션에서 사용자 정보 가져오기
		var user_email = req.session.user['email'];
		var user_phone = req.session.user['tel'];
		var user_id = req.session.user['userid'];
		const page = parseInt(req.query.page) || 1;
		const searchType = req.query.searchType || '0';
		const searchKeyword = req.query.searchKeyword || '';
		const itemsPerPage = 10;
		const nStart = page - 1;

		// 검색 조건 설정
		let whereClause = "WHERE sUserNo=? AND sFixtureStatus='사용'";
		let params = [user_id];

		if (searchKeyword) {
			if (searchType === '1') { // 물품명 검색
				whereClause += " AND sFixtureName LIKE ?";
				params.push(`%${searchKeyword}%`);
			} else if (searchType === '2') { // 물품번호 검색
				whereClause += " AND sFixtureNo LIKE ?";
				params.push(`%${searchKeyword}%`);
			}
		}

		// 전체 개수 조회
		var tsql = `SELECT count(*) as tot FROM tblFixture ${whereClause}`;
		var res_total = await directQuery(tsql, params);
		var total = res_total[0].tot;
		const totalPages = Math.ceil(total / itemsPerPage);

		// 물품 목록 조회
		var sql = `SELECT sFixtureName,sFixtureNo,sFixturePrice,dFixtureDate 
                  FROM tblFixture ${whereClause} 
                  ORDER BY dFixtureDate ASC LIMIT ? OFFSET ?`;
		var pinfos = await directQuery(sql, [...params, itemsPerPage, nStart * itemsPerPage]);

		// 이미지 정보 조회
		var img_sql = `SELECT b.* 
                      FROM carbonKU.tblFixture a 
                      INNER JOIN carbonKU.tblFixtureImg b 
                      ON a.sFixtureNo=b.nFixtureIdx 
                      ${whereClause} 
                      ORDER BY a.dFixtureDate ASC LIMIT ? OFFSET ?`;
		var pinfos_img = await directQuery(img_sql, [...params, itemsPerPage, nStart * itemsPerPage]);

		// 페이지네이션 정보
		var page_data = {
			'currentPage': page,
			'totalPages': totalPages,
			'total': total
		};

		res.render('CheckMyItems_Popup', {
			pinfos,
			pinfos_img: pinfos_img || [],
			page_data,
			searchType,
			searchKeyword
		});
	} catch (error) {
		console.error('Error in CheckMyItems_Popup:', error);
		res.status(500).send('Internal Server Error');
	}
});
