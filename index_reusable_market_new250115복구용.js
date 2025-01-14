app.get('/reusable_market_new', session_exists, async function (req, res) {
	var nIndex = 0;
	var user_email = req.session.user['email'];
	var user_phone = req.session.user['tel'];

	//var sql = 'SELECT * FROM tblReusable WHERE nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
	//var sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	var sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a, tblReusableImg b WHERE a.nReusableNo=b.nReusableIdx AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'

	var rinfos = await directQuery(sql, [nIndex]);

	var build_info = [];
	var room_info = [];

	for (var idx = 0; idx < rinfos.length; idx++) {
		sql = 'SELECT * FROM tblBuild where sName=?;';
		build_info = await directQuery(sql, [rinfos[idx].sFixtureBuildName]);

		if (build_info.length > 0) {
			sql = 'SELECT * FROM tblBuild where sBuildID=? AND sRoomID=?;';
			room_info = await directQuery(sql, [build_info[0].sBuildID, rinfos[idx].sFixtureRoomNo]);

			if (room_info.length > 0) {
				rinfos[idx].roomName = room_info[0].sName + " (" + rinfos[idx].sFixtureRoomNo + ")";
			}
		}
	}

	/*
	var resu_list_str = JSON.stringify(rinfos[0].sReusableApplicant_List);
	var resu_str = resu_list_str.replaceAll('"','');
	var resu_str2 = resu_str.replaceAll('[','');
	var resu_str3 = resu_str2.replaceAll(']','');
	var resu_list = resu_str3.split(',');
	*/

	//console.log("list",resu_list[0]);

	//sql = 'SELECT * FROM tblReusable WHERE nReusableShare=0 AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
	//sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.nReusableShare=0 AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a, tblReusableImg b WHERE a.nReusableNo=b.nReusableIdx AND a.nReusableShare=0 AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	var rinfos_reus = await directQuery(sql, [nIndex]);

	for (var idx = 0; idx < rinfos_reus.length; idx++) {
		sql = 'SELECT * FROM tblBuild where sName=?;';
		build_info = await directQuery(sql, [rinfos_reus[idx].sFixtureBuildName]);

		if (build_info.length > 0) {
			sql = 'SELECT * FROM tblBuild where sBuildID=? AND sRoomID=?;';
			room_info = await directQuery(sql, [build_info[0].sBuildID, rinfos_reus[idx].sFixtureRoomNo]);

			if (room_info.length > 0) {
				rinfos_reus[idx].roomName = room_info[0].sName + " (" + rinfos_reus[idx].sFixtureRoomNo + ")";
			}
		}
	}

	//sql = 'SELECT * FROM tblReusable WHERE nReusableShare=1 AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
	//sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.nReusableShare=1 AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a, tblReusableImg b WHERE a.nReusableNo=b.nReusableIdx AND a.nReusableShare=1 AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	var rinfos_share = await directQuery(sql, [nIndex]);

	for (var idx = 0; idx < rinfos_share.length; idx++) {
		sql = 'SELECT * FROM tblBuild where sName=?;';
		build_info = await directQuery(sql, [rinfos_share[idx].sFixtureBuildName]);

		if (build_info.length > 0) {
			sql = 'SELECT * FROM tblBuild where sBuildID=? AND sRoomID=?;';
			room_info = await directQuery(sql, [build_info[0].sBuildID, rinfos_share[idx].sFixtureRoomNo]);

			if (room_info.length > 0) {
				rinfos_share[idx].roomName = room_info[0].sName + " (" + rinfos_share[idx].sFixtureRoomNo + ")";
			}
		}
	}

	//email: 'kbw5636@kounosoft.com',
	//tel: '010-9318-5636',

	sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	sql = "SELECT * FROM tblUser WHERE sNumber=?";

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

	//res.render("reusable_market", { idx: req.session.user.name, userid: req.session.user.userid, rinfos: rinfos, rinfos_img: rinfos_img, rinfos_reus: rinfos_reus, rinfos_reus_img: rinfos_reus_img, rinfos_share: rinfos_share, rinfos_share_img: rinfos_share_img, nIndex: nIndex,user_email: user_email,user_phone: user_phone, permission: req.session.user.permission });
	res.render("reusable_market_new", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, rinfos: rinfos, rinfos_reus: rinfos_reus, rinfos_share: rinfos_share, nIndex: nIndex, user_email: user_email, user_phone: user_phone, permission_reusable: req.session.user.permission_reusable, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});
