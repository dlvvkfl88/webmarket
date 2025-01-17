// 이게여러명 신청 해도 전부 신청취소해야 상태값이 바뀌도록 합연산
app.post('/cancelApplicant', async function (req, res) {
	try {
		var resu_no = req.body.resu_no;
		var user_id = req.body.user_id;

		// 트랜잭션 시작
		await directQuery('START TRANSACTION');

		try {
			// 해당 신청자 삭제
			var sql_del = "DELETE FROM tblReusableApplicant WHERE nReusableNo=? AND sApplicantNumber=?";
			await directQuery(sql_del, [resu_no, user_id]);

			// 남은 신청자 수 확인
			var sql_check = "SELECT COUNT(*) as cnt FROM tblReusableApplicant WHERE nReusableNo=?";
			var remaining = await directQuery(sql_check, [resu_no]);

			// 남은 신청자가 없는 경우에만 상태 변경
			if (remaining[0].cnt === 0) {
				var sql = "UPDATE tblReusable SET sReusableApplicant=?, nReusableState=?, nApplicantState=? WHERE nReusableNo=?";
				await directQuery(sql, ["", 1, 0, resu_no]);
			}

			// 트랜잭션 커밋
			await directQuery('COMMIT');

			const html = `<!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
            <body><script>alert ('해당 물품의 재사용 신청을 취소하였습니다.');</script></body>
            </html>`;
			res.send(html);

		} catch (error) {
			// 에러 발생 시 롤백
			await directQuery('ROLLBACK');
			throw error;
		}
	} catch (error) {
		console.error('Error in cancelApplicant:', error);
		const html = `<!DOCTYPE html>
        <html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
        <body><script>alert ('처리 중 오류가 발생했습니다.');</script></body>
        </html>`;
		res.send(html);
	}
});
