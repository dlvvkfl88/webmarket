app.post('/reusableImg_set', async function (req, res) {
	try {
		var data = req.body.data;
		var reusableIdx = data.idx;

		// 이미지 저장 성공 여부 추적 변수
		let allImgInsertSuccess = true;

		// 각 이미지에 대해 순차적으로 저장
		for (let i = 0; i < data.reusableImg.length; i++) {
			const prefix = i === 0 ? 'main_' : `sub_${i}_`;
			const sql = 'INSERT INTO tblReusableImg(nReusableIdx, sImgPath, sImgBin) VALUES(?, ?, ?)';

			try {
				await directQuery(sql, [
					reusableIdx,
					prefix + data.reusableImg[i],
					data.reusableImgBin[i]
				]);
			} catch (error) {
				console.error('Image insert error:', error);
				allImgInsertSuccess = false;
				break;
			}
		}

		res.send({
			result: allImgInsertSuccess ? '저장되었습니다.' : '이미지 저장 중 오류가 발생했습니다.',
			success: allImgInsertSuccess
		});
	} catch (error) {
		console.error('General error:', error);
		res.send({
			result: '처리 중 오류가 발생했습니다.',
			success: false,
			error: error.message
		});
	}
});
/// 위는 연습용으로 

// app.post('/reusableImg_set', async function (req, res) {
// 	//console.log(req.body.data);

// 	//var data = JSON.parse(req.body.data);
// 	var data = req.body.data;
// 	var reusableIdx = data.idx;

// 	var fix_no = "00000000000";
// 	var fix_name = "";

// 	var fix_sql = "SELECT sFixtureNo,sFixtureName FROM tblReusable WHERE nReusableNo=? ";
// 	var res_fix = await directQuery(fix_sql, [reusableIdx]);

// 	fix_no = res_fix[0].sFixtureNo;
// 	fix_name = res_fix[0].sFixtureName;

// 	//QR 생성
// 	if (qr_bool == true) {
// 		for (var j = 0; j < data.reusableImg.length; j++) {
// 			var file_name = data.reusableImg[j];
// 			//const original = fs.readFileSync(file_name);
// 			var file_bin = data.reusableImgBin[j];
// 			const original = Buffer.from(file_bin.split(",")[1], 'base64');

// 			await fs.writeFile("QRTest_" + file_name, original, 'base64', function (err) {
// 				console.log(err)
// 			});

// 			var json_data = { "UserNo": req.session.user['userid'], "FixNo": fix_no, "FixName": fix_name };
// 			var json_text = JSON.stringify(json_data);

// 			QRCode.toFile("QRImg.png", json_text, {
// 				color: {
// 					dark: '#000',
// 					light: '#0000'
// 				}
// 			}, function (error) {
// 				if (error) throw error;

// 				var water_option = {
// 					type: "image",
// 					logo: "QRImg.png",
// 					destination: "QRResult_" + file_name,
// 					source: "QRTest_" + file_name,
// 					position: {
// 						logoX: 0,
// 						logoY: 0,
// 						logoHeight: 80,
// 						logoWidth: 80
// 					}
// 				};

// 				watermark.embed(water_option, function (status) {
// 					//Do what you want to do here
// 					console.log(status);
// 					var file_result = "QRResult_" + file_name;
// 				});
// 			});
// 		}
// 	}

// 	//Steggy 생성
// 	if (steegy_bool == true) {
// 		for (var j = 0; j < data.reusableImg.length; j++) {
// 			var file_name = data.reusableImg[j];
// 			var file_bin = data.reusableImgBin[j];
// 			const original = Buffer.from(file_bin.split(",")[1], 'base64');
// 			//const original = fs.readFileSync(file_name);

// 			var json_data = { "UserNo": req.session.user['userid'], "FixNo": fix_no, "FixName": fix_name };
// 			var json_text = json_data.toString();

// 			//steegy_pass
// 			const concealed = steggy.conceal(steegy_pass)(original, json_text, 'utf8');
// 			fs.writeFile("SteganoResult_" + file_name, concealed, function (err) {
// 				console.log(err);
// 			});
// 		}
// 	}

// 	for (var i = 0; i < data.reusableImg.length; i++) {
// 		sql = 'INSERT INTO tblReusableImg(nReusableIdx,sImgPath,sImgBin) ';
// 		sql += 'VALUES(?,?,?);';

// 		ret = await directQuery(sql, [reusableIdx, data.reusableImg[i], data.reusableImgBin[i]]);
// 	}

// 	var result = '저장되었습니다.';
// 	if (!ret.affectedRows) {
// 		result = '저장하지 못했습니다.\n관리자에게 문의해주세요.';
// 	}

// 	res.send({ result: result });
// });
