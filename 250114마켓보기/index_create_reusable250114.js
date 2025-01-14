app.post('/create_reusable', async function (req, res) {
	try {
		var data = JSON.parse(req.body.data);

		// 날짜 형식 변환 함수
		function formatDate(dateString) {
			if (!dateString) return null;
			const date = new Date(dateString);
			return date.toISOString().slice(0, 19).replace('T', ' ');
		}

		// 데이터 준비
		const insertData = {
			sReusableName: data.reusable_name,
			sReusableType: data.reusable_type || '',
			sReusableContent: data.reusable_contnet,
			sReusableMemo: data.reusable_memo,
			sReusablePlace: data.reusable_place,
			sReusableUserNo: req.session.user['userid'],
			sReusableEmail: data.user_email,
			sReusableMobile: data.user_phone,
			nReusableShare: 0,
			sFixtureNo: data.fixture_no || '',
			sFixtureName: data.fixture_name || '',
			sFixtureType: '',
			sFixturePrice: data.fixture_price || '',
			dFixtureDate: formatDate(data.fixture_date),  // 날짜 형식 변환
			sReusableNowUser: req.session.user['name'],
			sReusablePrevUser: req.session.user['name'],
			nReusableRank: data.reusable_rank
		};

		// null 값 필터링
		const filteredData = Object.fromEntries(
			Object.entries(insertData).filter(([_, value]) => value !== null)
		);

		// SQL 쿼리 생성
		const columns = Object.keys(filteredData).join(', ');
		const values = Object.values(filteredData);
		const placeholders = values.map(() => '?').join(', ');

		let sql = `INSERT INTO tblReusable (${columns}) VALUES (${placeholders})`;

		console.log('SQL Query:', sql);
		console.log('Values:', values);

		const createReusableManager = await directQuery(sql, values);

		if (createReusableManager && createReusableManager.insertId) {
			res.send({
				sucess: true,
				result: createReusableManager,
				reus_id: createReusableManager.insertId
			});
		} else {
			throw new Error('Insert failed: No insertId returned');
		}

	} catch (error) {
		console.error('Create reusable error:', error);
		console.error('Error stack:', error.stack);
		res.send({
			sucess: false,
			error: error.message,
			details: error.stack
		});
	}
});
