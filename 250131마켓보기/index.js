//var Db  = require('./dboperations');
//var Order = require('./order');
//const dboperations = require('./dboperations');

var express = require('express');
const session = require('express-session');

const cookieParser = require('cookie-parser');

let FileStore = require('session-file-store')(session);

var bodyParser = require('body-parser');
var cors = require('cors');

var mysql = require('mysql');
var info_dbconfig = {
	'connection': {
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'connectionLimit': 10000
	},
	'database': 'carbonKU'
};

var connection = mysql.createConnection(info_dbconfig.connection);

const directQuery = require(__dirname + '/config/database').directQuery;

var bcrypt = require('bcrypt-nodejs');

const request = require('request-promise-native');

//var LocalStorage = require('node-localstorage').LocalStorage;
//localStorage = new LocalStorage('./KUCarbon');

const axios = require('axios');
const exceljs = require('exceljs');

const querystring = require('querystring');
const cheerio = require('cheerio');

const fetch = require('node-fetch');
const fs = require('fs');

const java = require('java');
const jarFilePath = __dirname + '/java/DecodeEncryptor168.jar';

var app = express();
//var router = express.Router();

//const path = require('path');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//public이라는 폴더의 클라이언트 접근 허용 (미들웨어)
app.use(express.static('css'));
app.use(express.static('font'));
app.use(express.static('images'));
app.use(express.static('js'));

app.use(session({
	store: new FileStore(),
	secret: "d087e47b-dfd6-4088-ba2a-2cd9dd1628ca",
	resave: false,
	saveUninitialized: true,
	// cookie: { maxAge: 3600000 * 3 }
	cookie: { maxAge: 3600 * 1000 * 3 }
}));

app.use(cookieParser());

//app.use(express.static(__dirname + '/'))

app.use(express.static('public'));

function session_exists(req, res, next) {
	console.log("func session_exists");
	if (req.session.user == undefined) {
		/*
		let url = "http://cafm.korea.ac.kr/archibus/archi_out.jsp";
		console.log ('get_cookie: ' + url);

		axios.get (url).then ((Response)=> {
			console.log (Response.data);
		}).catch ((Error)=> {
			console.log (Error);
			ret = Error;
		})
		*/

		/*
		var check_login = localStorage.getItem('login');

		if(check_login == true)
		{
			req.session.user = {
				code: localStorage.getItem('code'),
				msg: localStorage.getItem('msg'),
				name:  localStorage.getItem('name'),
				userid: localStorage.getItem('userid'),
				class: localStorage.getItem('class'),
				email: localStorage.getItem('email'),
				tel: localStorage.getItem('tel')
			};

			return next();
		}
		*/

		res.redirect('login');
	}
	else if (req.session.user.userid) {
		return next();
	} else {
		/*
		let url = "http://cafm.korea.ac.kr/archibus/archi_out.jsp";
		console.log ('get_cookie: ' + url);

		axios.get (url).then ((Response)=> {
			console.log (Response.data);
		}).catch ((Error)=> {
			console.log (Error);
			ret = Error;
		});
		*/

		res.redirect('login');
	}
}

// ------------------- FUNCTION -------------------------
/*
 * 보안키 만들기 (아키시스템)
 *     num = 17 : 강의실정보
 *           73 : 건물정보
 *           97 : 시간표
 */
async function make_secure_key(num) {
	let ndate = new Date();
	let year = ndate.getFullYear();
	let month = ndate.getMonth() + 1;
	let day = ndate.getDate();
	let hour = ndate.getHours();

	month = (month >= 10) ? month : ('0' + month);
	day = (day >= 10) ? day : ('0' + day);
	hour = (hour >= 10) ? hour : ('0' + hour);

	let form_date = '' + year + month + day + hour;
	let form1 = (Number(form_date.substring(0, 8)) * num).toString(16);
	let form2 = Number(form_date.substring(5, 10)).toString(16);
	let key = form1 + form2;

	return key;
}

/*
 * 접근 토큰 얻어오기 (고래대학교)
 */
async function get_token() {
	let username = 'facility_api';
	let password = '696effb9fe4bbdf87afb067503accb06';
	let token = '';
	/*
	let url = 'https://openapi.korea.ac.kr/oauth/token?client_id=mob_join&username=' + username +
				'&password=' + password +
				'&grant_type=password';
	*/
	let url = "https://datahubapi.korea.ac.kr/oauth/token?" +
		"client_id=avclass" +
		"&username=" + username +
		"&password=" + password +
		"&grant_type=password";

	await axios.post(url).then((Response) => {
		//console.log ("response: " + JSON.stringify (Response.data, null, 2));
		token = Response.data.access_token;
	}).catch((Error) => {
		console.log(Error);
	});

	return token;
}

// ------------------- 고려대학교 정보 -----------------------

/*
 * 카테고리별 물품정보를 데이터 베이스에 저장
 */
async function make_category_db(data) {
	// 데이터를 파일에 저장
	// 데이터 베이스에 저장하는 프로그램 이용하기 위해 파일로 저장
	var fname = data[0].category_name + '.txt';
	fs.writeFile(fname, JSON.stringify(data), 'utf8', function (error) {
		console.log('write end');
	});
	return;
}

/*
 * API를 이용한 카테고리별 정보 얻어오기
 */
async function get_category(category) {
	let ret = '';
	let token = await get_token();
	/*
	let utl = 'https://openapi.korea.ac.kr/api/avcategory?category_name=' + encodeURIComponent (category) +
				'&access_token=' + encodeURIComponent (token);
	*/
	let utl = "https://datahubapi.korea.ac.kr/api/nast/equip/category?" +
		"category_name=" + encodeURIComponent(category) +
		"&access_token=" + encodeURIComponent(token);

	console.log('get_category: ' + url);
	await axios.get(url).then((Response) => {
		//console.log ("response: " + JSON.stringify (Response.data, null, 2));
		make_category_db(Response.data.response.data);
		ret = 'OK';
	}).catch((Error) => {
		console.log('Error: ' + Error);
		ret = Error;
	});

	return ret;
}

/*
 * API를 이용한 카테고리별 검색 정보 얻어오기
 */
async function get_search_category(category, search, word) {
	let ret = '';
	let token = await get_token();
	/*
	let url = 'https://openapi.korea.ac.kr/api/avcategorysearch?category_name=' + encodeURIComponent (category) +
				'&search_name=' + encodeURIComponent (search) +
				'&word=' + encodeURIComponent (word) +
				'&access_token=' + encodeURIComponent (token);
	*/
	let url = "https://datahubapi.korea.ac.kr/api/nast/equip/category?" +
		"category_name=" + encodeURIComponent(category) +
		"&search_div=" + encodeURIComponent(search) +
		"&search_keyword=" + encodeURIComponent(word) +
		"&access_token=" + encodeURIComponent(token);

	console.log('get_search_category: ' + url);
	await axios.get(url).then((Response) => {
		//console.log ("response: " + JSON.stringify (Response.data, null, 2));
		ret = Response.data.response.data;
	}).catch((Error) => {
		console.log('Error: ' + Error);
		ret = Error;
	});

	return ret;
}

/*
 * 강의실별 물품정보를 데이터 베이스에 저장
 */
async function make_roominfo_db(data) {
	// 데이터를 파일에 저장
	// 데이터 베이스에 저장하는 프로그램 이용하기 위해 파일로 저장
	var fname = data[0].bd_name + '_' + data[0].room_no + '.txt';
	fs.writeFile(fname, JSON.stringify(data), 'utf8', function (error) {
		console.log('write end');
	});
	return;
}

/*
 * API를 이용한 강의실별 정보 얻어오기
 */
async function get_roominfo(bd_name, room_name) {
	let ret = '';
	let token = await get_token();
	/*
	let url = 'https://openapi.korea.ac.kr/api/avroominfo?bd_name=' + encodeURIComponent (bd_name) +
				'&room_no=' + encodeURIComponent (room_name) +
				'&access_token=' + encodeURIComponent (token);
	*/
	let url = "https://datahubapi.korea.ac.kr/api/nast/equip/room?" +
		"bd_name=" + encodeURIComponent(bd_name) +
		"&room_no=" + encodeURIComponent(room_name) +
		"&access_token=" + encodeURIComponent(token);

	console.log('get_roominfo: ' + url);
	await axios.get(url).then((Response) => {
		//console.log ("response: " + JSON.stringify (Response.data, null, 2));
		make_roominfo_db(Response.data.response.data);
		ret = 'OK';
	}).catch((Error) => {
		console.log('Error: ' + Error);
		ret = Error;
	});

	return ret;
}

/*
 * 이용자별 물품정보를 데이터 베이스에 저장
 */
async function make_user_db(data) {
	// 데이터를 파일에 저장
	// 데이터 베이스에 저장하는 프로그램 이용하기 위해 파일로 저장
	var fname = data[0].objNo + '.txt';
	fs.writeFile(fname, JSON.stringify(data), 'utf8', function (error) {
		console.log('write end');
	});
	return;
}

/*
 * API를 이용한 유저별 물품 정보 얻어오기
 */
async function get_user(usercode) {
	let ret = 'OK';
	let token = await get_token();
	/*
	let url = 'https://openapi.korea.ac.kr/api/avuser?obj_no=' + encodeURIComponent (usercode) +
				'&access_token=' + encodeURIComponent (token);
	*/
	let url = "https://datahubapi.korea.ac.kr/api/nast/equip/user?" +
		"obj_no=" + encodeURIComponent(usercode) +
		"&access_token=" + encodeURIComponent(token);

	console.log('get_user: ' + url);
	var t1 = Date.now();
	await axios.get(url).then((Response) => {
		// console.log ("response: " + JSON.stringify (Response.data, null, 2));
		// make_user_db (Response.data.response.data);
		ret = Response.data.response.data;
	}).catch((Error) => {
		console.log('Error: ' + Error);
		ret = Error;
	});
	var t2 = Date.now();
	console.log('Response time: ', t2 - t1);

	return ret;
}

async function make_user_item(usercode) {
	var sql = "DELETE FROM tblUserItem WHERE sCode=?";
	console.log('user data delete: ' + usercode);
	await directQuery(sql, [usercode]);
	var datas = await get_user(usercode);
	console.log('user data make: ' + usercode);
	for (var i = 0; i < datas.length; i++) {
		sql = "INSERT INTO tblUserItem VALUES(?,?,?,?,?,?,?,?,?,?,?,NOW()) ";
		sql += "ON DUPLICATE KEY UPDATE sName=?,sCode=?,sType=?,sDeviceName=?,sMaker=?,sModel=?,";
		sql += "sOrgName=?,sBuild=?,sRoom=?,dBuyDate=?,dLastUpdate=NOW()";
		await directQuery(sql, [
			datas[i].avuserResult10, datas[i].avuserResult8, datas[i].objNo,
			datas[i].avuserResult1, datas[i].avuserResult2, datas[i].avuserResult5,
			datas[i].avuserResult6, datas[i].avuserResult7, datas[i].avuserResult3,
			datas[i].avuserResult4, datas[i].avuserResult9,
			datas[i].avuserResult8, datas[i].objNo,
			datas[i].avuserResult1, datas[i].avuserResult2, datas[i].avuserResult5,
			datas[i].avuserResult6, datas[i].avuserResult7, datas[i].avuserResult3,
			datas[i].avuserResult4, datas[i].avuserResult9
		]);
	}
}

/*
 * 1. DB에 데이터가 있는지 확인
 *   1.1. DB에 데이터가 없으면 API를 이용한 DB데이터 생성
 *   1.2. 데이터가 있으면 최신데이터인지 확인
 *     1.2.1 데이터가 이전(어제 이후)이라면 지우고 다시생성
 * 2. DB에서 usercode로 데이터 얻기
 */
async function get_user_item(usercode) {
	var today = new Date();
	var now_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var sql_ret = await directQuery(sql, [usercode]);
	if (sql_ret.length > 0) {
		console.log('DB Date: ' + sql_ret[0].dLastUpdate.substring(0, 10) + ', System Date: ' + now_date);
		if (sql_ret[0].dLastUpdate.substring(0, 10) < now_date) {
			console.log('Time check update');
			await make_user_item(usercode);
		}
	} else {
		console.log('New update');
		await make_user_item(usercode);
	}
}

// ------------------------ 아키시스템 API ------------------------
/*
 * 건물정보 (서울캠퍼스만 해당)
 */
async function make_build_db(data) {
	// let data    = JSON.parse (jdata);
	let result = data.result;
	let flag = data.flag.replace("'", "\\'");
	let message = data.message.replace("'", "\\'");
	let ret_data = '';

	console.log('flag: ' + flag);
	console.log('message: ' + message);
	for (idx in result) {
		let ename = result[idx].name_eng.replace("'", "\\'");
		let bl_id = result[idx].bl_id.replace("'", "\\'");
		let name = result[idx].name.replace("'", "\\'");
		let sql = "SELECT nIndex FROM tblBuild WHERE sName=?";
		let sql_res = await directQuery(sql, [name]);
		if (sql_res.length > 0) {
			let index = sql_res[0].nIndex;
			sql = "UPDATE tblBuild SET sNameEng=?, sBuildID=? WHERE nIndex=?"
			sql_res = await directQuery(sql, [ename, bl_id, index]);
		} else {
			sql = "INSERT INTO tblBuild VALUES (0, 1, '',?,?,?,'','',0,'');";
			sql_res = await directQuery(sql, [name, ename, bl_id]);
		}
		ret_data += sql;
		ret_data += "<br />";
		console.log(sql);
	}
	return ret_data;
}

/*
 * API를 이용한 건물정보 얻어오기
 */
async function get_build() {
	let ret = '';
	let key = await make_secure_key(73);
	let url = "http://cafm.korea.ac.kr/archibus/api_bl_b2tegdsab4a0.jsp?" +
		"key=" + encodeURIComponent(key) +
		"&site_id=" + encodeURIComponent("서울캠퍼스");
	console.log('get_build: ' + url);

	await axios.get(url).then((Response) => {
		// console.log (Response.data);
		ret = make_build_db(Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}

/*
 * 공간 호실 정보 데이터베이스에 저장
 */
async function make_room_db(build_index, data) {
	// let data    = JSON.parse (jdata);
	let result = data.result;
	let flag = data.flag.replace("'", "\\'");
	let message = data.message.replace("'", "\\'");
	let ret_data = '';

	console.log('flag: ' + flag);
	console.log('message: ' + message);

	for (idx in result) {
		let rm_id = result[idx].rm_id.replace("'", "\\'");
		let bl_id = result[idx].bl_id.replace("'", "\\'");
		let name = result[idx].name.replace("'", "\\'");
		let fl_id = result[idx].fl_id.replace("'", "\\'");
		let ename = result[idx].english_name.replace("'", "\\'");
		let sql = "SELECT nIndex FROM tblBuild WHERE sName=?";
		let sql_res = await directQuery(sql, [name]);
		if (sql_res.length > 0) {
			let index = sql_res[0].nIndex;
			sql = "UPDATE tblBuild SET sNameEng=?, sBuildID=?, sRoomID=?, sFloorID=? WHERE nIndex=?";
			sql_res = await directQuery(sql, [ename, bl_id, rm_id, fl_id, index]);
		} else {
			sql = "INSERT INTO tblBuild VALUES (0, ?, '',?,?,?,?,?,0,'');";
			sql_res = await directQuery(sql, [build_index, name, ename, bl_id, rm_id, fl_id]);
		}
		ret_data += sql;
		ret_data += "<br />";
		console.log(sql);
	}
	return ret_data;
}

/*
 * API를 이용한 호실 정보 얻어오기
 */
async function get_room(build_id, build_index) {
	let ret = '';
	let key = await make_secure_key(17);
	let url = "http://cafm.korea.ac.kr/archibus/api_blrm_b2tegdsab4a0.jsp?" +
		"key=" + encodeURIComponent(key) +
		"&bl_id=" + encodeURIComponent(build_id);
	console.log('get_room: ' + url);

	await axios.get(url).then((Response) => {
		//console.log (Response.data);
		ret = make_room_db(build_index, Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}

/*
 * 수업시간표 데이터베이스에 저장
 */
async function make_timetable_db(data) {
	console.log('make_timetable_db: [' + data.resvlist + ']');
	// let data    = JSON.parse (jdata);
	let result = data.resvlist;
	let flag = data.flag.replace("'", "\'");
	let message = data.message.replace("'", "\'");

	console.log('flag: ' + flag);
	console.log('message: ' + message);

	for (idx in result) {
		let college_nm = result[idx].college_nm.replace("'", "\'");    // sCollegeName
		let rm_id = result[idx].rm_id.replace("'", "\'");         // sRoomIdx
		let bl_id = result[idx].bl_id.replace("'", "\'");         // sBuildIdx
		let endtime = result[idx].endtime.replace("'", "\'");       // sEndTime
		let fl_id = result[idx].fl_id.replace("'", "\'");         // sFloorIdx
		let starttime = result[idx].starttime.replace("'", "\'");     // sStartTime
		let event = result[idx].event.replace("'", "\'");         // sTitle
		let startdate = result[idx].startDate.replace("'", "\'");     // sStartDate
		let reserve_type = result[idx].reserve_type.replace("'", "\'");  // sReserveType
		let auto_number = result[idx].auto_number.replace("'", "\'");   // nIndex
		let username = result[idx].username.replace("'", "\'");      // sUsername
		let sql = "INSERT INTO tblTimeTable VALUES (?,?,?,?,?,?,?,?,?,?,?) ";
		sql += "ON DUPLICATE KEY UPDATE sCollegeName=?,sBuildIdx=?,sFloorIdx=?";
		sql += ",sRoomIdx=?,sStartDate=?,sStartTime=?,sEndTime=?,sUsername=?";
		sql += ",sTitle=?,sReserveType=?;";
		let sql_result = await directQuery(sql,
			[auto_number, college_nm, bl_id, fl_id, rm_id, startdate, starttime, endtime, username, event, reserve_type,
				college_nm, bl_id, fl_id, rm_id, startdate, starttime, endtime, username, event, reserve_type]);
		console.log(sql_result);
	}
	return message;
}

/*
 * 해당 날짜의 월요일 계산
 */
function getMondayDate(cday) {
	let paramDate = new Date(cday);
	let day = paramDate.getDay();
	let diff = paramDate.getDate() - day + (day == 0 ? -6 : 1);
	return new Date(paramDate.setDate(diff)).toISOString().substring(0, 10);
}

/*
 * 해당 날짜의 금요일 계산
 */
function getFridayDate(cday) {
	let paramDate = new Date(cday);
	let day = paramDate.getDay();
	let diff = paramDate.getDate() - day + (day == 0 ? -2 : 5);
	return new Date(paramDate.setDate(diff)).toISOString().substring(0, 10);
}

/*
 * API를 이용한 시간표 가져오기
 */
async function get_timetable(start_date, end_date, build_id, floor_id, room_id) {
	let ret = '';

	let sql = "SELECT count(*) cnt ";
	sql += "FROM tblTimeTable ";
	sql += "WHERE sBuildIdx=? AND sFloorIdx=? AND sRoomIdx=? AND sStartDate>=? AND sStartDate<=?;";
	let res = await directQuery(sql,
		[build_id, floor_id, room_id, start_date.substring(0, 10), end_date.substring(0, 10)]);
	console.log("time select: " + res[0].cnt);
	if (res[0].cnt == 0) {
		let key = await make_secure_key(97);
		let url = "http://cafm.korea.ac.kr/archibus/api_reserve_r38efa8dt.jsp?" +
			"key=" + encodeURIComponent(key) +
			"&date_start=" + encodeURIComponent(start_date) +
			"&date_end=" + encodeURIComponent(end_date) +
			"&bl_id=" + encodeURIComponent(build_id) +
			"&fl_id=" + encodeURIComponent(floor_id) +
			"&rm_id=" + encodeURIComponent(room_id);
		console.log('get_timetable: ' + url);

		await axios.get(url).then((Response) => {
			console.log("Response.data", Response.data);
			ret = make_timetable_db(Response.data);
		}).catch((Error) => {
			console.log('Error: ' + Error);
			ret = Error;
		});
	}
	sql = "SELECT * ";
	sql += "FROM tblTimeTable ";
	sql += "WHERE sBuildIdx=? AND sFloorIdx=? AND sRoomIdx=? AND sStartDate>=? AND sStartDate<=? ";
	sql += "ORDER BY sStartDate, sStartDate;";
	res = await directQuery(sql,
		[build_id, floor_id, room_id, start_date.substring(0, 10), end_date.substring(0, 10)]);

	return res;
}

/*
 * 공간도면 가져오기
 *  BUILD_ID + FLOORID
 */
async function get_floor_plan(build_id, floor_id) {
	let id = String(build_id) + String(floor_id) + '.pdf';
	// let url = 'http://cafm.korea.ac.kr/archibus/dwg_download.jsp?" +
	//			"auto_number=' + encodeURIComponent (id);
	let url = "http://cafm.korea.ac.kr/archibus/dwg_download_i4h22cr1a5.jsp?" +
		"auto_number=" + encodeURIComponent(id);

	console.log('get_floor_plan: ' + url);

	// 공간도면(PDF) 가져오기 (http)
	const response = await fetch(url);
	// server에 도면파일 저장할 부분 지정하기
	id = "public/download/" + id;
	const file = fs.createWriteStream(id);
	// 쓰기 시작
	response.body.pipe(file);

	// 파일 쓰기 완료때까지 대기
	async function write_file() {
		return new Promise((resolve, reject) => {
			// 파일 쓰기가 끝나면 resolve() 호출
			file.on('finish', function () {
				resolve('complete');
			});
			// 에러 발생하면 reject()
			file.on('error', reject);
		});
	}
	await write_file();
}

app.get('/', function (req, res) {
	res.redirect("home");
});

app.get('/home', function (req, res) {
	res.render("index");
});

app.get('/dashboard', function (req, res) {
	res.render("dashboard");
});

app.get('/builddash', function (req, res) {
	res.render("builddash");
});

app.get('/energy', function (req, res) {
	res.render("energy");
});

app.get('/fuel', function (req, res) {
	res.render("fuel");
});

app.get('/solar', function (req, res) {
	res.render("solar");
});

app.get('/thermal', function (req, res) {
	res.render("thermal");
});

app.get('/building', function (req, res) {
	res.render("building");
});

app.get('/realestate', function (req, res) {
	res.render("realestate");
});

app.get('/car', function (req, res) {
	res.render("car");
});

app.get('/place', function (req, res) {
	res.render("place");
});

app.get('/land', function (req, res) {
	res.render("land");
});

/*
 * 고장신고(별도화면) html 데이터 가져오기
 */
app.get('/user_set', async function (req, res) {
	console.log('app.get /user_set');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	build = req.query.build;
	room = req.query.room;
	deviceidx = req.query.deviceidx;
	var sql = 'SELECT * FROM tblRelation WHERE nDeviceIdx=?;';
	var ninfo = await directQuery(sql, [deviceidx]);
	sql = 'SELECT * FROM tblOrganization;';
	var oinfo = await directQuery(sql);

	res.render('user_set', { build: build, room: room, deviceidx: deviceidx, ninfo: ninfo, oinfo: oinfo });
});

/*
 * 고장신고 데이터 저장하기
 */
app.post('/user_set', async function (req, res) {
	console.log('app.post /user_set');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	org_name = req.body.group;
	pub_idx = req.body.public;
	master_name = req.body.public_user;
	user_name = req.body.user;
	device_idx = req.body.deviceidx;

	var sql = 'SELECT * FROM tblRelation WHERE nDeviceIdx=?';
	var ret = await directQuery(sql, [device_idx]);
	if (ret.length > 0) {
		sql = 'UPDATE tblRelation SET sOrgName=?,nPublic=?,sMasterName=?,sUserName=? WHERE nDeviceIdx=?;';
	}
	else {
		sql = 'INSERT INTO tblRelation(sOrgName,nPublic,sMasterName,sUserName,nDeviceIdx,dDate) VALUES(?,?,?,?,?,NOW());';
	}
	// console.log ('SQL : ' + sql);
	// console.log ('argument : ' + org_name + ',' + pub_idx + ',' + master_name + ',' + user_name + ',' + device_idx);
	ret = await directQuery(sql, [org_name, pub_idx, master_name, user_name, device_idx]);
	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>고려대AV비품관리</title></head>
	<body><script>alert ('저장되었습니다.');window.close ();</script></body>
	</html>`;
	res.send(html);
});

// 시간표
app.get('/timetables', async function (req, res) {
	console.log('app.get /timetables');
	var build_id = req.query.build_id;
	var floor_id = req.query.floor_id;
	var room_id = req.query.room_id;
	var curr_date = Date.now();
	let start_date = getMondayDate(curr_date);
	let end_date = getFridayDate(curr_date);

	/*
	build_id = '012400';
	floor_id = 'FL01';
	room_id  = '167';
	start_date = '2022-05-30 00:00:00';
	end_date   = '2022-06-03 23:59:59';
	*/

	var result = await get_timetable(start_date, end_date, build_id, floor_id, room_id);
	var page_data = {
		'name': req.session.user.name
	};

	console.log("timetables result", result);

	res.render('timetables', { page_data: page_data, lists: result, idx: req.session.user.name });
});

// 공간도면
app.get('/floor_plan', async function (req, res) {
	var build_id = req.query.build_id;
	var floor_id = req.query.floor_id;
	var ret = '';

	if (build_id == '' && floor_id == '') {
		ret = "<script>alert('건물정보가 없습니다.');</script>";
		res.send(ret);
	} else {
		ret = await get_floor_plan(build_id, floor_id);
		var id = "download/" + String(build_id) + String(floor_id) + '.pdf';

		res.render("floor_view", { url: id });

		/*
		let id  = String (build_id) + String (floor_id) + '.pdf';
		let url = "http://cafm.korea.ac.kr/archibus/dwg_download_i4h22cr1a5.jsp?auto_number=" + encodeURIComponent (id);
		console.log ('url: ' + url);
		res.render ('floor_view', {url: url})
		*/

		// req.url = url;
		// header = {
		// 	"Content-Type": "application/pdf",
		// 	"Content-Disposition": "inline; filename=" + build_id + floor_id + ".pdf"
		// }
		// res.header(header).redirect (url);


		//res.redirect (url);
		//ret = request.get (url, {encoding: null});

		/*
		await axios.get (url, {responseType: "blob"}).then ((response)=> {
			ret = new Uint8Array.from([response.data]);
		}).catch ((Error)=> {
			console.log ('Error: ' + Error);
			ret = Error;
		});
		*/

		/*
		ret = await get_floor_plan (build_id, floor_id);
		header = {
			"Content-Type": "application/pdf",
			"Content-Disposition": "attachment; filename=" + build_id + floor_id + ".pdf"
			// inline (direct view) or attachment (file save)
		}
		//res.header(header).send (Buffer.from (ret, 'binary'));
		*/
		//res.attachment (build_id + floor_id + '.pdf');
		//res.end (ret, 'binary');
	}
});

/*
 * 고장점검현황 popup html
 */
app.get('/status_set', function (req, res) {
	console.log('app.get /status_set');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	idx = req.query.idx;
	res.render('status_set', { idx: idx });
});

/*
 * 고장점검현황 상태값 변경
 */
app.post('/status_set', async function (req, res) {
	console.log('app.post /status_set');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	var data = JSON.parse(req.body.data);

	var value_idx = data.idx;
	var value_mode = data.mode;
	var value_done = data.done;

	console.log("idx", value_idx);
	console.log("mode", value_mode);

	var sql = "UPDATE tblRepair SET nMode=?,dDoneDate=NOW(),sDoneName=? WHERE nIndex=?;";
	var ret = await directQuery(sql, [value_mode, value_done, value_idx]);
	const html = `<!DOCTYPE html>
	<html><head><meta charset='UTF-8'><title>고려대AV비품관리</title></head></head>
	<body><script>alert('저장되었습니다.');window.close();</script></body>
	</html>`;
	res.send({ result: '저장되었습니다.' });
});

app.post('/statusImg_set', async function (req, res) {
	var data = JSON.parse(req.body.data);
	var repairIdx = data.idx;

	for (var i = 0; i < data.repairImg.length; i++) {
		sql = 'INSERT INTO tblRepairImg(nRepairIdx,sImgPath,sImgBin) ';
		sql += 'VALUES(?,?,?);';

		ret = await directQuery(sql, [repairIdx, data.repairImg[i], data.repairImgBin[i]]);
	}

	var result = '저장되었습니다.';
	if (!ret.affectedRows) {
		result = '저장하지 못했습니다.\n관리자에게 문의해주세요.';
	}

	res.send({ result: result });
});

app.post('/status_delete', async function (req, res) {
	console.log('app.post /status_delete');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	var data = JSON.parse(req.body.data);

	var value_idx = data.idx;

	console.log("idx", value_idx);

	// DELETE FROM `dbKorea`.`tblRepair` WHERE (`nIndex` = '20');
	var sql = "DELETE FROM tblRepair WHERE nIndex=?;";
	var ret = await directQuery(sql, [value_idx]);
	const html = `<!DOCTYPE html>
	<html><head><meta charset='UTF-8'><title>고려대AV비품관리</title></head></head>
	<body><script>alert('삭제되었습니다.');window.close();</script></body>
	</html>`;
	res.send(html);
});

app.get('/classroom', async function (req, res) {

	var build = 43;
	var room = 4183;
	var nstart = 0;

	var sql = '';

	var build_all = 1;
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery(sql, [build_all]);

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? and nIndex= ?;';
	var room_info = await directQuery(sql, [build, room]);

	// 강의실 비품 가져오기
	/*
		var sql = 'SELECT a.sName name,b.nIndex dindex,b.sItemNumber dnum,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
		sql += 'b.sStatus status,c.sOrgName org_name,c.sMasterName master_name,c.sRealName real_name,c.sUserName user_name,c.nPublic public ';
		sql += 'FROM tblBuild a,tblDevice b LEFT OUTER JOIN tblRelation c ';
		sql += 'ON b.nIndex=c.nDeviceIdx WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=? ';
		*/

	sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1)) - 1;
	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'email': req.session.user['email'],
		'tel': req.session.user['tel'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'build': build,
		'room': room,
		'roomID': room_info[0].sRoomID
	};

	res.render("sub_classroom", { page_data: page_data, lists: build_info, rinfos: rinfos, room_info: room_info });
});

app.post('/classroom_build', async function (req, res) {

	var build = 1;
	var nstart = 0;

	if (req.body.build) {
		build = req.body.build;
	}

	console.log("new build num", build);

	var sql = '';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=?;';
	var room_info = await directQuery(sql, [build]);

	if (room_info.length == 0) {
		var rinfos = [];

		var start_page = nstart - (nstart % 10);
		var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1)) - 1;

		var page_data = {
			'name': req.session.user['name'],
			'userid': req.session.user['userid'],
			'class': req.session.user['class'],
			'email': req.session.user['email'],
			'tel': req.session.user['tel'],
			'count': nstart,
			'start': start_page,
			'end': end_page,
			'total': 0,
			'build': build,
			'room': -1,
			'roomID': ""
		};

		res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
	else {
		// 강의실 비품 가져오기

		console.log("new room num", room_info[0].sRoomID);

		sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT 10 OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
		var start_page = nstart - (nstart % 10);
		var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1)) - 1;
		var page_data = {
			'name': req.session.user['name'],
			'userid': req.session.user['userid'],
			'class': req.session.user['class'],
			'email': req.session.user['email'],
			'tel': req.session.user['tel'],
			'count': nstart,
			'start': start_page,
			'end': end_page,
			'total': total,
			'build': build,
			'room': room_info[0].nIndex,
			'roomID': room_info[0].sRoomID
		};

		res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
});

app.post('/classroom_room', async function (req, res) {

	var build = 1;
	var room = 2;
	var nstart = 0;

	if (req.body.build) {
		build = req.body.build;
	}
	if (req.body.room) {
		room = req.body.room;
	}

	console.log("build", build);
	console.log("room", room);


	var sql = '';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and nIndex=?;';
	var room_info = await directQuery(sql, [build, room]);

	if (room_info.length == 0) {
		var rinfos = [];

		var page_data = {
			'name': req.session.user['name'],
			'userid': req.session.user['userid'],
			'class': req.session.user['class'],
			'email': req.session.user['email'],
			'tel': req.session.user['tel'],
			'count': nstart,
			'start': 0,
			'end': 0,
			'total': 0,
			'build': build,
			'room': room,
			'roomID': room_info[0].sRoomID
		};

		res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
	else {
		// 강의실 비품 가져오기

		sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT 10 OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
		var start_page = nstart - (nstart % 10);
		var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1)) - 1;
		var page_data = {
			'name': req.session.user['name'],
			'userid': req.session.user['userid'],
			'class': req.session.user['class'],
			'email': req.session.user['email'],
			'tel': req.session.user['tel'],
			'count': nstart,
			'start': start_page,
			'end': end_page,
			'total': total,
			'build': build,
			'room': room,
			'roomID': room_info[0].sRoomID
		};

		res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}


});

app.post('/classroom_page', async function (req, res) {

	var build = 1;
	var room = 2;
	var nstart = 0;

	if (req.body.build) {
		build = req.body.build;
	}
	if (req.body.room) {
		room = req.body.room;
	}
	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	console.log("build", build);
	console.log("room", room);
	console.log("nstart", nstart);

	var sql = '';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and nIndex=?;';
	var room_info = await directQuery(sql, [build, room]);

	if (room_info.length == 0) {
		var rinfos = [];

		var page_data = {
			'name': req.session.user['name'],
			'userid': req.session.user['userid'],
			'class': req.session.user['class'],
			'email': req.session.user['email'],
			'tel': req.session.user['tel'],
			'count': nstart,
			'start': 0,
			'end': 0,
			'total': 0,
			'build': build,
			'room': room,
			'roomID': room_info[0].sRoomID
		};

		res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
	else {
		console.log("room_info page");

		// 강의실 비품 가져오기

		sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT 10 OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
		var start_page = nstart - (nstart % 10);
		var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1)) - 1;
		var page_data = {
			'name': req.session.user['name'],
			'userid': req.session.user['userid'],
			'class': req.session.user['class'],
			'email': req.session.user['email'],
			'tel': req.session.user['tel'],
			'count': nstart,
			'start': start_page,
			'end': end_page,
			'total': total,
			'build': build,
			'room': room,
			'roomID': room_info[0].sRoomID
		};

		res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}


});

app.get('/classroom_old', async function (req, res) {

	var build = 1;
	var room = 44;
	var nstart = 0;

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery(sql, [build]);
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=?;';
	var room_info = await directQuery(sql, [room]);

	// 강의실 비품 가져오기
	/*
	var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
	sql += 'FROM tblBuild a,tblDevice b ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
	*/

	console.log("room_info length", room_info.length);

	sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1)) - 1;
	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'email': req.session.user['email'],
		'tel': req.session.user['tel'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'build': build,
		'room': room
	};

	res.render("sub_classroom", { page_data: page_data, lists: build_info, rinfos: rinfos, room_info: room_info });
});

app.post('/classroom', async function (req, res) {

	var build = 43;
	var room = 4183;
	var nstart = 0;

	if (req.body.build) {
		build = req.body.build;
	}
	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	if (req.body.room) {
		room = req.body.room;
	}
	else {
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		var info = await directQuery(sql, [build]);
		room = info[0].nIndex;
	}
	var sql = '';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery(sql, [build]);
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=?;';
	var room_info = await directQuery(sql, [build_info.nIndex]);

	// 인문계/자연계 전체 목록 가져오기
	sql = 'SELECT * FROM tblBuild  WHERE nRootIndex=2 OR nRootIndex=3;';
	var lists = await directQuery(sql);

	// 빌딩정보 가져오기
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var rooms = await directQuery(sql, [build]);

	// 강의실 비품 가져오기

	var sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,dFixtureDate date,sUserOrg org,sUser user';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo= ? AND sRoomNo= ? AND sFixtureStatus="사용";';

	var res_room = await directQuery(sql, [room_info.sBuildID, room_info.sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [room_info.sBuildID, room_info.sRoomID, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'email': req.session.user['email'],
		'tel': req.session.user['tel'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'mode': mode,
		'build': build,
		'room': room,
		'roomID': room_info[0].sRoomID
	};

	res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, lists: lists, rooms: rooms, rinfos: rinfos, room_info: room_info });
});

/*
 * 강의실 엑셀 다운로드
 */
app.get('/class_download', async function (req, res) {
	try {
		console.log('app.get /class_download');
		if (req.session.user == undefined) {
			res.render('index.html');
			return;
		}

		// 건물명/층/호실번호/호실명/구분/물품번호/물품명/제조사/모델명/소속부서/사용자구분/실별책임자/물품관리자/사용자/상태
		// 강의실 정보 가져오기
		var build_idx = req.query.build;
		var room_idx = req.query.room;

		console.log("build_idx", build_idx);
		console.log("room_idx", room_idx);

		/*
		var sql = 'SELECT b.sName buildname,a.sFloorID floor,a.sRoomID roomnum,a.sName roomname,c.sType type,c.sItemNumber itemnum,c.sList list,c.sMaker maker, ';
		sql += 'c.sModel model,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public,c.sStatus status ';
		sql += 'FROM tblBuild a,tblBuild b,tblDevice c LEFT OUTER JOIN tblRelation d ';
		sql += 'ON c.nIndex=d.nDeviceIdx ';
		sql += 'WHERE a.nIndex=c.nRoomIndex AND a.nRootIndex=b.nIndex AND c.nRoomIndex=? ';
		*/

		var sql = 'SELECT * ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo= ? AND sRoomNo= ? AND sFixtureStatus="사용";';

		var res_room = await directQuery(sql, [build_idx, room_idx]);

		const curr_date = new Date();
		// Excel 생성
		const workbook = new exceljs.Workbook();
		// 작성자/날짜 생성
		workbook.creator = 'kounosoft';
		workbook.created = curr_date;
		workbook.modified = curr_date;
		// 파일이름 생성(날짜시간포함)
		var month = curr_date.getMonth() + 1;
		var day = curr_date.getDate();
		var hour = curr_date.getHours();
		var min = curr_date.getMinutes();
		var sec = curr_date.getSeconds();
		month = (month < 10 ? '0' : '') + month;
		day = (day < 10 ? '0' : '') + day;
		hour = (hour < 10 ? '0' : '') + hour;
		min = (min < 10 ? '0' : '') + min;
		sec = (sec < 10 ? '0' : '') + sec;
		const filename = 'classroom_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// sheet 생성, 제목 꾸미기
		const sheetOne = workbook.addWorksheet('Sheet One');
		sheetOne.columns = [
			{ header: '건물명', key: 'build', width: 20 },
			{ header: '층', key: 'floor', width: 10 },
			{ header: '호실번호', key: 'roomnum', width: 10 },
			{ header: '호실명', key: 'room', width: 10 },
			{ header: '구분', key: 'category', width: 10 },
			{ header: '물품번호', key: 'itemnum', width: 20 },
			{ header: '물품명', key: 'name', width: 20 },
			{ header: '모델명(제조사)', key: 'model', width: 45 },
			{ header: '소속부서', key: 'organi', width: 10 },
			{ header: '공용/개인', key: 'public', width: 10 },
			{ header: '실별책임자', key: 'master', width: 10 },
			{ header: '물품관리자', key: 'real', width: 10 },
			{ header: '사용자', key: 'user', width: 10 },
			{ header: '상태', key: 'status', width: 10 }
		];
		// 필드값 넣기
		for (i = 0; i < res_room.length; i++) {
			var rows = {};
			rows['build'] = res_room[i].sBuild;
			rows['floor'] = res_room[i].sFloor;
			rows['roomnum'] = res_room[i].sRoomNo;
			rows['room'] = res_room[i].sRoom;
			rows['category'] = res_room[i].sFixtureType;
			rows['itemnum'] = res_room[i].sFixtureNo;
			rows['name'] = res_room[i].sFixtureName;
			rows['model'] = res_room[i].sFixtureModel + "(" + res_room[i].sFixtureMaker + ")";
			rows['organi'] = res_room[i].sOrg;
			rows['public'] = res_room[i].sUser == '공동사용' ? '공동' : '개인';
			rows['master'] = res_room[i].sUser;
			rows['real'] = res_room[i].sRuUser;
			rows['user'] = res_room[i].sRuUser;
			rows['status'] = res_room[i].sRuStatus;
			sheetOne.addRow(rows);
		}
		sheetOne.getRow(1).alignment = {
			vertical: 'middle',
			horizontal: 'center',
			wrapText: true
		}
		sheetOne.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFCCCCCC' }
		}
		// 다운로드
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
		workbook.xlsx.write(res).then(function (res_room) {
			res.end();
		});
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

app.get('/organization', async function (req, res) {

	console.log('app.get /organization');

	var large_lists = '';		// 대분류 결과 리스트
	var middle_lists = '';		// 중분류 결과 리스트
	var small_lists = '';		// 소분류 결과 리스트
	var contents_lists = '';	// 부속 결과 리스트
	var select_l = 0;			// 대분류 선택값
	var select_m = 0;			// 중분류 선택값
	var select_s = 0;			// 소분류 선택값
	var select_c = 0;			// 부속 선택값
	var mode = 'large';			// 분류값 기본
	var org_index = 59;			// 가져올 값

	if (req.session.user == undefined) {
		res.render('index');
		return;
	}

	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}
	if (req.query.slarge) {
		select_l = req.query.slarge;
		if (select_l > 0)
			org_index = req.query.slarge;
	}
	if (req.query.smiddle) {
		select_m = req.query.smiddle;
		if (select_m > 0)
			org_index = req.query.smiddle;
	}
	if (req.query.ssmall) {
		select_s = req.query.ssmall;
		if (select_s > 0)
			org_index = req.query.ssmall;
	}
	if (req.query.scontents) {
		select_c = req.query.scontents;
		if (select_c > 0)
			org_index = req.query.scontents;
	}

	// 대분류 리스트
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=0 ORDER BY sName ASC;';
	large_lists = await directQuery(sql);

	// 중분류 리스트
	if (req.query.slarge > 0) {
		// 선택된 대분류가 있다면
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [req.query.slarge]);
	}
	else {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [large_lists[0].nIndex]);
	}

	// 소분류 리스트
	if (req.query.smiddle) {
		if (req.query.smiddle > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [req.query.smiddle]);
		}
		else if (middle_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
		}
	}
	else {
		if (middle_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
		}
	}

	// 부속 리스트
	if (req.query.ssmall) {
		if (req.query.ssmall > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [req.query.ssmall]);
		}
		else if (small_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [small_lists[0].nIndex]);
		}
	}
	else {
		if (small_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [small_lists[0].nIndex]);
		}
	}

	/*
	var sql = 'SELECT a.sName roomname,b.nIndex dindex,b.sItemNumber dnum,c.sName buildname,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	sql += 'b.sStatus status,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public ';
	sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx AND d.nOrgIdx=? ';
	*/

	console.log("org_index", org_index);

	var sql = 'SELECT sName name ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE nindex=? ';

	var res_org = await directQuery(sql, [org_index]);

	sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

	var res_total = await directQuery(sql, [res_org[0].name]);
	var total = res_total.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var oinfos = await directQuery(sql, [res_org[0].name, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	res.render("sub_organization", {
		page_data: page_data, large_lists: large_lists, middle_lists: middle_lists,
		small_lists: small_lists, contents_lists: contents_lists, slarge: select_l,
		smiddle: select_m, ssmall: select_s, scontents: select_c, oinfos: oinfos
	});
});

app.post('/organization', async function (req, res) {

	console.log('app.post /organization');

	var large_lists = '';		// 대분류 결과 리스트
	var middle_lists = '';		// 중분류 결과 리스트
	var small_lists = '';		// 소분류 결과 리스트
	var contents_lists = '';	// 부속 결과 리스트
	var select_l = 0;			// 대분류 선택값
	var select_m = 0;			// 중분류 선택값
	var select_s = 0;			// 소분류 선택값
	var select_c = 0;			// 부속 선택값
	var mode = 'large';			// 분류값 기본
	var org_index = 0;			// 가져올 값

	if (req.session.user == undefined) {
		res.render('index');
		return;
	}

	var nstart = 0;
	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	if (req.body.slarge) {
		select_l = req.body.slarge;
		if (select_l > 0)
			org_index = req.body.slarge;
	}
	if (req.body.smiddle) {
		select_m = req.body.smiddle;
		if (select_m > 0)
			org_index = req.body.smiddle;
	}
	if (req.body.ssmall) {
		select_s = req.body.ssmall;
		if (select_s > 0)
			org_index = req.body.ssmall;
	}
	if (req.body.scontents) {
		select_c = req.body.scontents;
		if (select_c > 0)
			org_index = req.body.scontents;
	}

	// 대분류 리스트
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=0 ORDER BY sName ASC';
	large_lists = await directQuery(sql);

	// 중분류 리스트
	if (req.body.slarge > 0) {
		console.log("slarge", req.body.slarge);
		// 선택된 대분류가 있다면
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [req.body.slarge]);
	}
	else {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [large_lists[0].nIndex]);
	}

	// 소분류 리스트
	if (req.body.smiddle) {
		if (req.body.smiddle > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [req.body.smiddle]);
		}
		else if (middle_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
		}
	}
	else {
		if (middle_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
		}
	}

	// 부속 리스트
	if (req.body.ssmall) {
		if (req.body.ssmall > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [req.body.ssmall]);
		}
		else if (small_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [small_lists[0].nIndex]);
		}
	}
	else {
		if (small_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [small_lists[0].nIndex]);
		}
	}

	/*
	var sql = 'SELECT a.sName roomname,b.nIndex dindex,b.sItemNumber dnum,c.sName buildname,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	sql += 'b.sStatus status,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public ';
	sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx AND d.nOrgIdx=? ';
	*/

	console.log("nindex", org_index)

	var sql = 'SELECT sName name ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE nindex=? ';

	var res_org = await directQuery(sql, [org_index]);

	sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

	var res_total = await directQuery(sql, [res_org[0].name]);

	var total = res_total.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var oinfos = await directQuery(sql, [res_org[0].name, Number(nstart * 10)]);
	//console.log("oinfos",oinfos);

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	res.send({
		page_data: page_data, large_lists: large_lists, middle_lists: middle_lists,
		small_lists: small_lists, contents_lists: contents_lists, slarge: select_l,
		smiddle: select_m, ssmall: select_s, scontents: select_c, oinfos: oinfos
	});
});

app.post('/organization_search', async function (req, res) {
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var sname = req.body.sname;
	var nstart = 0;
	var user_idx = req.session.user.userid;

	var sql = 'SELECT sName, nIndex ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE sName=? ';

	var res_org = await directQuery(sql, [sname]);
	var org_index = res_org[0].nIndex;

	sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

	var res_total = await directQuery(sql, [res_org[0].sName]);

	var total = res_total.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var oinfos = await directQuery(sql, [res_org[0].sName, Number(nstart * 10)]);
	//console.log("oinfos",oinfos);

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	res.send({ page_data: page_data, oinfos: oinfos });
});

app.post('/organization_page', async function (req, res) {

	var large_lists = '';		// 대분류 결과 리스트
	var middle_lists = '';		// 중분류 결과 리스트
	var small_lists = '';		// 소분류 결과 리스트
	var contents_lists = '';	// 부속 결과 리스트
	var select_l = 0;			// 대분류 선택값
	var select_m = 0;			// 중분류 선택값
	var select_s = 0;			// 소분류 선택값
	var select_c = 0;			// 부속 선택값
	var mode = 'large';			// 분류값 기본
	var org_index = 0;			// 가져올 값

	if (req.session.user == undefined) {
		res.render('index');
		return;
	}

	var nstart = 0;
	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	if (req.body.slarge) {
		select_l = req.body.slarge;
		if (select_l > 0)
			org_index = req.body.slarge;
	}
	if (req.body.smiddle) {
		select_m = req.body.smiddle;
		if (select_m > 0)
			org_index = req.body.smiddle;
	}
	if (req.body.ssmall) {
		select_s = req.body.ssmall;
		if (select_s > 0)
			org_index = req.body.ssmall;
	}
	if (req.body.scontents) {
		select_c = req.body.scontents;
		if (select_c > 0)
			org_index = req.body.scontents;
	}

	// 대분류 리스트
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=0 ORDER BY sName ASC';
	large_lists = await directQuery(sql);

	// 중분류 리스트
	if (req.body.slarge > 0) {
		console.log("slarge", req.body.slarge);
		// 선택된 대분류가 있다면
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [req.body.slarge]);
	}
	else {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [large_lists[0].nIndex]);
	}

	// 소분류 리스트
	if (req.body.smiddle) {
		if (req.body.smiddle > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [req.body.smiddle]);
		}
		else if (middle_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
		}
	}
	else {
		if (middle_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
		}
	}

	// 부속 리스트
	if (req.body.ssmall) {
		if (req.body.ssmall > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [req.body.ssmall]);
		}
		else if (small_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [small_lists[0].nIndex]);
		}
	}
	else {
		if (small_lists.length > 0) {
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			contents_lists = await directQuery(sql, [small_lists[0].nIndex]);
		}
	}

	console.log("nindex", org_index)

	var sql = 'SELECT sName name ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE nindex=? ';

	var res_org = await directQuery(sql, [org_index]);

	sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

	var res_total = await directQuery(sql, [res_org[0].name]);

	var total = res_total.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var oinfos = await directQuery(sql, [res_org[0].name, Number(nstart * 10)]);
	//console.log("oinfos",oinfos);

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	res.send({
		page_data: page_data, large_lists: large_lists, middle_lists: middle_lists,
		small_lists: small_lists, contents_lists: contents_lists, slarge: select_l,
		smiddle: select_m, ssmall: select_s, scontents: select_c, oinfos: oinfos
	});
});

/*
 * 조직도별 엑셀 다운로드
 */
app.get('/org_download', async function (req, res) {
	try {
		console.log('app.get /org_download');
		if (req.session.user == undefined) {
			res.render('index.html');
			return;
		}

		// 조직도별 정보 가져오기
		/*
		var sql = 'SELECT c.sName buildname,a.sFloorID floor,a.sRoomID roomnum,a.sName roomname,b.sType type,b.sItemNumber itemnum,b.sList list,b.sMaker maker, ';
		sql += 'b.sModel model,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public,b.sStatus status ';
		sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d ';
		sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx AND d.nOrgIdx=? ';
		var res_org = await directQuery (sql, [req.query.org_index]);
		*/

		var sql = 'SELECT sName name ';
		sql += 'FROM tblOrganization ';
		sql += 'WHERE nindex=? ';

		var res_name = await directQuery(sql, [req.query.org_index]);

		sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sUserOrg=? ';
		var res_org = await directQuery(sql, [res_name[0].name]);

		const curr_date = new Date();
		// Excel 생성
		const workbook = new exceljs.Workbook();
		// 생성자/날짜 생성
		workbook.creator = 'kounosoft';
		workbook.created = curr_date;
		workbook.modified = curr_date;
		// 파일이름 생성(날짜시간 포함)
		var month = curr_date.getMonth() + 1;
		var day = curr_date.getDate();
		var hour = curr_date.getHours();
		var min = curr_date.getMinutes();
		var sec = curr_date.getSeconds();
		month = (month < 10 ? '0' : '') + month;
		day = (day < 10 ? '0' : '') + day;
		hour = (hour < 10 ? '0' : '') + hour;
		min = (min < 10 ? '0' : '') + min;
		sec = (sec < 10 ? '0' : '') + sec;
		const filename = 'organization_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// Sheet 생성
		const sheetOne = workbook.addWorksheet('Sheet One');
		// 헤더 꾸미기
		sheetOne.columns = [
			{ header: '건물명', key: 'build', width: 20 },
			{ header: '층', key: 'floor', width: 10 },
			{ header: '호실번호', key: 'roomnum', width: 10 },
			{ header: '호실명', key: 'room', width: 10 },
			{ header: '구분', key: 'category', width: 20 },
			{ header: '물품번호', key: 'itemnum', width: 20 },
			{ header: '물품명', key: 'list', width: 20 },
			{ header: '모델명(제조사)', key: 'model', width: 45 },
			{ header: '소속부서', key: 'organi', width: 10 },
			{ header: '공용/개인', key: 'public', width: 10 },
			{ header: '실별책임자', key: 'master', width: 10 },
			{ header: '물품관리자', key: 'real', width: 10 },
			{ header: '사용자', key: 'user', width: 10 },
			{ header: '상태', key: 'status', width: 10 }
		];
		// 필드값 넣기
		for (i = 0; i < res_org.length; i++) {
			var rows = {};
			rows['build'] = res_org[i].buildname;
			rows['floor'] = res_org[i].floor;
			rows['roomnum'] = res_org[i].roomnum;
			rows['room'] = res_org[i].roomname;
			rows['category'] = res_org[i].type;
			rows['itemnum'] = res_org[i].itemnum;
			rows['list'] = res_org[i].list;
			rows['model'] = res_org[i].model + "(" + res_org[i].maker + ")";
			rows['organi'] = res_org[i].org_name;
			rows['public'] = res_org[i].public == '0' ? '공동' : '개인';
			rows['master'] = res_org[i].master_name;
			rows['real'] = res_org[i].real_name;
			rows['user'] = res_org[i].user_name;
			rows['status'] = res_org[i].status;
			sheetOne.addRow(rows);
		}
		sheetOne.getRow(1).alignment = {
			vertical: 'middle',
			horizontal: 'center',
			wrapText: true
		}
		sheetOne.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFCCCCCC' }
		}
		// 다운로드
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
		workbook.xlsx.write(res).then(function (res_org) {
			res.end();
		});
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

app.get('/personal', async function (req, res) {
	console.log('app.get /personal');

	if (req.session.user == undefined) {
		res.render('index');
		return;
	}
	var ssearch = 0;
	var sname = '';
	var nstart = 0;
	var user_idx = req.session.user.userid;
	//var user_idx = 112563;

	if (req.query.nstart) {
		nstart = req.query.nstart;
	}
	if (req.query.ssearch) {
		ssearch = parseInt(req.query.ssearch);
	}
	if (req.query.sname) {
		sname = req.query.sname;
	}
	if (sname != '') {
		qsname = "%" + sname + "%";
	}
	switch (parseInt(ssearch)) {
		case 1: exsql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 2: exsql += 'AND sBuildNo LIKE ? '; break; // 건물명(번호로 검색)
		case 3: exsql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 4: exsql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 5: exsql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 6: exsql += 'AND sUserNo=? '; qsname = sname; break; // 관리자(사원번호로 검색)
	}

	//await get_user_item (user_idx);
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var res_total = '';
	if (ssearch > 0) {
		sql += exsql;
		tsql += exsql;
		res_total = await directQuery(tsql, [user_idx, qsname]);
	} else {
		res_total = await directQuery(tsql, [user_idx]);
	}
	var total = res_total[0].tot;
	sql += " LIMIT 10 OFFSET ?;";

	var pinfos = '';
	if (ssearch > 0) {
		pinfos = await directQuery(sql, [user_idx, qsname, Number(nstart * 10)]);
	} else {
		//console.log(user_idx);
		pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	}
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	//console.log("pinfos", pinfos);

	res.render('sub_personal', { page_data: page_data, pinfos: pinfos, pindex: user_idx, ssearch: ssearch, sname: sname });
});

/*
 * 개인별 검색 데이터
 */
app.post('/personal_search', async function (req, res) {
	console.log('app.post /personal_search');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;
	var nstart = 0;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	var user_idx = req.session.user.userid;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	//await get_user_item (user_idx);
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	var res_total = '';
	if (ssearch > 0) {
		sql += exsql;
		tsql += exsql;
		res_total = await directQuery(tsql, [user_idx, qsname]);
	} else {
		res_total = await directQuery(tsql, [user_idx]);
	}
	var total = res_total[0].tot;
	sql += " LIMIT 10 OFFSET ?;";

	var qsname = "%" + sname + "%";
	/*
	switch (parseInt (ssearch))
	{
		case 1: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 2: sql += 'AND sBuildNo LIKE ? '     ; break; // 건물명(번호로 검색)
		case 3: sql += 'AND sFixtureMaker LIKE ? '     ; break; // 제조사
		case 4: sql += 'AND sFixtureModel LIKE ? '     ; break; // 모델명
		case 5: sql += 'AND sUserOrg LIKE ? '   ; break; // 소속부서
		case 6: sql += 'AND sUserNo=? '; qsname = sname; break; // 관리자(사원번호로 검색)
	}
	*/
	switch (parseInt(ssearch)) {
		case 1: sql += 'AND sBuild LIKE ? '; tsql += 'AND sBuild LIKE ? '; break; // 건물명
		case 2: sql += 'AND sRoom LIKE ? '; tsql += 'AND sRoom LIKE ? '; break; // 호실
		case 3: sql += 'AND sFixtureType LIKE ? '; tsql += 'AND sFixtureType LIKE ? '; break; // 구분
		case 4: sql += 'AND sFixtureNo LIKE ? '; tsql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 5: sql += 'AND sFixtureName LIKE ? '; tsql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 6: sql += 'AND sFixtureModel LIKE ? '; tsql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 7: sql += 'AND sFixtureMaker LIKE ? '; tsql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 8: sql += 'AND sUserOrg LIKE ? '; tsql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: sql += 'AND sUser LIKE ? '; tsql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: sql += 'AND dFixtureDate LIKE ? '; tsql += 'AND dFixtureDate LIKE ? '; break; // 구입일
	}
	var res_total = await directQuery(tsql, [user_idx, qsname]);
	var total = res_total[0].tot;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, qsname, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};
	console.log(page_data);

	res.send({ page_data: page_data, pinfos: pinfos, pindex: user_idx, ssearch: ssearch, sname: sname });
});

app.post('/personal_page', async function (req, res) {

	if (req.session.user == undefined) {
		res.render('index');
		return;
	}
	var ssearch = 0;
	var sname = '';
	var nstart = 0;
	var user_idx = req.session.user.userid;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	if (req.query.ssearch) {
		ssearch = parseInt(req.query.ssearch);
	}
	if (req.query.sname) {
		sname = req.query.sname;
	}
	if (sname != '') {
		qsname = "%" + sname + "%";
	}
	switch (parseInt(ssearch)) {
		case 1: exsql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 2: exsql += 'AND sBuildNo LIKE ? '; break; // 건물명(번호로 검색)
		case 3: exsql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 4: exsql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 5: exsql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 6: exsql += 'AND sUserNo=? '; qsname = sname; break; // 관리자(사원번호로 검색)
	}

	//await get_user_item (user_idx);
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	var res_total = '';
	if (ssearch > 0) {
		sql += exsql;
		tsql += exsql;
		res_total = await directQuery(tsql, [user_idx, qsname]);
	} else {
		res_total = await directQuery(tsql, [user_idx]);
	}
	var total = res_total[0].tot;
	sql += " LIMIT 10 OFFSET ?;";
	var pinfos = '';
	if (ssearch > 0) {
		pinfos = await directQuery(sql, [user_idx, qsname, Number(nstart * 10)]);
	} else {
		//console.log(user_idx);
		pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	}
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	res.send({ page_data: page_data, pinfos: pinfos, pindex: user_idx, ssearch: ssearch, sname: sname });

});

app.get('/personal_download', async function (req, res) {
	try {
		console.log('app.get /personal_download');
		if (req.session.user == undefined) {
			res.render('index.html');
			return;
		}

		// 개인별 정보 가져오기
		/*
		var sql = 'SELECT c.sName buildname,a.sFloorID floor,a.sRoomID roomnum,a.sName roomname,b.sType type,b.sItemNumber itemnum,b.sList list,b.sMaker maker, ';
		sql += 'b.sModel model,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public,b.sStatus status ';
		sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d,tblUser e ';
		sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx ';
		sql += 'AND d.nMasterIdx=e.nIndex AND e.sNumber=? ';
		*/
		//var user_idx = req.session.user.userid;
		var user_idx = req.session.user.userid;
		//var user_idx = 112563;

		if (req.query.nstart) {
			user_idx = req.query.idx;
		}

		//var sql = "SELECT * FROM tblUserItem WHERE sCode=?"
		var sql = "SELECT * FROM tblFixture WHERE sUserNo=? ";
		var res_pers = await directQuery(sql, [user_idx]);

		const curr_date = new Date();
		// Excel 생성
		const workbook = new exceljs.Workbook();
		// 생성자/날짜 생성
		workbook.creator = 'kounosoft';
		workbook.created = curr_date;
		workbook.modified = curr_date;
		// 파일이름 생성(날짜시간 포함)
		var month = curr_date.getMonth() + 1;
		var day = curr_date.getDate();
		var hour = curr_date.getHours();
		var min = curr_date.getMinutes();
		var sec = curr_date.getSeconds();
		month = (month < 10 ? '0' : '') + month;
		day = (day < 10 ? '0' : '') + day;
		hour = (hour < 10 ? '0' : '') + hour;
		min = (min < 10 ? '0' : '') + min;
		sec = (sec < 10 ? '0' : '') + sec;
		const filename = 'personal_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// Sheet 생성
		const sheetOne = workbook.addWorksheet('Sheet One');
		// 헤더 꾸미기
		sheetOne.columns = [
			{ header: '건물명', key: 'build', width: 20 },
			{ header: '층', key: 'floor', width: 10 },
			{ header: '호실번호', key: 'roomnum', width: 10 },
			{ header: '호실명', key: 'room', width: 10 },
			{ header: '구분', key: 'category', width: 20 },
			{ header: '물품번호', key: 'itemnum', width: 20 },
			{ header: '물품명', key: 'device', width: 20 },
			{ header: '모델명(제조사)', key: 'model', width: 45 },
			{ header: '소속부서', key: 'organi', width: 10 },
			{ header: '공용/개인', key: 'public', width: 10 },
			{ header: '실별책임자', key: 'master', width: 10 },
			{ header: '물품관리자', key: 'real', width: 10 },
			{ header: '사용자', key: 'user', width: 10 },
			{ header: '상태', key: 'status', width: 10 }
		];
		// 필드값 넣기
		for (i = 0; i < res_pers.length; i++) {
			var rows = {};
			rows['build'] = res_pers[i].sBuild;
			rows['floor'] = res_pers[i].sFloor;
			rows['roomnum'] = res_pers[i].sRoomNo;
			rows['room'] = res_pers[i].sRoom;
			rows['category'] = res_pers[i].sFixtureType;
			rows['itemnum'] = res_pers[i].sFixtureNo;
			rows['device'] = res_pers[i].sFixtureName;
			rows['model'] = res_pers[i].sFixtureModel + "(" + res_pers[i].sFixtureMaker + ")";
			rows['organi'] = res_pers[i].sUserOrg;
			rows['public'] = '개인';
			rows['master'] = res_pers[i].sName;
			rows['real'] = '';
			rows['user'] = '';
			rows['status'] = res_pers[i].sRuStatus;
			/*
			rows ['build']    = res_pers [i].buildname;
			rows ['floor']    = res_pers [i].floor;
			rows ['roomnum']  = res_pers [i].roomnum;
			rows ['room']     = res_pers [i].roomname;
			rows ['category'] = res_pers [i].type;
			rows ['itemnum']  = res_pers [i].itemnum;
			rows ['list']     = res_pers [i].list;
			rows ['maker']    = res_pers [i].maker;
			rows ['model']    = res_pers [i].model;
			rows ['organi']   = res_pers [i].org_name;
			rows ['public']   = res_pers [i].public == '0' ? '공동' : '개인';
			rows ['master']   = res_pers [i].master_name;
			rows ['real']     = res_pers [i].real_name;
			rows ['user']     = res_pers [i].user_name;
			rows ['status']   = res_pers [i].status;
			*/
			sheetOne.addRow(rows);
		}
		sheetOne.getRow(1).alignment = {
			vertical: 'middle',
			horizontal: 'center',
			wrapText: true
		}
		sheetOne.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFCCCCCC' }
		}
		// 다운로드
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
		workbook.xlsx.write(res).then(function (res_pers) {
			res.end();
		});
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

app.get('/public', async function (req, res) {
	var nstart = 0;
	var ssearch = 0;
	var sname = '';

	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUser='' or sUser='공동사용' AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUser='' or sUser='공동사용' AND sFixtureStatus='사용' ";

	var res_total = await directQuery(tsql);
	var total = res_total[0].tot;

	sql += 'LIMIT 10;';
	var rinfos = await directQuery(sql);
	//var total = rinfos.length;

	console.log("total", total);

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));

	console.log("start_page", start_page);
	console.log("end_page", end_page);

	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	res.render("sub_public", { page_data: page_data, rinfos: rinfos, ssearch: ssearch, sname: sname });
});

app.post('/public_page', async function (req, res) {

	var nstart = 0;
	var ssearch = 0;
	var sname = '';

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	var sql = '';
	tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUser='' or sUser='공동사용' AND sFixtureStatus='사용' ";
	sql = "SELECT * FROM tblFixture WHERE sUser='' or sUser='공동사용' AND sFixtureStatus='사용' ";
	var res_total = await directQuery(tsql);
	var total = res_total[0].tot;

	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [Number(nstart * 10)]);
	//var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));

	console.log("start_page", start_page);
	console.log("end_page", end_page);

	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	res.send({ page_data: page_data, rinfos: rinfos, ssearch: ssearch, sname: sname });

});

app.post('/public_search', async function (req, res) {
	console.log('app.post /public_search');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;
	var nstart = 0;

	console.log("sname", sname);

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	var sql = '';
	sql = "SELECT * FROM tblFixture WHERE sUser='' or sUser='공동사용' AND sFixtureStatus='사용' ";

	var qsname = "%" + sname + "%";
	switch (parseInt(ssearch)) {
		case 1: sql += 'AND sFixtureType LIKE ? '; break; // 구분
		case 2: sql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 3: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 4: sql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 5: sql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 6: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
	}

	var res_total = await directQuery(sql, [qsname]);
	var total = res_total.length;

	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [qsname, Number(nstart * 10)]);
	//var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));

	console.log("start_page", start_page);
	console.log("end_page", end_page);

	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	res.send({ page_data: page_data, rinfos: rinfos, ssearch: ssearch, sname: sname });
});

/*
 * 고장정검 엑셀 다운로드
 */
app.get('/status_download', async function (req, res) {
	try {
		console.log('app.get /status_download');
		if (req.session.user == undefined) {
			res.render('index.html');
			return;
		}

		var sql = 'SELECT date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,a.sUserName user_name,b.sName build_name,c.sName room_name,';
		sql += 'a.sTitle title,a.sMemo memo,a.nMode mode, a.nDivision division ';
		sql += 'FROM tblRepair a,tblBuild b,tblBuild c ';
		sql += 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex ';
		var res_stat = await directQuery(sql);

		const curr_date = new Date();
		// Excel 생성
		const workbook = new exceljs.Workbook();
		// 생성자/날짜 생성
		workbook.creator = 'kounosoft';
		workbook.created = curr_date;
		workbook.modified = curr_date;
		// 파일이름 생성(날짜시간 포함)
		var month = curr_date.getMonth() + 1;
		var day = curr_date.getDate();
		var hour = curr_date.getHours();
		var min = curr_date.getMinutes();
		var sec = curr_date.getSeconds();
		month = (month < 10 ? '0' : '') + month;
		day = (day < 10 ? '0' : '') + day;
		hour = (hour < 10 ? '0' : '') + hour;
		min = (min < 10 ? '0' : '') + min;
		sec = (sec < 10 ? '0' : '') + sec;
		const filename = 'status_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// Sheet 생성
		const sheetOne = workbook.addWorksheet('Sheet One');
		// 헤더 꾸미기
		sheetOne.columns = [
			{ header: '신고날짜', key: 'mdate', width: 10 },
			{ header: '작성자', key: 'user', width: 10 },
			{ header: '건물이름', key: 'build', width: 20 },
			{ header: '호실명', key: 'room', width: 10 },
			{ header: '제목', key: 'title', width: 30 },
			{ header: '구분', key: 'division', width: 40 },
			{ header: '내용', key: 'memo', width: 40 },
			{ header: '처리일자', key: 'ddate', width: 10 },
			{ header: '처리결과', key: 'mode', width: 10 },
		];
		// 필드값 넣기
		for (i = 0; i < res_stat.length; i++) {
			var rows = {};
			rows['mdate'] = res_stat[i].make_date;
			rows['user'] = res_stat[i].user_name;
			rows['build'] = res_stat[i].build_name;
			rows['room'] = res_stat[i].room_name;
			rows['title'] = res_stat[i].title;
			rows['division'] = res_stat[i].division;
			rows['memo'] = res_stat[i].memo;
			rows['ddate'] = res_stat[i].done_date;
			rows['mode'] = res_stat[i].mode == 0 ? '신고' : res_stat[i].mode == 1 ? '처리중' : '처리완료';
			sheetOne.addRow(rows);
		}
		sheetOne.getRow(1).alignment = {
			vertical: 'middle',
			horizontal: 'center',
			wrapText: true
		}
		sheetOne.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFCCCCCC' }
		}
		// 다운로드
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
		workbook.xlsx.write(res).then(function (res_stat) {
			res.end();
		});
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

app.get('/personalCheck', async function (req, res) {

	console.log('app.get /personal_check');

	var ssearch = 0;
	var sname = '';

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}

	//console.log(req.session.user.userid);
	var user_idx = req.session.user.userid;
	//var user_idx = 112563;

	// 개인별 정보 가져오기
	/*
	var sql = 'SELECT a.sName roomname,b.nIndex dindex,b.sItemNumber dnum,c.sName buildname,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	sql += 'b.sStatus status,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public ';
	sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d,tblUser e ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx ';
	sql += 'AND d.nMasterIdx=e.nIndex AND e.sNumber=? ';
	*/
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' ";
	var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	//var total = pinfos.length;
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};
	console.log(page_data);

	res.render('sub_personalCheck', { page_data: page_data, pinfos: pinfos, ssearch: ssearch, sname: sname });
});

app.post('/personalCheck_page', async function (req, res) {

	var nstart = 0;
	var ssearch = 0;
	var sname = '';

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	var user_idx = req.session.user.userid;

	console.log("user_idx", user_idx);
	console.log("nstart", nstart);

	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	//var total = pinfos.length;


	console.log("total", total);

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));

	console.log("start_page", start_page);
	console.log("end_page", end_page);

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	res.send({ page_data: page_data, pinfos: pinfos, ssearch: ssearch, sname: sname });

});

app.post('/personalCheck_search', async function (req, res) {
	console.log('app.post /personalCheck_search');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;
	var nstart = 0;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	var user_idx = req.session.user.userid;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	var qsname = "%" + sname + "%";
	/*
	switch (parseInt (ssearch))
	{
		case 1: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 2: sql += 'AND sBuildNo LIKE ? '     ; break; // 건물명(번호로 검색)
		case 3: sql += 'AND sFixtureMaker LIKE ? '     ; break; // 제조사
		case 4: sql += 'AND sFixtureModel LIKE ? '     ; break; // 모델명
		case 5: sql += 'AND sUserOrg LIKE ? '   ; break; // 소속부서
		case 6: sql += 'AND sUserNo=? '; qsname = sname; break; // 관리자(사원번호로 검색)
	}
	*/
	switch (parseInt(ssearch)) {
		case 1: sql += 'AND sBuild LIKE ? '; break; // 건물명
		case 2: sql += 'AND sRoom LIKE ? '; break; // 호실
		case 3: sql += 'AND sFixtureType LIKE ? '; break; // 구분
		case 4: sql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 5: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 6: sql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 7: sql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 8: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: sql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: sql += 'AND dFixtureDate LIKE ? '; break; // 구입일
	}
	//var pinfos = await directQuery (sql, [user_idx, qsname]);
	//var total = pinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	var total = pinfos.length;
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};
	console.log(page_data);

	res.send({ page_data: page_data, pinfos: pinfos, ssearch: ssearch, sname: sname });
});

/*
 * 개인별 연간비품확인
 */
app.post('/personal_check', async function (req, res) {
	try {
		console.log('app.post /personal_check');

		if (req.session.user == undefined) {
			res.render('index.html');
			return;
		}

		console.log(req.body);

		//var data = JSON.parse(req.body.data);

		const curr_date = new Date();
		// Excel 생성
		const workbook = new exceljs.Workbook();
		// 생성자/날짜 생성
		workbook.creator = 'kounosoft';
		workbook.created = curr_date;
		workbook.modified = curr_date;
		// 파일이름 생성(날짜시간 포함)
		var month = curr_date.getMonth() + 1;
		var day = curr_date.getDate();
		var hour = curr_date.getHours();
		var min = curr_date.getMinutes();
		var sec = curr_date.getSeconds();
		month = (month < 10 ? '0' : '') + month;
		day = (day < 10 ? '0' : '') + day;
		hour = (hour < 10 ? '0' : '') + hour;
		min = (min < 10 ? '0' : '') + min;
		sec = (sec < 10 ? '0' : '') + sec;
		const filename = '연간물품실사_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// Sheet 생성
		const sheetOne = workbook.addWorksheet('연간물품실사');
		// 헤더 꾸미기
		/*
		sheetOne.columns = [
			{header: '건물명'    , key: 'build'   , width: 20},
			{header: '층'        , key: 'floor'   , width: 10},
			{header: '호실번호'  , key: 'roomnum' , width: 10},
			{header: '호실명'    , key: 'room'    , width: 10},
			{header: '구분'      , key: 'category', width: 20},
			{header: '물품번호'  , key: 'itemnum' , width: 20},
			{header: '물품명'    , key: 'itemname', width: 20},
			{header: '제조사'    , key: 'maker'   , width: 20},
			{header: '모델명'    , key: 'model'   , width: 20},
			{header: '소속부서'  , key: 'organi'  , width: 10},
			{header: '공용/개인' , key: 'public'  , width: 10},
			{header: '실별책임자', key: 'master'  , width: 10},
			{header: '물품관리자', key: 'real'    , width: 10},
			{header: '사용자'    , key: 'user'    , width: 10},
			{header: '상태'      , key: 'status'  , width: 10}
		];
		*/
		sheetOne.columns = [
			{ header: '실사완료일', key: 'ru_done_day', width: 20 },
			{ header: '실사자', key: 'ru_user', width: 20 },
			{ header: '실사진행상태', key: 'ru_status', width: 20 },
			{ header: '실사완료상태', key: 'ru_done', width: 20 },
			{ header: '소속부서', key: 'organi', width: 20 },
			{ header: '사용자', key: 'master', width: 20 },
			{ header: '사용부서', key: 'real_organi', width: 20 },
			{ header: '물품번호', key: 'item_num', width: 20 },
			{ header: '물품구분', key: 'category', width: 20 },
			{ header: '물품명', key: 'item_name', width: 20 },
			{ header: '모델명(제조사)', key: 'maker', width: 45 },
			{ header: '취득일자', key: 'ddate', width: 20 },
			{ header: '취득금액', key: 'bill', width: 20 },
			{ header: '현재캠퍼스', key: 'campus', width: 20 },
			{ header: '현재건물', key: 'build', width: 20 },
			{ header: '현재층', key: 'floor', width: 20 },
			{ header: '현재호실', key: 'roomnum', width: 20 },
			{ header: '변동구분', key: 'var_class', width: 20 },
			{ header: '전자결재문서번호', key: 'epdn', width: 20 }
		];
		//console.log(req.body.chk_btn[0]);
		if (req.body.chk_btn) {
			for (var i = 0; i < req.body.chk_btn.length; i++) {
				// 개인별 정보 가져오기
				//var sql = "SELECT * FROM tblUserItem WHERE sItemNo=?";
				var sql = "SELECT * FROM tblFixture WHERE sFixtureNo=? ";
				/*
				var sql = 'SELECT c.sName buildname,a.sFloorID floor,a.sRoomID roomnum,a.sName roomname,b.sType category,b.sItemNumber item_num,b.sList item_name,b.sMaker maker, ';
				sql += 'b.sModel model,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public,b.sStatus status, ';
				sql += 'b.dLocation ddate '
				sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d,tblUser e ';
				sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx ';
				sql += 'AND d.nMasterIdx=e.nIndex AND b.nIndex=? ';
				*/
				var res_pers = await directQuery(sql, [req.body.chk_btn[i]]);
				// 필드값 넣기
				var rows = {};
				rows['ru_done_day'] = res_pers[0].sRuDoneDay;
				rows['ru_user'] = res_pers[0].sRuUser;
				rows['ru_status'] = res_pers[0].sRuStatus;
				rows['ru_done'] = res_pers[0].sRuDone;
				rows['organi'] = res_pers[0].sOrgName;
				rows['master'] = res_pers[0].sName;
				rows['real_organi'] = res_pers[0].sUserOrg;
				rows['item_num'] = res_pers[0].sFixtureNo;
				rows['category'] = res_pers[0].sFixtureType;
				rows['item_name'] = res_pers[0].sFixtureName;
				rows['maker'] = res_pers[0].sFixtureModel + "(" + res_pers[0].sFixtureMaker + ")";
				rows['ddate'] = res_pers[0].dFixtureDate.substring(0, 10);
				rows['bill'] = res_pers[0].sFixturePrice;
				rows['campus'] = '서울캠퍼스';
				rows['build'] = res_pers[0].sBuild;
				rows['floor'] = res_pers[0].sFloor;
				rows['roomnum'] = res_pers[0].sRoom;
				rows['var_class'] = res_pers[0].sFixtureClass;
				rows['epdn'] = res_pers[0].sEPDN;
				/*
				rows ['ru_done_day'] = '';
				rows ['ru_user']     = '';
				rows ['ru_status']   = 'N';
				rows ['ru_done']     = '미완료';
				rows ['organi']      = res_pers[0].org_name;
				rows ['master']      = res_pers[0].master_name;
				rows ['real_organi'] = '';
				rows ['item_num']    = res_pers[0].item_num;
				rows ['category']    = res_pers[0].category;
				rows ['item_name']   = res_pers[0].item_name;
				rows ['maker']       = res_pers[0].maker;
				rows ['type']        = res_pers[0].model;
				rows ['ddate']       = res_pers[0].ddate.substring(0, 10);
				rows ['bill']        = '';
				rows ['campus']      = '서울캠퍼스';
				rows ['build']       = res_pers[0].buildname;
				rows ['floor']       = res_pers[0].floor;
				rows ['roomnum']     = res_pers[0].roomname;
				rows ['var_class']   = '';
				rows ['epdn']        = '';
				*/
				sheetOne.addRow(rows);
			}
			// 헤더 정렬 변경
			sheetOne.getRow(1).alignment = {
				vertical: 'middle',
				horizontal: 'center',
				wrapText: true
			}
			// 헤더 배경 변경
			sheetOne.getRow(1).fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFCCCCCC' }
			}
		}
		// 다운로드
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
		console.log('process download');
		workbook.xlsx.write(res).then(function (res_pers) {
			res.end();
		});
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

app.get('/takeover', async function (req, res) {

	console.log('app.get /takeover');

	var ssearch = 0;
	var sname = '';

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}
	var user_idx = req.session.user.userid;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	/*
	var sql = 'SELECT a.sName roomname,b.nIndex dindex,b.sItemNumber dnum,c.sName buildname,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	sql += 'b.sStatus status,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public ';
	sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d,tblUser e ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx ';
	sql += 'AND d.nMasterIdx=e.nIndex AND e.sNumber=? ';
	*/
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	//var total = pinfos.length;
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};
	console.log(page_data);

	res.render('sub_takeover', { page_data: page_data, pinfos: pinfos, ssearch: ssearch, sname: sname });
});

app.post('/takeover_page', async function (req, res) {

	var nstart = 0;
	var ssearch = 0;
	var sname = '';

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	var user_idx = req.session.user.userid;

	console.log("user_idx", user_idx);
	console.log("nstart", nstart);

	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	//var total = pinfos.length;


	console.log("total", total);

	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));

	console.log("start_page", start_page);
	console.log("end_page", end_page);

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	res.send({ page_data: page_data, pinfos: pinfos, ssearch: ssearch, sname: sname });

});

app.post('/takeover_search', async function (req, res) {
	console.log('app.post /takeover_search');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;
	var nstart = 0;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	var user_idx = req.session.user.userid;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	var qsname = "%" + sname + "%";
	/*
	switch (parseInt (ssearch))
	{
		case 1: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 2: sql += 'AND sBuildNo LIKE ? '     ; break; // 건물명(번호로 검색)
		case 3: sql += 'AND sFixtureMaker LIKE ? '     ; break; // 제조사
		case 4: sql += 'AND sFixtureModel LIKE ? '     ; break; // 모델명
		case 5: sql += 'AND sUserOrg LIKE ? '   ; break; // 소속부서
		case 6: sql += 'AND sUserNo=? '; qsname = sname; break; // 관리자(사원번호로 검색)
	}
	*/
	switch (parseInt(ssearch)) {
		case 1: sql += 'AND sBuild LIKE ? '; break; // 건물명
		case 2: sql += 'AND sRoom LIKE ? '; break; // 호실
		case 3: sql += 'AND sFixtureType LIKE ? '; break; // 구분
		case 4: sql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 5: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 6: sql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 7: sql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 8: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: sql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: sql += 'AND dFixtureDate LIKE ? '; break; // 구입일
	}
	var rinfos = await directQuery(sql, [user_idx, qsname]);
	var total = rinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	//var total = pinfos.length;
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};
	console.log(page_data);

	res.send({ page_data: page_data, pinfos: pinfos, ssearch: ssearch, sname: sname });
});

/*
 * 개인별 인수인계
 */
app.post('/personal_takeover', async function (req, res) {
	try {
		console.log('app.post /personal_takeover');
		if (req.session.user == undefined) {
			res.render('index.html');
			return;
		}

		const curr_date = new Date();
		// Excel 생성
		const workbook = new exceljs.Workbook();
		// 생성자/날짜 생성
		workbook.creator = 'kounosoft';
		workbook.created = curr_date;
		workbook.modified = curr_date;
		// 파일이름 생성(날짜시간 포함)
		var month = curr_date.getMonth() + 1;
		var day = curr_date.getDate();
		var hour = curr_date.getHours();
		var min = curr_date.getMinutes();
		var sec = curr_date.getSeconds();
		month = (month < 10 ? '0' : '') + month;
		day = (day < 10 ? '0' : '') + day;
		hour = (hour < 10 ? '0' : '') + hour;
		min = (min < 10 ? '0' : '') + min;
		sec = (sec < 10 ? '0' : '') + sec;
		const filename = '개인별인수인계_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// Sheet 생성
		const sheetOne = workbook.addWorksheet('개인별인수인계');
		// 헤더 꾸미기
		sheetOne.columns = [
			{ header: '건물명', key: 'build', width: 20 },
			{ header: '층', key: 'floor', width: 10 },
			{ header: '호실번호', key: 'roomnum', width: 10 },
			{ header: '호실명', key: 'room', width: 10 },
			{ header: '구분', key: 'category', width: 20 },
			{ header: '물품번호', key: 'itemnum', width: 20 },
			{ header: '물품명', key: 'device', width: 20 },
			{ header: '모델명(제조사)', key: 'model', width: 45 },
			{ header: '소속부서', key: 'organi', width: 10 },
			{ header: '공용/개인', key: 'public', width: 10 },
			{ header: '실별책임자', key: 'master', width: 10 },
			{ header: '물품관리자', key: 'real', width: 10 },
			{ header: '사용자', key: 'user', width: 10 },
			{ header: '상태', key: 'status', width: 10 }
		];
		if (req.body.chk_btn) {
			for (var i = 0; i < req.body.chk_btn.length; i++) {
				console.log('check: ' + req.body.chk_btn[i]);
				// 개인별 정보 가져오기
				//var sql = "SELECT * FROM tblUserItem WHERE sItemNo=?";
				var sql = "SELECT * FROM tblFixture WHERE sFixtureNo=? ";
				/*
				var sql = 'SELECT c.sName buildname,a.sFloorID floor,a.sRoomID roomnum,a.sName roomname,b.sType type,b.sItemNumber itemnum,b.sList list,b.sMaker maker, ';
				sql += 'b.sModel model,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public,b.sStatus status ';
				sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d,tblUser e ';
				sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx ';
				sql += 'AND d.nMasterIdx=e.nIndex AND b.nIndex=? ';
				*/
				var res_pers = await directQuery(sql, [req.body.chk_btn[i]]);
				// 필드값 넣기
				var rows = {};
				rows['build'] = res_pers[0].sBuild;
				rows['floor'] = res_pers[0].sFloor;
				rows['roomnum'] = res_pers[0].sRoomNo;
				rows['room'] = res_pers[0].sRoom;
				rows['category'] = res_pers[0].sFixtureType;
				rows['itemnum'] = res_pers[0].sFixtureNo;
				rows['device'] = res_pers[0].sFixtureName;
				rows['model'] = res_pers[0].sFixtureModel + "(" + res_pers[0].sFixtureMaker + ")";
				rows['organi'] = res_pers[0].sUserOrg;
				rows['public'] = '개인';
				rows['master'] = res_pers[0].sName;
				rows['real'] = res_pers[0].sRuUser;
				rows['user'] = res_pers[0].sUser;
				rows['status'] = res_pers[0].sRuStatus;
				/*
				rows ['build']    = res_pers [0].buildname;
				rows ['floor']    = res_pers [0].floor;
				rows ['roomnum']  = res_pers [0].roomnum;
				rows ['room']     = res_pers [0].roomname;
				rows ['category'] = res_pers [0].type;
				rows ['itemnum']  = res_pers [0].itemnum;
				rows ['list']     = res_pers [0].list;
				rows ['maker']    = res_pers [0].maker;
				rows ['model']    = res_pers [0].model;
				rows ['organi']   = res_pers [0].org_name;
				rows ['public']   = res_pers [0].public == '0' ? '공동' : '개인';
				rows ['master']   = res_pers [0].master_name;
				rows ['real']     = res_pers [0].real_name;
				rows ['user']     = res_pers [0].user_name;
				rows ['status']   = res_pers [0].status;
				*/
				sheetOne.addRow(rows);
			}
			sheetOne.getRow(1).alignment = {
				vertical: 'middle',
				horizontal: 'center',
				wrapText: true
			}
			sheetOne.getRow(1).fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFCCCCCC' }
			}
		}
		// 다운로드
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
		workbook.xlsx.write(res).then(function (res_pers) {
			res.end();
		});
		//window.close ();
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

app.get('/status', async function (req, res) {

	console.log('app.get /status');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}
	var sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';
	sql += 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex ';
	var res_total = await directQuery(sql);
	var total = res_total.length;
	sql += 'ORDER BY a.dMakeDate LIMIT 10 OFFSET ?;';
	var rlists = await directQuery(sql, [Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';
	sql += 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=1 ';
	sql += 'ORDER BY a.dMakeDate LIMIT 10 OFFSET ?;';
	var rlists_elec = await directQuery(sql, [Number(nstart * 10)]);

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';
	sql += 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=2 ';
	sql += 'ORDER BY a.dMakeDate LIMIT 10 OFFSET ?;';
	var rlists_pro = await directQuery(sql, [Number(nstart * 10)]);

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';
	sql += 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=3 ';
	sql += 'ORDER BY a.dMakeDate LIMIT 10 OFFSET ?;';
	var rlists_fix = await directQuery(sql, [Number(nstart * 10)]);

	res.render('sub_status', { page_data: page_data, rlists: rlists, rlists_elec: rlists_elec, rlists_pro: rlists_pro, rlists_fix: rlists_fix, req_name: req.session.user.name });
});

/*
 * 수리요청 처리
 */
app.post('/api/status', async function (req, res) {
	console.log('app.post /api/status');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	var data = JSON.parse(req.body.data);
	// console.log ('data: ' + JSON.stringify (data));
	var userid = data.userid;

	//console.log("repairImg",data.repairImg);
	//console.log("repairImgBin",data.repairImgBin);

	var sql = 'SELECT * FROM tblUser WHERE sNumber=?;';
	var ret = await directQuery(sql, [userid]);
	// console.log ('ret: ' + ret);
	var useridx = ret[0].nIndex;
	sql = 'INSERT INTO tblRepair(nUserIdx,sUserName,nBuildIdx,nRoomIdx,sTitle,sMemo,nDivision,sClass,dMakeDate) ';
	sql += 'VALUES(?,?,?,?,?,?,?,?,NOW());';
	ret = await directQuery(sql, [useridx, data.name, data.build, data.room, data.title, data.memo, data.division, data.class]);

	//console.log("insertId",ret.insertId);

	var repairIdx = ret.insertId;

	for (var i = 0; i < data.repairImg.length; i++) {
		sql = 'INSERT INTO tblRepairImg(nRepairIdx,sImgPath,sImgBin) ';
		sql += 'VALUES(?,?,?);';

		ret = await directQuery(sql, [repairIdx, data.repairImg[i], data.repairImgBin[i]]);
	}

	var result = '저장되었습니다.';
	if (!ret.affectedRows) {
		result = '저장하지 못했습니다.\n관리자에게 문의해주세요.';
	}

	res.send({ result: result });
});

app.post('/getRepairImg', async function (req, res) {
	console.log('app.post /getRepairImg');

	console.log(req.body.data.idx);

	var idx = req.body.data.idx;

	var sql = 'SELECT nRepairIdx idx, sImgPath path, sImgBin bin ';
	sql += 'FROM tblRepairImg ';
	sql += 'WHERE nRepairIdx=?';

	var result = await directQuery(sql, [idx]);

	res.send({ result: result });
});

app.get('/login', function (req, res) {

	//res.render("login");

	// req.session.user = {
	// 			code: 0,
	// 			msg: '',
	// 			name: '',
	// 			userid: '',
	// 			class: '',
	// 			email: '',
	// 			tel: ''
	// };
	console.log('로그인 세션', req.session.user)
	if (req.session.user != undefined) {

		if (req.session.user.userid === 'guest') {
			req.session.user = {
				code: 0,
				msg: '',
				name: '',
				userid: '',
				class: '',
				email: '',
				tel: ''
			};

		}

		if (req.session.user.userid != null && req.session.user.userid != '') {
			res.redirect("home");
		}
		else {
			res.render("login");
		}
	}
	else {
		res.render("login");
	}
});

app.post('/signup', async function (req, res) {
	console.log('app.post /signup');

	console.log("req.body", req.body);

	var userid = req.body.userid;
	var userpw = bcrypt.hashSync(req.body.userpw, null, null);
	var name = req.body.name;
	var mobile = req.body.mobile;
	var email = req.body.email;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "INSERT INTO carbonKU.KUUser ( userid, password, name, mobile, email) values (?,?,?,?,?)";

		connection.query(query, [userid, userpw, name, mobile, email], (error, response) => {
			//var obj = JSON.parse(JSON.stringify(response));
			console.log("error", error);
			console.log("response", response);

			//console.log("obj", obj);
			res.send({ sucess: true, userid: userid, usernm: name });
		});
	});
});

app.post('/getLoginSession', function (req, res) {
	res.send({ userid: req.session.user.userid, usernm: req.session.user.name, code: req.session.error.code, msg: req.session.error.msg });
});

app.get('/getUserInfo', function (req, res) {
	/*
	var user_name = "";

	if (req.query.user_name)
	{
		user_name = req.query.user_name;
	}
	*/

	res.send({ userid: req.session.user.userid, usernm: req.session.user.name });
});

app.post('/login_old', async function (req, res) {
	console.log('app.post /login');

	var userid = req.body.userid;
	var userpw = req.body.userpw;
	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "select * from KUUser where userid = ?";

		connection.query(query, [userid], (error, response) => {
			//var obj = JSON.parse(JSON.stringify(response));

			console.log("error", error);
			console.log("response", response);

			if (response.count == 0) {
				res.send({ sucess: false, errCode: 1 })
			}
			else {
				var compare = bcrypt.compareSync(userpw, response[0].password);

				if (compare == true) {
					req.session.userid = response[0].userid;
					req.session.usernm = response[0].name;

					//console.log("obj", obj);
					res.redirect("home");
				}
				else {
					res.redirect("login");
				}
			}


		});
	});

});

/*
 * SSO 로그인 확인
 */
app.post('/login', async function (req, res) {
	var userid = req.body.userid;
	var userpw = req.body.userpw;
	//var cb1 = req.body.cb1;
	console.log('id/pw : ', userid, userpw);
	//console.log ('body : ', req.body);

	if (req.session.user && req.session.user.userid != '') {
		// 이미 로그인된 상태
		console.log('이미 로그인된 상태');
		var json = {};
		json.code = req.session.user.code;
		json.msg = req.session.user.msg;
		json.data = { 'name': req.session.user.name, 'id': req.session.user.userid };
		res.redirect("home");
		req.session.error = {
			code: 0,
			msg: ''
		};

		let url = "http://cafm.korea.ac.kr/archibus/archi_cookie.jsp";

		axios.get(url).then((Response) => {
			//console.log("Response",Response);
			res.redirect("home");
		}).catch((Error) => {
			console.log(Error);
			ret = Error;
		});

		return;
	}

	/*
	if (userid == 'Test1' && userpw == '123456')
	{
		var json = {};
		json.code = 0;
		json.msg = '';
		json.data = {'name': '테스트1', 'id': 'Test1'};
		req.session.user = {
			code: 0,
			msg: '',
			name: '테스트1',
			userid: 'Test1',
			class: '총무부',
			email: 'Test1@gmail.com',
			tel: '010-1111-2232'
		};
		req.session.error = {
			code : 0,
			msg : ''
		};
		console.log (req.session.user);
		res.redirect("home");
		return;
	}
	else if (userid == '1111' && userpw == '1111')
	{
		var json = {};
		json.code = 0;
		json.msg = '';
		json.data = {'name': '홍길동', 'id': '210597'};
		req.session.user = {
			code: 0,
			msg: '',
			name: '홍길동',
			userid: '210597',
			class: '총무부',
			email: 'kbw5636@kounosoft.com',
			tel: '010-9318-5636'
		};
		req.session.error = {
			code : 0,
			msg : ''
		};
		console.log (req.session.user);
		res.redirect("home");
		return;
	}
	*/

	// POST 직접호출방법
	var form = {
		//id: encodeURIComponent (userid),
		//pw: encodeURIComponent (userpw),
		id: userid,
		pw: userpw,
		returnURL: 'avclass.korea.ac.kr'
	};
	// form에 맞춰 데이터를 만든다
	var formData = querystring.stringify(form);
	var contentLength = formData.length;
	const params = {
		headers: {
			'Content-Length': contentLength,
			'Content-Type': 'application/x-www-form-urlencoded',
			'charset': 'utf-8'
		},
		uri: 'https://auth.korea.ac.kr/directLoginNew.jsp',
		method: 'POST',
		body: formData
	}
	//console.log ({ params });
	// id/pw를 검증하는 uri을 호출한다.(SSO)
	request(params, async function (error, response, body) {
		var json = {};
		if (!error && response.statusCode == 200) {
			//console.log ({ body });
			var $ = cheerio.load(body);
			var sYN = $("input[type=hidden][name=sYN]").val();
			var sWHY = $("input[type=hidden][name=sWHY]").val();
			var msg = $("input[type=hidden][name=msg]").val();
			msg = msg.replace(/\n/g, '');
			console.log("sYN: " + sYN);
			console.log("sWHY: " + sWHY);
			console.log("msg: " + msg);
			// if (body.sYN == 'Y')
			if (sYN == 'Y') {
				//console.log("jarFilePath",jarFilePath);

				java.classpath.push(jarFilePath);
				var progInstance = java.import('DecodeEncryptor168');
				var decrypt = progInstance.getDecryptedValueSync(msg);
				// var decrypt = progInstance.getDecryptedValueSync (body.msg);
				// var instance = new progInstance ();
				// var decrypt = instance.getDecryptedValueSync (msg);
				//console.log ({ decrypt });

				var datas = decrypt.split("&");
				for (var i = 0; i < datas.length; i++) {
					var key_data = datas[i].split("=");
					//console.log ({ key_data });
					if (key_data[0] == "sStdId") {
						//console.log ({ key_data });
						sStdId = key_data[1];
					}
					else if (key_data[0] == "sNAME") {
						sName = key_data[1];
					}
					else if (key_data[0] == "sDeptNm") {
						sDeptNm = key_data[1];
						//console.log ({ key_data });
					}
				}

				if (userid == 'atdtest02') {
					json.code = 0;
					json.msg = '';
					json.data = { 'name': sName, 'id': sStdId };

					req.session.user = {
						code: 0,
						msg: '',
						name: sName,
						userid: '210597',
						class: '총무부',
						email: 'kbw5636@kounosoft.com',
						tel: '010-9318-5636'
					};
					console.log('테스트 아이디 입력 확인')

					/*
					if(cb1 == 'on')	{
						localStorage.setItem('login', true);
						localStorage.setItem('msg', '');
						localStorage.setItem('name', sName);
						localStorage.setItem('userid', '210597');
						localStorage.setItem('class', '총무부');
						localStorage.setItem('email', 'kbw5636@kounosoft.com');
						localStorage.setItem('tel', '010-9318-5636');
					}
					else {
						localStorage.setItem('login', false);
					}
					*/
				}
				else {
					// 대분류 리스트
					sql = 'SELECT distinct(b.sOrgName) org, a.sEmail email, a.sTel tel, a.nPermission permission ';
					sql += 'FROM tblUser a,tblRelation b ';
					sql += 'WHERE a.sNumber=? and a.nIndex=b.nMasterIdx';
					res_org = await directQuery(sql, [sStdId]);

					//console.log("permission", res_org[0].permission);

					if (res_org[0].org == "") {
						res_org[0].org = sDeptNm;
					}

					json.code = 0;
					json.msg = '';
					json.data = { 'name': sName, 'id': sStdId };
					req.session.user = {
						code: 0,
						msg: '',
						name: sName,
						userid: sStdId,
						class: res_org[0].org,
						email: res_org[0].email,
						tel: res_org[0].tel
					}
					req.session.error = {
						code: 0,
						msg: ''
					};

					/*
					if(cb1 == 'on')	{
						localStorage.setItem('login', true);
						localStorage.setItem('msg', '');
						localStorage.setItem('name', sName);
						localStorage.setItem('userid', sStdId);
						localStorage.setItem('class', res_org[0].org);
						localStorage.setItem('email', res_org[0].email);
						localStorage.setItem('tel', res_org[0].tel);
					}
					else {
						localStorage.setItem('login', false);
					}
					*/
				}

				//res.send (json);
				console.log('로그인 시도시 세션', req.session)
				console.log('로그인 시도시 res', res)
				res.redirect("home");
				return;
			}
			else {
				json.code = 100;
				//json.msg = body;
				json.msg = 'ID/PW를 확인하세요.';
				json.data = {};
				req.session.error = {
					code: 100,
					msg: 'ID/PW를 확인하세요.'
				}
				res.redirect("login");
			}
		}
		else {
			json.code = 100;
			json.msg = '잘못된 접근방법입니다.';
			//json.msg = body;
			json.data = {};
			req.session.error = {
				code: 100,
				msg: '잘못된 접근방법입니다.'
			}
			res.redirect("login");
		}
		res.send(json);
	});
});

app.post('/logout', function (req, res) {
	console.log("logout");

	req.session.user = {
		code: 0,
		msg: '',
		name: '',
		userid: '',
		class: '',
		email: '',
		tel: ''
	};

	/*
	localStorage.setItem('login', false);
	localStorage.setItem('msg', '');
	localStorage.setItem('name', '');
	localStorage.setItem('userid', '');
	localStorage.setItem('class', '');
	localStorage.setItem('email', '');
	localStorage.setItem('tel', '');
	*/

	let url = "http://cafm.korea.ac.kr/archibus/archi_out.jsp";
	console.log('get_cookie: ' + url);

	axios.get(url).then((Response) => {
		//console.log (Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})

	res.redirect("login");
	//return;
});

app.post('/getCo2Data', function (req, res) {
	var json = {
		thisMon: 34547,
		prevMon: 15326,
		thisYear: 34547,
		prevYear: 15326
	}

	res.send(json);
});

app.post('/getKUPlace', async function (req, res) {

	var ku_year = req.body.year;
	var ku_kind = req.body.kind;
	var kind_ELEC = 'ELEC';
	var kind_FEE_ELEC = 'FEE_ELEC';
	var kind_WATER = 'WATER';
	var kind_FEE_WATER = 'FEE_WATER';
	var kind_GAS = 'GAS';
	var kind_FEE_GAS = 'FEE_GAS';
	var kind_FEE_MONTH = 'FEE_MONTH';
	var kind_TOE = 'TOE';
	var kind_TCO2 = 'TCO2';

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query_new = "select id,DIVISION,BLD,YEAR_SUM from Data_KU where YEAR = ? and KIND = ?";


		connection.query(query_new, [ku_year, ku_kind], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			res.send({ list_data: obj });
		});

	});
});

app.post('/getKUDashboard', async function (req, res) {

	var ku_year = req.body.year;
	var ku_select = "B_TCO2";//req.body.select;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "select * from Data_KU where BID = ?";
		let query2 = "select * from carbon_month where YEAR = ?";

		connection.query(query, [ku_select], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			connection.query(query2, [ku_year, ku_select], (error, response) => {
				var obj2 = JSON.parse(JSON.stringify(response));

				res.send({ list_data: obj, list_data2: obj2 });
			});


		});
	});
});

app.post('/getCO2Data', async function (req, res) {

	var ku_year_now = 2022;
	var ku_year_prev = 2021;
	var ku_select = "B_TCO2";

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query2 = "select MAR from Data_KU where YEAR = ? and BID = ?";

		connection.query(query2, [ku_year_now, ku_select], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			connection.query(query2, [ku_year_prev, ku_select], (error, response) => {
				//console.log("obj", obj);
				var obj2 = JSON.parse(JSON.stringify(response));

				res.send({ list_data: obj, list_data2: obj2 });
			});


		});
	});
});

app.post('/getLoginData', async function (req, res) {
	res.send({ user: req.session.userid });
});

app.post('/getKUBuildDash', async function (req, res) {

	var ku_year = req.body.year;
	var ku_bid = req.body.bid;
	var ku_kind = req.body.kind;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "select * from Data_KU where BID = ? and KIND = ?";
		let query2 = "select * from Data_KU where YEAR = ? and BID = ? and KIND = ?";

		connection.query(query, [ku_bid, ku_kind], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			connection.query(query2, [ku_year, ku_bid, ku_kind], (error, response) => {
				//console.log("obj", obj);
				var obj2 = JSON.parse(JSON.stringify(response));

				res.send({ list_data: obj, list_data2: obj2 });
			});


		});
	});
});

app.post('/getKUData', async function (req, res) {

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "select * from Data_KU";

		connection.query(query, (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			res.send({ list_data: obj });
		});
	});
});

app.post('/getKUFuel', async function (req, res) {

	var ku_year = req.body.year;
	var select_ELEC = 'B_ELEC';
	var select_WATER = 'B_WATER';
	var select_GAS = 'B_GAS';

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query_new = "select * from Data_KU where BID = ?";
		let query_new2 = "select * from Data_KU where YEAR = ? and BID = ?";

		connection.query(query_new, [select_ELEC], (error, response) => {
			console.log(response)
			var obj = JSON.parse(JSON.stringify(response));

			connection.query(query_new2, [ku_year, select_ELEC], (error, response) => {
				var obj2 = JSON.parse(JSON.stringify(response));

				connection.query(query_new, [select_WATER], (error, response) => {
					var obj3 = JSON.parse(JSON.stringify(response));

					connection.query(query_new2, [ku_year, select_WATER], (error, response) => {
						var obj4 = JSON.parse(JSON.stringify(response));

						connection.query(query_new, [select_GAS], (error, response) => {
							var obj5 = JSON.parse(JSON.stringify(response));

							connection.query(query_new2, [ku_year, select_GAS], (error, response) => {
								var obj6 = JSON.parse(JSON.stringify(response));

								res.send({ list_ELEC: obj, list_YEAR_ELEC: obj2, list_WATER: obj3, list_YEAR_WATER: obj4, list_GAS: obj5, list_YEAR_GAS: obj6 });
							});

						});
					});

				});
			});
		});
	});
});

app.post('/getKUEnergy', async function (req, res) {

	var ku_year = req.body.year;
	var ku_prev = ku_year - 1;
	var ku_two_year_ago = ku_year - 2;
	var ku_three_year_ago = ku_year - 3;
	var select_ELEC = 'B_ELEC';
	var select_WATER = 'B_WATER';
	var select_GAS = 'B_GAS';

	console.log("ku_year", ku_year);

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let sql_query = "select * from Data_KU where YEAR = ? and BID = ?";

		connection.query(sql_query, [ku_year, select_ELEC], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			connection.query(sql_query, [ku_prev, select_ELEC], (error, response) => {
				var obj2 = JSON.parse(JSON.stringify(response));

				connection.query(sql_query, [ku_year, select_WATER], (error, response) => {
					var obj3 = JSON.parse(JSON.stringify(response));

					connection.query(sql_query, [ku_prev, select_WATER], (error, response) => {
						var obj4 = JSON.parse(JSON.stringify(response));

						connection.query(sql_query, [ku_year, select_GAS], (error, response) => {
							var obj5 = JSON.parse(JSON.stringify(response));

							connection.query(sql_query, [ku_prev, select_GAS], (error, response) => {
								var obj6 = JSON.parse(JSON.stringify(response));

								connection.query(sql_query, [ku_two_year_ago, select_ELEC], (error, response) => {
									var obj7 = JSON.parse(JSON.stringify(response));

									connection.query(sql_query, [ku_two_year_ago, select_WATER], (error, response) => {
										var obj8 = JSON.parse(JSON.stringify(response));

										connection.query(sql_query, [ku_two_year_ago, select_GAS], (error, response) => {
											var obj9 = JSON.parse(JSON.stringify(response));

											connection.query(sql_query, [ku_three_year_ago, select_ELEC], (error, response) => {
												var obj10 = JSON.parse(JSON.stringify(response));

												connection.query(sql_query, [ku_three_year_ago, select_WATER], (error, response) => {
													var obj11 = JSON.parse(JSON.stringify(response));

													connection.query(sql_query, [ku_three_year_ago, select_GAS], (error, response) => {
														var obj12 = JSON.parse(JSON.stringify(response));

														res.send({
															list_ELEC: obj,
															list_PREV_ELEC: obj2,
															list_WATER: obj3,
															list_PREV_WATER: obj4,
															list_GAS: obj5,
															list_PREV_GAS: obj6,
															list_TWO_YEAR_AGO_ELEC: obj7,
															list_TWO_YEAR_AGO_WATER: obj8,
															list_TWO_YEAR_AGO_GAS: obj9,
															list_THREE_YEAR_AGO_ELEC: obj10,
															list_THREE_YEAR_AGO_WATER: obj11,
															list_THREE_YEAR_AGO_GAS: obj12,
														});
													});
												});
											});
										});

									});

								});

							});

						});
					});

				});
			});

		});
	});
});


app.post('/getRESolar', async function (req, res) {
	var select_SOLAR = 'SOLAR';

	const pool = mysql.createPool({
		connectionLimit: 250,
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {
		let sql_query = "select * from Data_RE where TYPE = ? ORDER BY `BLD`";
		connection.query(sql_query, [select_SOLAR], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));
			res.send({
				list_Solar: obj
			});
		});
	});
});

app.post('/getREGeoHydro', async function (req, res) {
	var select_GEO = 'GEO';
	var select_HYDRO = 'HYDRO';

	const pool = mysql.createPool({
		connectionLimit: 250,
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {
		let sql_query = "select * from Data_RE where TYPE = ? OR TYPE = ? ORDER BY `BLD`";
		connection.query(sql_query, [select_GEO, select_HYDRO], (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));
			res.send({
				list_GeoHydro: obj
			});
		});
	});
});

app.post('/getKUCar', async function (req, res) {

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query =
			"select * from Car";

		connection.query(query, (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			//console.log("obj", obj);
			res.send({ list_data: obj })
		});
	});
});

app.post('/getKULand', async function (req, res) {

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': '!kouno0815',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query =
			"select * from Land";

		connection.query(query, (error, response) => {
			var obj = JSON.parse(JSON.stringify(response));

			//console.log("obj", obj);
			res.send({ list_data: obj })
		});
	});
});

app.get('/space', async function (req, res) {

	var build = 4;
	var room = 67;
	var nstart = 0;

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery(sql, [build]);
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var room_info = await directQuery(sql, [room]);

	// 강의실 정보 가져오기
	/*
	var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
	sql += 'FROM tblBuild a,tblDevice b ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
	*/
	sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'email': req.session.user['email'],
		'tel': req.session.user['tel'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'build': build,
		'room': room
	};

	console.log(rinfos);

	res.render("sub_space", { page_data: page_data, lists: build_info, rinfos: rinfos, room_info: room_info });
});

app.post('/space', async function (req, res) {

	var build = 4;
	var room = 67;
	var nstart = 0;

	build = req.body.build;
	room = req.body.room;

	var room_info = [];

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery(sql, [build]);

	if (room == "0") {
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		room_info = await directQuery(sql, [room]);
	}
	else {
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		room_info = await directQuery(sql, [room]);
	}



	// 강의실 정보 가져오기
	/*
	var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
	sql += 'FROM tblBuild a,tblDevice b ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
	*/
	sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'email': req.session.user['email'],
		'tel': req.session.user['tel'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'build': build,
		'room': room
	};

	res.send({ idx: req.session.user.name, userid: req.session.user.userid, modex: req.session.mode, page_data: page_data, lists: build_info, rooms: rooms, rinfos: rinfos, room_info: room_info });
});

var port = process.env.PORT || 32000;



app.listen(port);
console.log('Order API is runnning at ' + port);


