app.get('/CheckMyItems_Popup', async function (req, res) {
	try {
		// 세션에서 사용자 정보 가져오기
		var user_email = req.session.user['email'];
		var user_phone = req.session.user['tel'];
		var user_id = req.session.user['userid'];

		// 물품 총 개수 조회
		var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
		var res_total = await directQuery(tsql, [user_id]);
		var total = res_total[0].tot;
		var nStart = 0;


		// 물품 목록 조회 
		var sql = "SELECT sFixtureName,sFixtureNo,sFixturePrice,dFixtureDate FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ORDER BY dFixtureDate ASC LIMIT ? OFFSET ?  ";
		var pinfos = await directQuery(sql, [user_id, 10, Number(nStart * 10)]);

		// 개인 재사용 물품의 이미지 정보를 가져오는 쿼리
		var img_sql = 'SELECT b.* FROM carbonKU.tblFixture a INNER JOIN carbonKU.tblFixtureImg b ON a.sFixtureNo=b.nFixtureIdx WHERE a.sUserNo=? ORDER BY a.dFixtureDate ASC LIMIT ? OFFSET ?';

		var pinfos_img = await directQuery(img_sql, [user_id, 10, Number(nStart * 10)]);



		// 페이지네이션 정보
		var start_page = nStart - (nStart % 10);
		var end_page = Math.ceil(total / 10);
		var page_data = {
			'name': req.session.user.name,
			'count': nStart,
			'start': start_page,
			'end': end_page,
			'total': total
		};

		// 팝업 페이지 렌더링
		res.render('CheckMyItems_Popup', {
			pinfos: pinfos,
			pinfos_img: pinfos_img || [],
			page_data: page_data,
			user_email: user_email,
			user_phone: user_phone,
		});
	} catch (error) {
		console.error('Error in CheckMyItems_Popup:', error);
		res.status(500).send('Internal Server Error');
	}
});
