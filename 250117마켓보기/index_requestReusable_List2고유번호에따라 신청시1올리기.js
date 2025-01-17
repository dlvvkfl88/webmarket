app.post('/requestReusable_List2', async function (req, res) {
	try {
		var resu_no = req.body.resu_no;
		var user_email = req.body.email;
		var user_no = req.body.userno;

		// 재사용 물품 정보 조회
		var sql = "SELECT * FROM tblReusable WHERE nReusableNo=?";
		var res_resu = await directQuery(sql, [resu_no]);

		if (!res_resu || res_resu.length === 0) {
			return res.json({ result: '물품 정보를 찾을 수 없습니다.' });
		}

		var resu_user_no = res_resu[0].sReusableUserNo; // 물품 등록자의 user_no
		var resu_email = res_resu[0].sReusableEmail;
		var resu_name = res_resu[0].sReusableName;
		var resu_place = res_resu[0].sReusablePlace;

		// 자신이 등록한 물품인지 확인 (user_no로 비교)
		if (resu_user_no === user_no) {
			return res.json({ result: '자신이 등록한 물품입니다.' });
		}

		// 이미 신청한 내역이 있는지 확인
		sql = "SELECT * FROM tblReusableApplicant WHERE nReusableNo=? AND sApplicantNumber=?";
		var res_list = await directQuery(sql, [resu_no, user_no]);

		// 신청 내역이 없는 경우에만 처리
		if (res_list.length === 0) {
			// 트랜잭션 시작
			await directQuery('START TRANSACTION');

			try {
				// 신청자 정보 등록
				sql = 'INSERT INTO tblReusableApplicant(nReusableNo, sApplicantNumber) VALUES(?, ?)';
				await directQuery(sql, [resu_no, user_no]);

				// 물품 상태 업데이트
				sql = "UPDATE tblReusable SET nApplicantState=1 WHERE nReusableNo=?";
				await directQuery(sql, [resu_no]);

				// 트랜잭션 커밋
				await directQuery('COMMIT');

				// 이메일 발송
				let today = new Date();
				var html_data = user_email + " 님께서 다음과 같은 재사용 물품에 신청을 하였습니다.<br>";
				html_data += "일자 : " + today.toLocaleString() + "<br>";
				html_data += "재사용 물품 이름 : " + resu_name + "<br>";
				html_data += "수령 위치 : " + resu_place + "<br>";

				let mailOptions = {
					from: 'kbw3672@naver.com',
					to: resu_email,
					subject: "고려대학교 자산관리 시스템 재사용 물품 신청",
					html: html_data,
				};

				transporter.sendMail(mailOptions);

				return res.json({ result: '재사용 물품을 신청하였습니다.' });
			} catch (error) {
				// 에러 발생 시 롤백
				await directQuery('ROLLBACK');
				throw error;
			}
		} else {
			return res.json({ result: '이미 신청한 물품입니다.' });
		}
	} catch (error) {
		console.error('Error in requestReusable_List2:', error);
		return res.status(500).json({ result: '처리 중 오류가 발생했습니다.' });
	}
});
