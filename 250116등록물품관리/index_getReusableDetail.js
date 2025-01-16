// 상제정보 라우트 
app.post('/getReusableDetail', async function (req, res) {
	try {
		const reusableNo = req.body.reusableNo;

		// 재사용/나눔 물품 정보 조회
		const sql = `
            SELECT r.*, ri.sImgBin 
            FROM tblReusable r 
            LEFT JOIN tblReusableImg ri ON r.nReusableNo = ri.nReusableIdx 
            WHERE r.nReusableNo = ?
        `;
		const result = await directQuery(sql, [reusableNo]);

		if (result.length > 0) {
			const item = result[0];
			res.json({
				imgSrc: item.sImgBin,
				name: item.sReusableName,
				content: item.sReusableContent,
				rank: item.nReusableRank,
				fixtureName: item.sFixtureName,
				fixturePrice: item.dFixturePrice,
				fixtureDate: item.dFixtureDate,
				fixtureNo: item.sFixtureNo
			});
		} else {
			res.status(404).json({ error: '물품을 찾을 수 없습니다.' });
		}
	} catch (error) {
		console.error('Error in getReusableDetail:', error);
		res.status(500).json({ error: '서버 오류가 발생했습니다.' });
	}
});
