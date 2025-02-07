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
		'password': '!kouno0815',
		'connectionLimit': 10000
	},
	'database': 'carbonKU'
};

const nodemailer = require('nodemailer');

const archiver = require("archiver");

const sizeOf = require("image-size");

/*
let transporter = nodemailer.createTransport({
	port: 587,
	host: 'smtp.gmail.com',
	auth: {
		user: 'kbw5636@kounosoft.com', // 보내는 메일의 주소
		pass: 'bwk*!#5636', // 보내는 메일의 비밀번호
		//user: 'sizin@kounosoft.com', // 보내는 메일의 주소
		//pass: 'aksen.0815', // 보내는 메일의 비밀번호
	},
});
*/

let transporter = nodemailer.createTransport({
	service: 'naver',
	host: 'smtp.naver.com',  // SMTP 서버명
	port: 465,  // SMTP 포트
	auth: {
		user: 'kbw3672',  // 네이버 아이디
		pass: 'bwk*!#5636',  // 네이버 비밀번호
	},
});

var connection = mysql.createConnection(info_dbconfig.connection);

const directQuery = require(__dirname + '/config/database').directQuery;

const infoQuery = require(__dirname + '/config/vr_db').infoQuery;

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

const steggy = require('steggy');
const QRCode = require('qrcode');
const watermark = require('dynamic-watermark');

var qr_bool = true;
var steegy_bool = false;

var steegy_pass = "kouno1234";

const multer = require('multer');


var storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, 'public/assets/builds/');
	},
	filename(req, file, cb) {
		cb(null, `${Date.now()}__${file.originalname}`);
	},
})

var upload = multer({ storage: storage });

var app = express();
//var router = express.Router();

//const path = require('path');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());

//public이라는 폴더의 클라이언트 접근 허용 (미들웨어)
app.use(express.static('css'));
app.use(express.static('font'));
app.use(express.static('images'));
app.use(express.static('js'));

app.use(cookieParser());

app.use(session({
	store: new FileStore(),
	secret: "d087e47b-dfd6-4088-ba2a-2cd9dd1628ca",
	resave: false,
	saveUninitialized: true,
	// cookie: { maxAge: 3600000 * 3 }
	cookie: { maxAge: 3600 * 1000 * 3 }
}));

//app.use(express.static(__dirname + '/'))

app.use(express.static('public'));

function getSelectOptionObj() {
	const selectOptionObj = {
		'0':
		{
			"0": "스피커 불량",
			"1": "앰프 불량(전원, 출력 등)",
			"2": "오디오 믹서 불량(전원, 작동법 등)",
			"3": "케이블 접속 불량",
			"4": "유무선 마이크 불량(출력, 볼륨, 작동 이상 등)",
			"5": "구즈넥 마이크 불량(출력, 볼륨, 작동 이상 등)",
			"6": "기타장비 불량(분배기, 순차전원기 등)"
		},
		"1":
		{
			"0": "빔프로젝터 불량(화면출력, 필터 경고 등)",
			"1": "LED 모니터 화면 불량",
			"2": "전동스크린 불량",
			"3": "케이블  불량(HDMI 연결 오류등)",
			"4": "전자교탁(A/V단자 및 판서모니터) 불량",
			"5": "기타장비 불량",
		},
		"2":
		{
			"0": "카메라(전원, 작동오류 등) 불량",
			"1": "카메라 컨트롤러 불량",
			"2": "화상프로그램(카메라 입력신호, 볼륨 등) 불량",
			"3": "케이블 불량(USV리퍼터 작동 오류 등)",
			"4": "온라인 오디오(노이즈, 하우링 등) 불량",
			"5": "기타장비 불량",
		},
		"3":
		{
			"0": "볼륨 조절 및 출력 이상"
		}
	};
	return selectOptionObj;
}

function createRandNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function isEmployee(req, res, next) {
	const classWhiteList = ['총무부']; //학생이면 어떻게 되는지 알아야함.
	if (!classWhiteList.includes(req.session.user.class)) {
		res.redirect()
	} else {
		return next();
	}
}

// ------------------- FUNCTION -------------------------
/*
 * 보안키 만들기 (아키시스템)
 *     num = 17 : 강의실정보
 * 			 18 : 학생 및 교직원 정보
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
 * 접근 토큰 얻어오기 (고려대학교)
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

/*
 * 접근 토큰 얻어오기 (고려대학교)
 */
async function get_data_token() {
	let client_id = 'carbonNeutralAsset';
	let client_secret = '5D53517B77BB4F1BAC26E4E06FBD1F37B1B2FFC3';

	let url = "https://kuapi.korea.ac.kr/svc/modules/token?" +
		"client_id=" + client_id +
		"&client_secret=" + client_secret +
		"&grant_type=client_credentials";

	await axios.post(url).then((Response) => {
		//console.log ("response: " + JSON.stringify (Response.data, null, 2));
		token = Response.data.access_token;
	}).catch((Error) => {
		console.log(Error);
	});

	return token;
}

/*
 * API를 이용한 조직도 기본 정보를 얻기
 */
async function get_org_data() {
	let ret = '';
	let token = await get_data_token();
	let client_id = 'carbonNeutralAsset';

	let url = 'https://kuapi.korea.ac.kr/svc/common/department/default?AUTH_KEY=' + encodeURIComponent(token) +
		'&client_id=' + encodeURIComponent(client_id);

	//console.log('get_search_category: ' + url);
	await axios.get(url).then((Response) => {
		//console.log ("response: " + JSON.stringify (Response.data));
		//make_category_db(JSON.stringify (Response.data));

		var json_data = JSON.stringify(Response.data);
		var json_obj = JSON.parse(json_data);
		//var json_1 = JSON.stringify (json_obj.result[0]);
		console.log("Response length : " + json_obj.result.length);
		//console.log ("Response 1 : " + json_1);
		insert_department_db(json_obj.result);
		ret = json_obj.result;
	}).catch((Error) => {
		console.log('Error: ' + Error);
		ret = Error;
	});

	return ret;
}

async function insert_department_db(data) {
	var sql = "";
	var sql_res;

	for (var idx = 0; idx < data.length; idx++) {
		var json_obj = data[idx];

		var dpt_cd = -1;
		var dpt_div = -1;
		var dpt_up_cd = -1;

		if (json_obj.COM020_DPT_CD != '') {
			dpt_cd = json_obj.COM020_DPT_CD;
		}

		if (json_obj.COM020_DIV != '') {
			dpt_div = json_obj.COM020_DIV;
		}

		if (json_obj.COM020_UP_CD != '') {
			dpt_up_cd = json_obj.COM020_UP_CD;
		}

		var nm_kor = json_obj.COM020_NM_KOR;
		var nm_eng = json_obj.COM020_NM_ENG;
		var dpt_use_yn = 0;

		if (json_obj.COM020_USE_YN == 'Y') {
			dpt_use_yn = 1;
		}

		sql = "SELECT sNameKor FROM tblDepartment WHERE nDepartmentCode=?";
		sql_res = await directQuery(sql, [dpt_cd]);

		if (sql_res.length == 0) {
			sql = 'INSERT INTO tblDepartment(nDepartmentCode,nDivCode,nUpCode,sNameKor,sNameEng,nUseYN) ';
			sql += 'VALUES(?,?,?,?,?,?);';
			sql_res = await directQuery(sql, [dpt_cd, dpt_div, dpt_up_cd, nm_kor, nm_eng, dpt_use_yn]);
		}

		//if(idx == 1)
		//console.log ("Response 1 : " + json_obj.COM020_DPT_CD);
	}
}

// ------------------- 고려대학교 정보 -----------------------

/*
 * 카테고리별 물품정보를 데이터 베이스에 저장
 */
async function make_category_db(data) {
	// 데이터를 파일에 저장
	// 데이터 베이스에 저장하는 프로그램 이용하기 위해 파일로 저장
	var fname = 'test_res' + '.txt';
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

	console.log("get_user 1: %o", ret[0]);

	console.log("get_user 1: %o", ret[1]);

	console.log("get_user 1: %o", ret[2]);

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


/*
 * 물품별 추가정보
 */
async function get_fixture_info(fix_no) {
	let ret = '';
	let token = await get_data_token();
	let client_id = 'carbonNeutralAsset';

	let url = 'https://kuapi.korea.ac.kr/svc/asset/article?AUTH_KEY=' + encodeURIComponent(token) +
		'&client_id=' + encodeURIComponent(client_id) +
		"&fix_no=" + encodeURIComponent(fix_no);;

	console.log("get_fixture_info: " + url);

	await axios.get(url).then((Response) => {

		var json_data = JSON.stringify(Response.data);
		var json_obj = JSON.parse(json_data);
		var json_1 = JSON.stringify(json_obj.result[0]);
		console.log("Response length : " + json_obj.result.length);
		console.log("Response 1 : " + json_1);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	});
	return ret;
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
	}
	return ret_data;
}

async function updateDpt() {
	var sql = "UPDATE tblUser SET nDepartmentCode=3706 WHERE nOrgIdx=195;";
	var user_info = await directQuery(sql);
}

async function updateDill1(dpt_code) {
	var sql = "UPDATE tblFixture SET dDiligence = 1, dUserNo = 98765432, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용' and (sFixturePrice between 1000000 and 4999999) and nDepartmentCode = ?;";
	var dill_info = await directQuery(sql, [dpt_code]);
}

async function updateDill2(dpt_code) {
	var sql = "UPDATE tblFixture SET dDiligence = 1, dUserNo = 98765432, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용' and (sFixturePrice >= 5000000) and nDepartmentCode = ?;";
	var dill_info = await directQuery(sql, [dpt_code]);
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
		console.log(Response.data);
		//ret = make_build_db(Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}

/*
 * API를 이용한 개별 건물정보 얻어오기
 */
async function get_build_info(build_id) {
	let ret;
	let key = await make_secure_key(17);
	let url = "http://cafm.korea.ac.kr/archibus/api_blrm_b2tegdsab4a0.jsp?" +
		"key=" + encodeURIComponent(key) +
		"&bl_id=" + encodeURIComponent(build_id);
	//console.log('get_build: ' + url);

	await axios.get(url).then((Response) => {
		//console.log (Response.data.result);
		ret = Response.data.result;
		//ret = make_build_db(Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}


/*
 * API를 이용한 상세건물정보 얻어오기
 */
async function get_build_detail() {
	let ret;
	let key = await make_secure_key(73);
	let url = "http://cafm.korea.ac.kr/archibus/api_bl_detail.jsp?" +
		"key=" + encodeURIComponent(key) +
		"&site_id=" + encodeURIComponent("서울캠퍼스");
	console.log('get_build_detail: ' + url);

	await axios.get(url).then((Response) => {
		//console.log (Response.data.result);
		ret = Response.data.result;
		//ret = make_build_db(Response.data);
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

/*
 * API를 이용한 고려대 교직원 정보 얻기
 */
async function get_personal_per() {
	let ret;
	let key_org = await make_secure_key(18);
	let key = key_org.substring(0, key_org.length - 2);
	let url = "http://cafm.korea.ac.kr/archibus/api_personal_per.jsp?" +
		"key=" + encodeURIComponent(key)
	console.log('get_personal_per: ' + url);

	await axios.get(url).then((Response) => {
		//console.log (Response.data.result);
		//ret = make_build_db(Response.data);
		ret = Response.data.result;
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}

/*
 * API를 이용한 고려대 학생 정보 얻기
 */
async function get_personal_rec() {
	let ret = '';
	let key_org = await make_secure_key(18);
	let key = key_org.substring(0, key_org.length - 2);
	let url = "http://cafm.korea.ac.kr/archibus/api_personal_rec.jsp?" +
		"key=" + encodeURIComponent(key)
	console.log('get_personal_rec: ' + url);

	await axios.get(url).then((Response) => {
		console.log(Response.data);
		//ret = make_build_db(Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}

/*
 * API를 이용한 고려대 교직원 및 학생 상세 정보 얻기
 */
async function get_personal_detail(personalNum) {
	let ret;
	let key_org = await make_secure_key(18);
	let key = key_org.substring(0, key_org.length - 2);
	let url = "http://cafm.korea.ac.kr/archibus/api_personal.jsp?" +
		"key=" + encodeURIComponent(key) +
		"&personalNumber=" + personalNum;
	//console.log('get_personal_detail: ' + url);

	await axios.get(url).then((Response) => {
		//console.log (Response.data.result);
		//ret = make_build_db(Response.data);
		ret = Response.data.result;
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})
	return ret;
}

app.get('/', session_exists, function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid != null) {
		res.redirect("home");
	}
	else {
		res.redirect("login");
	}
	*/

	res.redirect("home");
});

app.get('/home_2', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("index", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, portalid: req.session.user.portalid, userpw: req.session.user.userpw, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});


app.get('/home', session_exists, async function (req, res) {

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	// 최근 등록된 물품 4개 조회
	const recentItemsQuery = `
		SELECT a.*, b.sImgPath, b.sImgBin 
		FROM carbonKU.tblReusable a 
		JOIN carbonKU.tblReusableImg b ON a.nReusableNo = b.nReusableIdx 
		ORDER BY a.nReusableNo DESC 
    `;
	const recentItems = await directQuery(recentItemsQuery);


	res.render("reusable_main", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: req.session.user.userid,
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority,
		recentItems: recentItems // 추가된 부분
	});
});


app.get('/dashboard', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("dashboard", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/builddash', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("builddash", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/energy', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("energy", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

//직원만 권한
app.get('/fee', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("fee", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

//직원만 권한
app.get('/fee-tracking', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("fee_tracking", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/fuel', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("fuel", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/solar', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("solar", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/thermal', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("thermal", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/building', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("building", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/realestate', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("realestate", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/car', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("car", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/place', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("place", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/land', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("land", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/fixtures', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("fixtures", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/college', session_exists, async function (req, res) {
	const tempCollageDatas = [{
		year: 2024,
		campus: '서울캠퍼스',
		collageName: '-',
		elec: 0,
		gas: 0,
		water: 0,
		carbon: 0,
		rate: 0,
	}];
	const body = { collageDatas: tempCollageDatas };

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("college", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, data: body, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});


app.get('/organization_dataAnalysis', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("organization_dataAnalysis", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/sub_personalCheck_item', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("sub_personalCheck_item", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/authority_delegation', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var search_list = await directQuery(sql, [req.session.user.userid]);

	var sql_where = "";

	for (var idx = 0; idx < search_list.length; idx++) {
		sql_where += " and a.sNumber != " + search_list[idx].sAuthorityNum;
	}

	//SELECT count(*) as tot

	sql = 'SELECT count(*) as tot ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!=""';
	sql += sql_where;
	var total_org = await directQuery(sql);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!=""';
	sql += sql_where;
	sql += ' LIMIT 20 OFFSET 0;';
	var res_org = await directQuery(sql);

	sql = 'SELECT count(*) as tot ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=1';
	sql += sql_where;
	var total_person = await directQuery(sql);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and nStdType=1';
	sql += sql_where;
	sql += ' LIMIT 20 OFFSET 0;';
	var res_person = await directQuery(sql);

	sql = 'SELECT count(*) as tot ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=2';
	sql += sql_where;
	var total_student = await directQuery(sql);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=2';
	sql += sql_where;
	sql += ' LIMIT 20 OFFSET 0;';
	var res_student = await directQuery(sql);

	var nstart = 0;
	var start_page = nstart - (nstart % 20);
	var end_page_org = total_org[0].tot / 20;
	var end_page_person = total_person[0].tot / 20;
	var end_page_student = total_student[0].tot / 20;

	var page_data_org = {
		'count': nstart,
		'start': start_page,
		'end': end_page_org,
		'total': total_org[0].tot
	};

	var page_data_person = {
		'count': nstart,
		'start': start_page,
		'end': end_page_person,
		'total': total_person[0].tot
	};

	var page_data_student = {
		'count': nstart,
		'start': start_page,
		'end': end_page_student,
		'total': total_student[0].tot
	};

	res.render("authority_delegation", {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
		authority_list: authority_list, sel_authority: req.session.user.selectAuithority, res_org: res_org, total_org: total_org, res_person: res_person, total_person: total_person, res_student: res_student, total_student: total_student,
		page_total: page_data_org, page_person: page_data_person, page_student: page_data_student
	});
});

app.post('/authority_Page_Org', async function (req, res) {
	var nstart = req.body.nstart;

	var sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var search_list = await directQuery(sql, [req.session.user.userid]);

	var sql_where = "";

	for (var idx = 0; idx < search_list.length; idx++) {
		sql_where += " and a.sNumber != " + search_list[idx].sAuthorityNum;
	}

	sql = 'SELECT count(*) as tot ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!=""';
	sql += sql_where;
	var total_org = await directQuery(sql);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!=""';
	sql += sql_where;
	sql += ' LIMIT 20 OFFSET ?;';
	var res_org = await directQuery(sql, [Number(nstart * 20)]);

	var start_page = nstart - (nstart % 20);
	var end_page_org = total_org[0].tot / 20;

	var page_data_org = {
		'count': nstart,
		'start': start_page,
		'end': end_page_org,
		'total': total_org[0].tot
	};

	res.send({ res_org: res_org, page_total: page_data_org });
});

app.post('/authority_Page_Per', async function (req, res) {
	var nstart = req.body.nstart;

	var sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var search_list = await directQuery(sql, [req.session.user.userid]);

	var sql_where = "";

	for (var idx = 0; idx < search_list.length; idx++) {
		sql_where += " and a.sNumber != " + search_list[idx].sAuthorityNum;
	}

	sql = 'SELECT count(*) as tot ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=1';
	sql += sql_where;
	var total_person = await directQuery(sql);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=1';
	sql += sql_where;
	sql += ' LIMIT 20 OFFSET ?;';
	var res_person = await directQuery(sql, [Number(nstart * 20)]);

	var start_page = nstart - (nstart % 20);
	var end_page_org = total_person[0].tot / 20;

	var page_data_per = {
		'count': nstart,
		'start': start_page,
		'end': end_page_org,
		'total': total_person[0].tot
	};

	res.send({ res_person: res_person, page_person: page_data_per });
});

app.post('/authority_Page_Std', async function (req, res) {
	var nstart = req.body.nstart;

	var sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var search_list = await directQuery(sql, [req.session.user.userid]);

	var sql_where = "";

	for (var idx = 0; idx < search_list.length; idx++) {
		sql_where += " and a.sNumber != " + search_list[idx].sAuthorityNum;
	}

	sql = 'SELECT count(*) as tot ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=2';
	sql += sql_where;
	var total_std = await directQuery(sql);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=2';
	sql += sql_where;
	sql += ' LIMIT 20 OFFSET ?;';
	var res_std = await directQuery(sql, [Number(nstart * 20)]);

	var start_page = nstart - (nstart % 20);
	var end_page_std = total_std[0].tot / 20;

	var page_data_std = {
		'count': nstart,
		'start': start_page,
		'end': end_page_std,
		'total': total_std[0].tot
	};

	res.send({ res_std: res_std, page_student: page_data_std });
});

app.post('/searchAuthorityDelegation', async function (req, res) {
	var search_index = req.body.search_index;
	var search_value = req.body.search_value;

	var sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	var sql_where = "";

	for (var idx = 0; idx < authority_list.length; idx++) {
		sql_where += " and a.sNumber != " + authority_list[idx].sAuthorityNum;
	}

	if (search_index == 0) // 포탈 아이디
	{
		sql_where += ' and a.sPortal = ?';
	}
	else if (search_index == 1) // 교직원 번호
	{
		sql_where += ' and a.sNumber = ?';
	}
	else if (search_index == 2) // 이름
	{
		sql_where += ' and a.sName = ?';
	}
	else if (search_index == 3) // 소속부서
	{
		search_value = "%" + search_value + "%";
		sql_where += ' and b.sOrgName LIKE ?';
	}
	else if (search_index == 4) // 이메일
	{
		sql_where += ' and a.sEMail = ?';
	}
	else if (search_index == 5) // 연락처
	{
		sql_where += ' and a.sTel = ?';
	}

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!=""';
	sql += sql_where;
	var res_org = await directQuery(sql, [search_value]);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and nStdType=1';
	sql += sql_where;
	var res_person = await directQuery(sql, [search_value]);

	sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and nStdType=2';
	sql += sql_where;
	var res_student = await directQuery(sql, [search_value]);

	res.send({ search_org: res_org, search_person: res_person, search_student: res_student });
});

app.post('/registAuthority', async function (req, res) {
	var user_empNo = req.session.user.userid;
	var authority_empNo = req.body.empNo;

	var sql = 'INSERT INTO tblAuthority(sStdId,sAuthorityNum) VALUES(?,?);';
	await directQuery(sql, [user_empNo, authority_empNo]);

	res.send({ result: true });
});

app.post('/updateManagePermission', session_exists, async function (req, res) {
	var empNo = req.body.empNo;
	var chk_reus = req.body.chk_reus;
	var chk_pes = req.body.chk_pes;
	var chk_vr = req.body.chk_vr;

	var permission_count = 4;

	if (chk_reus == 1) {
		permission_count--;
	}

	if (chk_pes == 1) {
		permission_count--;
	}

	if (chk_vr == 1) {
		permission_count--;
	}

	var sql = "UPDATE tblUser ";
	sql += "SET nPermission=?,nPermission_reusable=?,nPermission_personalchk=?,nPermission_vr=? ";
	sql += "WHERE sNumber=?;";
	var db_res = await directQuery(sql, [permission_count, chk_reus, chk_pes, chk_vr, empNo]);

	//res.redirect("authorityDelegation_list");
	res.send({ result: true });
});

app.get('/authorityDelegation_list', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	console.log("/authorityDelegation_list");

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var search_list = await directQuery(sql, [req.session.user.userid]);

	var res_list = [];

	for (var idx = 0; idx < search_list.length; idx++) {

		sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name, a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
		sql += 'FROM tblUser a,tblOrganization b ';
		sql += 'WHERE a.nOrgIdx=b.nIndex and a.sNumber = ?';
		var res_org = await directQuery(sql, [search_list[idx].sAuthorityNum]);

		res_list.push(res_org[0]);
	}

	console.log(res_list);

	res.render("authorityDelegation_list", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority, res_list: res_list });
});

app.post('/removeAuthority', session_exists, async function (req, res) {
	var userNo = req.body.userNo;
	var authorityNo = req.body.authorityNo;

	var sql = "DELETE FROM tblAuthority WHERE sStdId=? AND sAuthorityNum=?;";
	var db_del = await directQuery(sql, [userNo, authorityNo]);

	res.send(true);
});

app.get('/applicantCheck_popup', async function (req, res) {
	//res.render("fixtures.html");

	var resuNo = req.query.resuNo;
	var appliV = false;

	var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
	var rinfos = await directQuery(sql, [resuNo]);

	if (rinfos[0].nApplicantState != 0) {
		appliV = true;
	}

	sql = 'SELECT * FROM tblReusableApplicant WHERE nReusableNo=?;';
	var rinfos_list = await directQuery(sql, [resuNo]);

	var arr_aplic = [];

	if (rinfos_list.length > 0) {
		for (var idx = 0; idx < rinfos_list.length; idx++) {
			var userID = rinfos_list[idx].sApplicantNumber;

			console.log(userID);

			if (userID == '210597') {
				var jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': 'kbw5636@kounosoft.com', 'tel': '010-9318-5636' };
				arr_aplic.push(jsonData);
			}
			else if (userID == '597210') {
				var jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': 'jaebeen2@kounosoft.com', 'tel': '010-6277-4800' };
				arr_aplic.push(jsonData);
			}
			else if (userID == '666308') {
				var jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': 'sizin@kounosoft.com', 'tel': '010-3380-4340' };
				arr_aplic.push(jsonData);
			}
			else if (userID == '') {

			}
			else {
				sql = 'SELECT distinct(b.sName) org, a.sName name,a.sEmail email, a.sTel tel, a.nPermission permission ';
				sql += 'FROM tblUser a,tblOrganization b ';
				sql += 'WHERE a.sNumber=? and a.nOrgIdx=b.nIndex';
				var res_org = await directQuery(sql, [userID]);

				jsonData = { 'userid': userID, 'potalId': userID, 'name': res_org[0].name, 'class': res_org[0].org, 'mail': res_org[0].email, 'tel': res_org[0].tel };
				arr_aplic.push(jsonData);
			}
		}
	}



	res.render("applicantCheck_popup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, resuNo: resuNo, arr_aplic: arr_aplic, appliV: appliV });
});

app.get('/registrarCheck_popup', async function (req, res) {
	//res.render("fixtures.html");

	var resuNo = req.query.resuNo;

	var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
	var rinfos = await directQuery(sql, [resuNo]);

	console.log(rinfos);

	var registrar_Email = rinfos[0].sReusableEmail;
	var jsonData = {};

	if (registrar_Email == 'kbw5636@kounosoft.com') {
		jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': registrar_Email, 'tel': '010-9318-5636' };
	}
	else if (registrar_Email == 'jaebeen2@kounosoft.com') {

		jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': registrar_Email, 'tel': '010-6277-4800' };
	}
	else if (registrar_Email == 'sizin@kounosoft.com') {

		jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': registrar_Email, 'tel': '010-3380-4340' };
	}
	else {
		sql = 'SELECT distinct(b.sName) org, a.sName name,a.sNumber email, a.sTel tel, a.sNumber employeeNum, a.nPermission permission ';
		sql += 'FROM tblUser a,tblOrganization b ';
		sql += 'WHERE a.sEMail=? and a.nOrgIdx=b.nIndex';
		var res_org = await directQuery(sql, [registrar_Email]);

		jsonData = { 'userid': res_org[0].employeeNum, 'potalId': res_org[0].employeeNum, 'name': res_org[0].name, 'class': res_org[0].org, 'mail': registrar_Email, 'tel': res_org[0].tel };
	}

	res.render("registrarCheck_popup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, jsonData: jsonData });
});


//위와 구분짓자 //

// 등록자 확인 팝업 페이지 라우터
app.get('/registrar_checkPopup', async function (req, res) {
	try {
		// ... existing code ...
		var resuNo = req.query.resuNo;

		var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
		var rinfos = await directQuery(sql, [resuNo]);

		console.log(rinfos);

		var registrar_Email = rinfos[0].sReusableEmail;
		var jsonData = {};

		if (registrar_Email == 'kbw5636@kounosoft.com') {
			jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': registrar_Email, 'tel': '010-9318-5636', 'etc': rinfos[0].nReusableEtc || '' };
		}
		else if (registrar_Email == 'jaebeen2@kounosoft.com') {

			jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': registrar_Email, 'tel': '010-6277-4800', 'etc': rinfos[0].nReusableEtc || '' };
		}
		else if (registrar_Email == 'sizin@kounosoft.com') {

			jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': registrar_Email, 'tel': '010-3380-4340', 'etc': rinfos[0].nReusableEtc || '' };
		}

		// 일반 사용자의 경우 DB에서 정보 조회
		else {
			sql = 'SELECT distinct(b.sName) org, a.sName name,a.sNumber email, a.sTel tel, a.sNumber employeeNum, a.nPermission permission ';
			sql += 'FROM tblUser a,tblOrganization b ';
			sql += 'WHERE a.sEMail=? and a.nOrgIdx=b.nIndex';
			var res_org = await directQuery(sql, [registrar_Email]);

			// DB 조회 결과가 없는 경우 기본값 설정
			if (!res_org || res_org.length === 0) {
				jsonData = {
					'userid': 'N/A',
					'potalId': 'N/A',
					'name': rinfos[0].sReusableNowUser || '미등록 사용자',
					'class': '미등록',
					'mail': registrar_Email,
					'tel': rinfos[0].sReusableMobile || '연락처 없음',
					'etc': rinfos[0].nReusableEtc || ''
				};
			} else {
				jsonData = {
					'userid': res_org[0].employeeNum,
					'potalId': res_org[0].employeeNum,
					'name': res_org[0].name,
					'class': res_org[0].org,
					'mail': registrar_Email,
					'tel': res_org[0].tel,
					'etc': rinfos[0].nReusableEtc || ''
				};
			}
		}

		// 등록자 확인 팝업 페이지 렌더링
		res.render("registrar_checkPopup", {
			idx: req.session.user.name,
			uname: req.session.user.name,
			userid: req.session.user.userid,
			permission: req.session.user.permission,
			stdtype: req.session.user.stdtype,
			modex: req.session.mode,
			jsonData: jsonData
		});
	} catch (error) {
		console.error('Error in registrar_checkPopup:', error);
		res.status(500).send('서버 오류가 발생했습니다.');
	}
});

app.get('/vr_index', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

	/*
	if(req.session.user.permission_vr == 1)
	{
		res.redirect("vr_space_admin");
	}
	else
	{
		res.redirect("vr_space_user");
	}
	*/

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

	res.render("vr_index", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, permission: req.session.user.permission, large_lists: large_lists, permission_vr: req.session.user.permission_vr, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_user', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	console.log('app.get /vr_space_user');
	var roomidx = 27;

	/*
	if(req.params.sceneParam != undefined)
	{
		roomidx = req.params.sceneParam;
	}
	*/

	/*
	var sql  = "SELECT c.sName sBuild,d.nFloor nFloor,d.sName sRoom,b.sName sUsername,a.* ";
	sql += "FROM tblDevice a, tblUser b,tblBuild c,tblRoom d ";
	sql += "WHERE a.sBuildCode=c.sArchiIndex AND a.nRoom=d.nIndex AND d.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var device_list = await infoQuery (sql, [roomidx]);
	*/

	var sql = "SELECT * FROM tblDevice WHERE nRoom=? ORDER BY nIndex;";
	var device_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sName sBuild,c.sName sRoom,c.sLocation sLocation,a.* ";
	sql += "FROM tblSensor a,tblBuild b,tblRoom c ";
	sql += "WHERE a.nBuild=b.nIndex AND a.nRoom=c.nIndex AND c.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var sensor_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sLocation sLocation,a.* FROM tblLink a,tblRoom b WHERE a.nLinkRoom=b.nIndex AND a.nRoomIdx=?";
	var link_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT * FROM tblRoom WHERE nIndex=?";
	var room_info = await infoQuery(sql, [roomidx]);

	for (var idx = 0; idx < device_list.length; idx++) {
		device_list[idx].sRoom = room_info[0].sName;
		device_list[idx].nFloor = room_info[0].nFloor;

		if (device_list[idx].sUserName == "") {
			sql = 'SELECT nOrgIdx FROM tblUser WHERE nIndex=?;';
			var user_info = await directQuery(sql, [device_list[idx].nUseridx]);

			sql = 'SELECT sName FROM tblOrganization WHERE nIndex=?;';
			var org_info = await directQuery(sql, [user_info[0].nOrgIdx]);

			device_list[idx].sUserName = org_info[0].sName;
		}
	}

	//var build_idx = room_info[0].nBuildIndex;

	//sql  = "SELECT * FROM tblBuild WHERE nIndex=?";
	//var build_info = await infoQuery (sql, [build_idx]);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	var return_build = [];
	var floor_val = 0;
	var under_val = 0;
	var json_array = [];

	res.render("vr_space_user", {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
		room_info: room_info, link_list: link_list, device_list: device_list, sensor_list: sensor_list, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority
		, sel_areaIdx: 0, build: return_build, sel_buildIdx: req.session.user.sel_buildIdx, floor_val: floor_val, under_val: under_val, sel_floorIdx: req.session.user.sel_floorIdx, room: json_array, sel_roomIdx: req.session.user.sel_roomIdx
	});
});

app.get('/vr_space_user/:sceneParam', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	console.log('app.get /vr_space_user/:sceneParam');
	console.log(req.params.sceneParam);
	var roomidx = 6;

	if (req.params.sceneParam != undefined) {
		roomidx = req.params.sceneParam;
	}

	/*
	var sql  = "SELECT c.sName sBuild,d.nFloor nFloor,d.sName sRoom,b.sName sUsername,a.* ";
	sql += "FROM tblDevice a, tblUser b,tblBuild c,tblRoom d ";
	sql += "WHERE a.nUseridx=b.nIndex AND a.nBuild=c.nIndex AND a.nRoom=d.nIndex AND d.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	*/
	/*
	var sql  = "SELECT c.sName sBuild,d.nFloor nFloor,d.sName sRoom,b.sName sUsername,a.* ";
	sql += "FROM tblDevice a, tblUser b,tblBuild c,tblRoom d ";
	sql += "WHERE a.sBuildCode=c.sArchiIndex AND a.nRoom=d.nIndex AND d.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var device_list = await infoQuery (sql, [roomidx]);
	*/

	var sql = "SELECT * FROM tblDevice WHERE nRoom=? ORDER BY nIndex;";
	var device_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sName sBuild,c.sName sRoom,c.sLocation sLocation,a.* ";
	sql += "FROM tblSensor a,tblBuild b,tblRoom c ";
	sql += "WHERE a.nBuild=b.nIndex AND a.nRoom=c.nIndex AND c.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var sensor_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sLocation sLocation,a.* FROM tblLink a,tblRoom b WHERE a.nLinkRoom=b.nIndex AND a.nRoomIdx=?";
	var link_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT * FROM tblRoom WHERE nIndex=?";
	var room_info = await infoQuery(sql, [roomidx]);

	for (var idx = 0; idx < device_list.length; idx++) {
		device_list[idx].sRoom = room_info[0].sName;
		device_list[idx].nFloor = room_info[0].nFloor;

		if (device_list[idx].sUserName == "") {
			sql = 'SELECT nOrgIdx FROM tblUser WHERE nIndex=?;';
			var user_info = await directQuery(sql, [device_list[idx].nUseridx]);

			sql = 'SELECT sName FROM tblOrganization WHERE nIndex=?;';
			var org_info = await directQuery(sql, [user_info[0].nOrgIdx]);

			device_list[idx].sUserName = org_info[0].sName;
		}
	}

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	var sql = 'SELECT sArchiIndex FROM tblBuild;';
	var build_db = await infoQuery(sql);
	var myBuild_List = [];

	//console.log("myBuild_List",myBuild_List);

	for (var idx = 0; idx < build_db.length; idx++) {
		myBuild_List.push(build_db[idx].sArchiIndex);
	}

	var build_list = await get_build_detail();

	var return_build = [];

	for (var idx = 0; idx < build_list.length; idx++) {
		sql = "SELECT count(*) as tot FROM tblRoom WHERE sBuildCode=?;";
		var res_total = await infoQuery(sql, [build_list[idx].bl_id]);
		var total = res_total[0].tot;

		if (req.session.user.sel_areaIdx == '1' && build_list[idx].locate_sub == '1인문사회' && myBuild_List.includes(build_list[idx].bl_id) && total > 0)
			return_build.push(build_list[idx]);
		else if (req.session.user.sel_areaIdx == '2' && build_list[idx].locate_sub == '2자연' && myBuild_List.includes(build_list[idx].bl_id) && total > 0)
			return_build.push(build_list[idx]);
		else if (req.session.user.sel_areaIdx == '3' && build_list[idx].locate_sub == '3녹지' && myBuild_List.includes(build_list[idx].bl_id) && total > 0)
			return_build.push(build_list[idx]);
	}

	sql = 'SELECT nFloor FROM tblRoom WHERE sBuildCode=?;';
	var room_floor = await infoQuery(sql, [req.session.user.sel_buildIdx]);

	var myFloor_List = [];

	for (var idx = 0; idx < room_floor.length; idx++) {
		if (!myFloor_List.includes(room_floor[idx].nFloor))
			myFloor_List.push(room_floor[idx].nFloor);
	}

	var under_val;
	var floor_val;

	for (var idx = 0; idx < build_list.length; idx++) {
		if (build_list[idx].bl_id == req.session.user.sel_buildIdx) {
			floor_val = build_list[idx].count_fl;
			under_val = build_list[idx].count_bf;

			break;
		}
	}

	var floor_value = 0;

	if (req.session.user.sel_floorIdx.includes('BF')) {
		floor_value = parseInt(req.session.user.sel_floorIdx.substr(2)) * -1;
	}
	else {
		floor_value = parseInt(req.session.user.sel_floorIdx.substr(2));
	}

	sql = 'SELECT nIndex,sName,sLocation FROM tblRoom WHERE sBuildCode=? AND nFloor=?;';
	var room_list = await infoQuery(sql, [req.session.user.sel_buildIdx, floor_value]);

	var json_array = [];

	for (var idx = 0; idx < room_list.length; idx++) {
		var json_obj = {
			'name': room_list[idx].sName + ' - ' + room_list[idx].sLocation,
			'value': room_list[idx].nIndex
		}

		json_array.push(json_obj);
	}

	res.render("vr_space_user", {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
		room_info: room_info, link_list: link_list, device_list: device_list, sensor_list: sensor_list, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority, myFloor_List: myFloor_List
		, sel_areaIdx: req.session.user.sel_areaIdx, build: return_build, sel_buildIdx: req.session.user.sel_buildIdx, floor_val: floor_val, under_val: under_val, sel_floorIdx: req.session.user.sel_floorIdx, room: json_array, sel_roomIdx: req.session.user.sel_roomIdx
	});
});

app.post('/vr_select_build', session_exists, async function (req, res) {
	var build = req.body.build;

	console.log("req.body", req.body);

	var sql = 'SELECT nFloor,nUnder FROM tblBuild WHERE nIndex=?';
	var floor_list = await infoQuery(sql, [build]);

	console.log("floor_list", floor_list);

	var nFloor = floor_list[0].nFloor;
	var nUnder = floor_list[0].nUnder;

	//var true_floor = nFloor - nUnder;
	var true_floor = nFloor;

	var json_array = [];

	for (var fl_idx = true_floor; fl_idx > 0; fl_idx--) {
		var json_obj = {
			'name': fl_idx + '층',
			'value': fl_idx
		}

		json_array.push(json_obj);
	}


	for (var fl_idx = 0; fl_idx < nUnder; fl_idx++) {
		var json_obj = {
			'name': '지하 ' + (fl_idx + 1) + '층',
			'value': (fl_idx + 1) * -1
		}

		json_array.push(json_obj);
	}

	res.send({ floor: json_array });
});

app.post('/vr_select_floor', session_exists, async function (req, res) {
	var build = req.body.build;
	var floor = req.body.floor;

	var floor_value = 0;

	if (floor.includes('BF')) {
		floor_value = parseInt(floor.substr(2)) * -1;
	}
	else {
		floor_value = parseInt(floor.substr(2));
	}

	var sql = 'SELECT nIndex,sName,sLocation FROM tblRoom WHERE sBuildCode=? AND nFloor=?;';
	var room_list = await infoQuery(sql, [build, floor_value]);

	var json_array = [];

	for (var idx = 0; idx < room_list.length; idx++) {
		var json_obj = {
			'name': room_list[idx].sName + ' - ' + room_list[idx].sLocation,
			'value': room_list[idx].nIndex
		}

		json_array.push(json_obj);
	}

	res.send({ room: json_array });
});

app.post('/vr_save_index', session_exists, async function (req, res) {
	var val_area = req.body.areaIdx;
	var val_build = req.body.buildIdx;
	var val_floor = req.body.floorIdx;
	var val_room = req.body.roomIdx;

	console.log("val_area", val_area);
	console.log("val_build", val_build);
	console.log("val_floor", val_floor);
	console.log("val_room", val_room);

	req.session.user.sel_areaIdx = val_area;
	req.session.user.sel_buildIdx = val_build;
	req.session.user.sel_floorIdx = val_floor;
	req.session.user.sel_roomIdx = val_room;

	res.send({ result: true });
});

app.get('/vr_space_admin', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var roomidx = 27;

	var sql = "SELECT * FROM tblRoom ORDER BY nIndex; ";
	var room_db = await infoQuery(sql, [roomidx]);

	var roomidx = room_db[0].nIndex;

	sql = "SELECT * FROM tblRoom WHERE nIndex=?";
	var room_info = await infoQuery(sql, [roomidx]);

	/*
	var sql  = "SELECT c.sName sBuild,d.nFloor nFloor,d.sName sRoom,b.sName sUsername,a.* ";
	sql += "FROM tblDevice a, tblUser b,tblBuild c,tblRoom d ";
	sql += "WHERE a.sBuildCode=c.sArchiIndex AND a.nRoom=d.nIndex AND d.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var device_list = await infoQuery (sql, [roomidx]);
	*/
	var sql = "SELECT * FROM tblDevice WHERE nRoom=? ORDER BY nIndex;";
	var device_list = await infoQuery(sql, [roomidx]);

	for (var idx = 0; idx < device_list.length; idx++) {
		device_list[idx].sRoom = room_info[0].sName;
		device_list[idx].nFloor = room_info[0].nFloor;

		if (device_list[idx].sUserName == "") {
			sql = 'SELECT nOrgIdx FROM tblUser WHERE nIndex=?;';
			var user_info = await directQuery(sql, [device_list[idx].nUseridx]);

			sql = 'SELECT sName FROM tblOrganization WHERE nIndex=?;';
			var org_info = await directQuery(sql, [user_info[0].nOrgIdx]);

			device_list[idx].sUserName = org_info[0].sName;
		}
	}

	sql = "SELECT b.sName sBuild,c.sName sRoom,c.sLocation sLocation,a.* ";
	sql += "FROM tblSensor a,tblBuild b,tblRoom c ";
	sql += "WHERE a.nBuild=b.nIndex AND a.nRoom=c.nIndex AND c.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var sensor_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sLocation sLocation,a.* FROM tblLink a,tblRoom b WHERE a.nLinkRoom=b.nIndex AND a.nRoomIdx=?";
	var link_list = await infoQuery(sql, [roomidx]);

	console.log(room_info);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	var return_build = [];

	var under_val = 0;
	var floor_val = 0;

	var json_array = [];

	res.render("vr_space_admin", {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
		room_info: room_info, link_list: link_list, device_list: device_list, sensor_list: sensor_list, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority
		, sel_areaIdx: 0, build: return_build, floor_val: floor_val, under_val: under_val, room: json_array, sel_buildIdx: req.session.user.sel_buildIdx, sel_floorIdx: req.session.user.sel_floorIdx, sel_roomIdx: req.session.user.sel_roomIdx
	});
});

app.get('/vr_space_admin/:sceneParam', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var roomidx = 8;

	if (req.params.sceneParam != undefined) {
		roomidx = req.params.sceneParam;
	}

	/*
	var sql  = "SELECT c.sName sBuild,d.nFloor nFloor,d.sName sRoom,b.sName sUsername,a.* ";
	sql += "FROM tblDevice a, tblUser b,tblBuild c,tblRoom d ";
	sql += "WHERE a.sBuildCode=c.sArchiIndex AND a.nRoom=d.nIndex AND d.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var device_list = await infoQuery (sql, [roomidx]);
	*/

	var sql = "SELECT * FROM tblDevice WHERE nRoom=? ORDER BY nIndex;";
	var device_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sName sBuild,c.sName sRoom,c.sLocation sLocation,a.* ";
	sql += "FROM tblSensor a,tblBuild b,tblRoom c ";
	sql += "WHERE a.nBuild=b.nIndex AND a.nRoom=c.nIndex AND c.nIndex=? ";
	sql += "ORDER BY a.nIndex;";
	var sensor_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT b.sLocation sLocation,a.* FROM tblLink a,tblRoom b WHERE a.nLinkRoom=b.nIndex AND a.nRoomIdx=?";
	var link_list = await infoQuery(sql, [roomidx]);

	sql = "SELECT * FROM tblRoom WHERE nIndex=?";
	var room_info = await infoQuery(sql, [roomidx]);

	for (var idx = 0; idx < device_list.length; idx++) {
		device_list[idx].sRoom = room_info[0].sName;
		device_list[idx].nFloor = room_info[0].nFloor;

		if (device_list[idx].sUserName == "") {
			sql = 'SELECT nOrgIdx FROM tblUser WHERE nIndex=?;';
			var user_info = await directQuery(sql, [device_list[idx].nUseridx]);

			sql = 'SELECT sName FROM tblOrganization WHERE nIndex=?;';
			var org_info = await directQuery(sql, [user_info[0].nOrgIdx]);

			device_list[idx].sUserName = org_info[0].sName;
		}
	}

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	var sql = 'SELECT sArchiIndex FROM tblBuild;';
	var build_db = await infoQuery(sql);
	var myBuild_List = [];

	//console.log("myBuild_List",myBuild_List);

	for (var idx = 0; idx < build_db.length; idx++) {
		myBuild_List.push(build_db[idx].sArchiIndex);
	}

	var build_list = await get_build_detail();

	var return_build = [];

	for (var idx = 0; idx < build_list.length; idx++) {
		sql = "SELECT count(*) as tot FROM tblRoom WHERE sBuildCode=?;";
		var res_total = await infoQuery(sql, [build_list[idx].bl_id]);
		var total = res_total[0].tot;

		if (req.session.user.sel_areaIdx == '1' && build_list[idx].locate_sub == '1인문사회' && myBuild_List.includes(build_list[idx].bl_id) && total > 0)
			return_build.push(build_list[idx]);
		else if (req.session.user.sel_areaIdx == '2' && build_list[idx].locate_sub == '2자연' && myBuild_List.includes(build_list[idx].bl_id) && total > 0)
			return_build.push(build_list[idx]);
		else if (req.session.user.sel_areaIdx == '3' && build_list[idx].locate_sub == '3녹지' && myBuild_List.includes(build_list[idx].bl_id) && total > 0)
			return_build.push(build_list[idx]);
	}

	sql = 'SELECT nFloor FROM tblRoom WHERE sBuildCode=?;';
	var room_floor = await infoQuery(sql, [req.session.user.sel_buildIdx]);

	var myFloor_List = [];

	for (var idx = 0; idx < room_floor.length; idx++) {
		if (!myFloor_List.includes(room_floor[idx].nFloor))
			myFloor_List.push(room_floor[idx].nFloor);
	}

	var under_val;
	var floor_val;

	for (var idx = 0; idx < build_list.length; idx++) {
		if (build_list[idx].bl_id == req.session.user.sel_buildIdx) {
			floor_val = build_list[idx].count_fl;
			under_val = build_list[idx].count_bf;

			break;
		}
	}

	var floor_value = 0;

	if (req.session.user.sel_floorIdx.includes('BF')) {
		floor_value = parseInt(req.session.user.sel_floorIdx.substr(2)) * -1;
	}
	else {
		floor_value = parseInt(req.session.user.sel_floorIdx.substr(2));
	}

	sql = 'SELECT nIndex,sName,sLocation FROM tblRoom WHERE sBuildCode=? AND nFloor=?;';
	var room_list = await infoQuery(sql, [req.session.user.sel_buildIdx, floor_value]);

	var json_array = [];

	for (var idx = 0; idx < room_list.length; idx++) {
		var json_obj = {
			'name': room_list[idx].sName + ' - ' + room_list[idx].sLocation,
			'value': room_list[idx].nIndex
		}

		json_array.push(json_obj);
	}

	res.render("vr_space_admin", {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
		room_info: room_info, link_list: link_list, device_list: device_list, sensor_list: sensor_list, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority, myFloor_List: myFloor_List
		, sel_areaIdx: req.session.user.sel_areaIdx, build: return_build, sel_buildIdx: req.session.user.sel_buildIdx, floor_val: floor_val, under_val: under_val, sel_floorIdx: req.session.user.sel_floorIdx, room: json_array, sel_roomIdx: req.session.user.sel_roomIdx
	});
});

app.get('/vr_append/device', async function (req, res) {
	console.log('app.get /append/device');

	var sel_build = req.query.sel_build;
	var sel_room = req.query.sel_room;
	var sel_pitch = req.query.pitch;
	var sel_yaw = req.query.yaw;
	var user_list = [];
	var build_list = [];
	var room_list = [];

	var sel_area = 0;
	var room_no = 0;

	/*
	var sql = "SELECT * FROM tblUser ORDER BY nIndex;";
	user_list = await infoQuery (sql);
	*/

	var sql = "SELECT * FROM tblUser ORDER BY sName LIMIT 20 OFFSET 0;";
	user_list = await directQuery(sql);

	sql = "SELECT * FROM tblBuild ORDER BY nIndex;";
	build_list = await infoQuery(sql);

	sql = "SELECT * FROM tblRoom WHERE nIndex=?;";
	var room_info = await infoQuery(sql, [sel_room]);

	//var build_list = await get_build_detail();
	var res_room = await get_build_info(sel_build);

	/*
	for(var idx_ret = 0; idx_ret < build_list.length; idx_ret++)
	{

		if(build_list[idx_ret].bl_id == sel_build)
		{

			if(build_list[idx_ret].locate_sub == '1인문사회')
				sel_area = 1;
			else if(build_list[idx_ret].locate_sub == '2자연')
				sel_area = 2;
			else if(build_list[idx_ret].locate_sub == '3녹지')
				sel_area = 3;

			break;
		}
	}
	*/

	for (var idx_ret = 0; idx_ret < build_list.length; idx_ret++) {

		if (build_list[idx_ret].sArchiIndex == sel_build) {

			if (build_list[idx_ret].nAreaType == 1)
				sel_area = 1;
			else if (build_list[idx_ret].nAreaType == 2)
				sel_area = 2;
			else if (build_list[idx_ret].nAreaType == 3)
				sel_area = 3;

			break;
		}
	}

	//console.log("res_room",res_room[0]);

	for (var idx_ret = 0; idx_ret < res_room.length; idx_ret++) {
		if (res_room[idx_ret].rm_id == room_info[0].sRoomNo) {
			room_no = res_room[idx_ret].rm_id;
			break;
		}
	}

	sql = "SELECT * FROM tblRoom WHERE sBuildCode=? ORDER BY nIndex;";
	room_list = await infoQuery(sql, [sel_build]);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render('vr_space_admin_product_add',
		{
			idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
			user_list: user_list, build_list: build_list, room_list: room_list, large_lists: large_lists,
			sel_build: sel_build, sel_room: sel_room, sel_pitch: sel_pitch, sel_yaw: sel_yaw, sel_area: sel_area, room_no: room_no, authority_list: authority_list, sel_authority: req.session.user.selectAuithority
		});
});

app.post('/vrDeviceAppend', session_exists, async function (req, res) {
	var campus = req.body.campus;
	var area = req.body.area;
	var build = req.body.build;
	var room = req.body.room;
	var yaw = req.body.yaw;
	var pitch = req.body.pitch;
	var no = req.body.no;
	var name = req.body.name;
	var type = req.body.type;
	var user = req.body.user;
	var model = req.body.model;
	var maker = req.body.maker;
	var price = req.body.price;
	var buyday = req.body.buyday;

	var sql = 'SELECT sName FROM tblOrganization where nIndex =? ';
	var user_info = await directQuery(sql, [user]);

	var user_name = '';

	if (user_info.length > 0) {
		user_name = user_info[0].sName;
	}

	var sql = 'INSERT INTO tblDevice(sFixtureNo,sName,sBuildCode,nRoom,nYaw,nPitch,sModel,sType,sMaker,nPrice,dBuy,nUseridx,sUserName) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);';
	await infoQuery(sql, [no, name, build, room, yaw, pitch, model, type, maker, price, buyday, user, user_name]);

	res.send(true);
});

app.post('/vrDeviceAppend_Static', session_exists, async function (req, res) {
	var campus = req.body.campus;
	var area = req.body.area;
	var build = req.body.build;
	var room = req.body.room;
	var yaw = req.body.yaw;
	var pitch = req.body.pitch;
	var no = req.body.no;
	var name = req.body.name;
	var type = req.body.type;
	var user = req.body.user;
	var model = req.body.model;
	var maker = req.body.maker;
	var price = req.body.price;
	var buyday = req.body.buyday;

	var sql = 'SELECT nIndex FROM tblOrganization where sName =? ';
	var org_info = await directQuery(sql, [user]);

	var user_idx = -1;

	if (org_info.length > 0) {
		user_idx = org_info[0].nIndex;
	}

	sql = 'INSERT INTO tblDevice(sFixtureNo,sName,sBuildCode,nRoom,nYaw,nPitch,sModel,sType,sMaker,nPrice,dBuy,nUseridx,sUserName) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);';
	await infoQuery(sql, [no, name, build, room, yaw, pitch, model, type, maker, price, buyday, user_idx, user]);

	res.send(true);
});

app.get('/vr_append/room', async function (req, res) {
	var build_idx = req.query.sel_build;
	var room_idx = req.query.sel_room;
	var floor_no = req.query.sel_floor;
	var pitch = req.query.pitch;
	var yaw = req.query.yaw;

	var room_list = [];
	var sql = "SELECT * FROM tblRoom WHERE sBuildCode=? AND nFloor=?;";
	room_list = await infoQuery(sql, [build_idx, floor_no]);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

	sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	sql = "SELECT * FROM tblBuild WHERE sArchiIndex=?";
	var build_info = await infoQuery(sql, [build_idx]);

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

	res.render('vr_space_admin_room_add2', {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, build_info: build_info,
		room_list: room_list, room_idx: room_idx, pitch: pitch, yaw: yaw, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority
	});
});

app.post('/connectVRRoom', session_exists, async function (req, res) {
	console.log('app.post /select/room');

	var room_idx = req.body.room_idx;
	var sel_room = req.body.sel_room;
	var pitch = req.body.pitch;
	var yaw = req.body.yaw;

	var sql = "SELECT * FROM tblRoom WHERE nIndex=?;";
	var ret = await infoQuery(sql, [sel_room]);
	sql = "INSERT INTO tblLink VALUES (0, ?, ?, ?, ?, ?);";
	ret = await infoQuery(sql, [room_idx, sel_room, ret[0].sName, pitch, yaw]);

	res.redirect('/vr_space_admin/' + room_idx);
});

app.get('/vr_building', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = 'SELECT * FROM tblBuild;';
	var build_list = await infoQuery(sql);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

	var ret_build = await get_build_detail();
	//var ret_build = await get_build_info("011440");

	console.log("ret_build", ret_build);

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

	res.render("vr_space_admin_buildingList", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, build_list: build_list, archin_list: ret_build, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/vr_archi_area', session_exists, async function (req, res) {
	var archiArea = req.body.archiArea;

	var sql = 'SELECT sArchiIndex FROM tblBuild;';
	var build_list = await infoQuery(sql);
	var myBuild_List = [];

	//console.log("myBuild_List",myBuild_List);

	for (var idx = 0; idx < build_list.length; idx++) {
		myBuild_List.push(build_list[idx].sArchiIndex);
	}

	var ret_build = await get_build_detail();

	var return_val = [];

	for (var idx = 0; idx < ret_build.length; idx++) {
		sql = "SELECT count(*) as tot FROM tblRoom WHERE sBuildCode=?;";
		var res_total = await infoQuery(sql, [ret_build[idx].bl_id]);
		var total = res_total[0].tot;

		if (archiArea == '1' && ret_build[idx].locate_sub == '1인문사회' && myBuild_List.includes(ret_build[idx].bl_id) && total > 0)
			return_val.push(ret_build[idx]);
		else if (archiArea == '2' && ret_build[idx].locate_sub == '2자연' && myBuild_List.includes(ret_build[idx].bl_id) && total > 0)
			return_val.push(ret_build[idx]);
		else if (archiArea == '3' && ret_build[idx].locate_sub == '3녹지' && myBuild_List.includes(ret_build[idx].bl_id) && total > 0)
			return_val.push(ret_build[idx]);
	}

	res.send({ archin_list: return_val });
});

app.post('/vr_archi_area_append', session_exists, async function (req, res) {
	var archiArea = req.body.archiArea;

	//var sql = 'SELECT sArchiIndex FROM tblBuild;';
	//var build_list = await infoQuery(sql);

	var ret_build = await get_build_detail();

	var return_val = [];

	for (var idx = 0; idx < ret_build.length; idx++) {

		if (archiArea == '1' && ret_build[idx].locate_sub == '1인문사회')
			return_val.push(ret_build[idx]);
		else if (archiArea == '2' && ret_build[idx].locate_sub == '2자연')
			return_val.push(ret_build[idx]);
		else if (archiArea == '3' && ret_build[idx].locate_sub == '3녹지')
			return_val.push(ret_build[idx]);
	}

	res.send({ archin_list: return_val });
});

app.post('/vr_archi_floor', session_exists, async function (req, res) {
	var buildCode = req.body.buildCode;

	var sql = 'SELECT nFloor FROM tblRoom WHERE sBuildCode=?;';
	var room_floor = await infoQuery(sql, [buildCode]);

	var myFloor_List = [];

	for (var idx = 0; idx < room_floor.length; idx++) {
		if (!myFloor_List.includes(room_floor[idx].nFloor))
			myFloor_List.push(room_floor[idx].nFloor);
	}

	console.log("myFloor_List", myFloor_List);

	var ret_build = await get_build_detail();

	var under_val;
	var floor_val;

	for (var idx = 0; idx < ret_build.length; idx++) {
		if (ret_build[idx].bl_id == buildCode) {
			floor_val = ret_build[idx].count_fl;
			under_val = ret_build[idx].count_bf;

			break;
		}
	}

	res.send({ floor: floor_val, under: under_val, room_floor: myFloor_List });
});

app.post('/vr_searh_room', session_exists, async function (req, res) {
	var buildCode = req.body.buildCode;

	var sql = 'SELECT * FROM tblRoom WHERE sBuildCode = ?;';
	var room_list = await infoQuery(sql, [buildCode]);

	res.send({ room_list: room_list });
});

app.post('/vr_archi_room', session_exists, async function (req, res) {
	var buildCode = req.body.buildCode;
	var floorValue = req.body.floorValue;


	var ret_build = await get_build_info(buildCode);

	var return_val = [];

	console.log('buildCode', buildCode);
	console.log('floorValue', floorValue);

	for (var idx = 0; idx < ret_build.length; idx++) {
		if (ret_build[idx].fl_id == floorValue)
			return_val.push(ret_build[idx]);
	}

	res.send({ room_list: return_val });
});

app.get('/vr_space_admin_buildingList_add', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_buildingList_add", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_admin_user', session_exists, async function (req, res) {
	//res.render("fixtures.html");
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_user", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_admin_user_modify', session_exists, async function (req, res) {
	//res.render("fixtures.html");
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_user_modify", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_admin_user_info', session_exists, async function (req, res) {
	//res.render("fixtures.html");
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_user_info", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_admin_user_add', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_user_add", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_building/info', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var build_code = req.query.blid;

	var sql = 'SELECT * FROM tblBuild WHERE sArchiIndex = ?;';
	var build_info = await infoQuery(sql, [build_code]);

	var ret_build = await get_build_detail();

	var archi_info = {};

	for (var index = 0; index < ret_build.length; index++) {
		if (build_code == ret_build[index].bl_id) {
			archi_info = ret_build[index];
			break;
		}
	}

	console.log("archi_info", archi_info);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_buildingList_info", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, build_info: build_info, archi_info: archi_info, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_device', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	console.log('app.get /list/device');

	/*
	var sql  = "SELECT c.sName sBuild,d.nFloor nFloor,d.sName sRoom,a.* ";
		sql += "FROM tblDevice a, tblUser b,tblBuild c,tblRoom d ";
		sql += "WHERE a.nBuild=c.nIndex AND a.nRoom=d.nIndex ";
		sql += "ORDER BY a.nIndex;";
	*/
	var sql = "SELECT * FROM tblDevice;";
	var db_res = await infoQuery(sql);

	var ret_build = await get_build_detail();

	for (var idx_db = 0; idx_db < db_res.length; idx_db++) {
		sql = 'SELECT sRoomNo,nFloor FROM tblRoom where nIndex = ?;';
		var room_info = await infoQuery(sql, [db_res[idx_db].nRoom]);

		if (room_info.length > 0) {
			db_res[idx_db].sRoom = room_info[0].sRoomNo;
			db_res[idx_db].nFloor = room_info[0].nFloor;
		}
		else {
			db_res[idx_db].sRoom = "존재하지 않음";
			db_res[idx_db].nFloor = "알 수 없음";
		}



		for (var idx_ret = 0; idx_ret < ret_build.length; idx_ret++) {
			if (ret_build[idx_ret].bl_id == db_res[idx_db].sBuildCode) {
				db_res[idx_db].sBuild = ret_build[idx_ret].name;

				break;
			}
		}
	}

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_product", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, dlist: db_res, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_device/add', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_product_add", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_room', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var room_list = [];
	/*
	var sql  = "SELECT b.sName sBuildName,b.nCampus campus,b.nAreaType area, a.* ";
		sql += "FROM tblRoom a, tblBuild b ";
		sql += "WHERE a.nBuildIndex=b.nIndex ORDER BY a.nIndex";
	*/

	var sql = "SELECT * FROM tblRoom ORDER BY nIndex";
	var db_room = await infoQuery(sql);

	var ret_build = await get_build_detail();

	for (var idx_db = 0; idx_db < db_room.length; idx_db++) {
		for (var idx_ret = 0; idx_ret < ret_build.length; idx_ret++) {
			if (ret_build[idx_ret].bl_id == db_room[idx_db].sBuildCode) {
				var json_obj = {
					nIndex: db_room[idx_db].nIndex,
					campus: 1,
					area: ret_build[idx_ret].locate_sub.substr(1),
					build_nm: ret_build[idx_ret].name,
					floor: db_room[idx_db].nFloor,
					name: db_room[idx_db].sName,
					location: db_room[idx_db].sLocation
				}

				room_list.push(json_obj);

				break;
			}
		}
	}

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_room", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, room_list: room_list, large_lists: large_lists, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/vrRoomAppend', upload.single('image'), async function (req, res) {
	console.log('app.post /append/room');

	const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file;
	/*
		fieldname: 폼에 정의된 필드명
		originalname: 사용자가 업로드한 파일 명
		encoding: 파일의 엔코딩 타입
		mimetype: 파일의 Mime 타입
		destination: 파일이 저장된 폴더
		filename: destination에 저장된 파일명
		path: 업로드된 파일의 전체 경로
		size: 파일의 바이트(byte 사이즈)
	*/
	var addRoom_area = req.body.addRoom_area;
	var addRoom_build = req.body.addRoom_build;
	var addRoom_floor = req.body.addRoom_floor;
	var addRoom_info = req.body.addRoom_info
	//var build_idx = Number (req.body.build_idx);
	//var floor     = Number (req.body.floor_idx);
	//var num_x     = Number (req.body.num_x);
	//var num_y     = Number (req.body.num_y);
	//var num_z     = Number (req.body.num_z);
	var image = req.body.image;
	var location = req.body.location;
	var save_file = '/assets/builds/' + filename;

	var ret_build = await get_build_info(addRoom_build);

	var room_name = "";
	var floor_val = 0;
	var room_no = "";

	for (var idx = 0; idx < ret_build.length; idx++) {
		if (ret_build[idx].rm_id == addRoom_info) {
			room_name = ret_build[idx].name + " (" + addRoom_info + ")";
			room_no = ret_build[idx].rm_id;

			if (ret_build[idx].fl_id.includes('BF')) {
				floor_val = parseInt(ret_build[idx].fl_id.substr(2)) * -1;
			}
			else {
				floor_val = parseInt(ret_build[idx].fl_id.substr(2));
			}
			break;
		}
	}

	/*
	var sql  = "INSERT INTO tblRoom (sName, nBuildIndex, nFloor, nX, nY, nZ, sImage) ";
		sql += "VALUES (?, ?, ?, ?, ?, ?, ?);";
	var db_res = await infoQuery (sql, [room_name, build_idx, floor, num_x, num_y, num_z, save_file]);
	*/

	var sql = "INSERT INTO tblRoom (sName, sRoomNo, sBuildCode, nFloor, sLocation, sImage) ";
	sql += "VALUES (?, ?, ?, ?, ?, ?);";
	var db_res = await infoQuery(sql, [room_name, room_no, addRoom_build, floor_val, location, save_file]);

	var insert_id = db_res.insertId;
	console.log(insert_id);

	sql = "SELECT * FROM tblBuild WHERE sArchiIndex = ?";
	var res_build = await infoQuery(sql, [addRoom_build]);

	if (res_build.length == 0) {
		var ret_build_detail = await get_build_detail();

		for (var idx_ret = 0; idx_ret < ret_build_detail.length; idx_ret++) {
			if (ret_build_detail[idx_ret].bl_id == addRoom_build) {
				console.log(ret_build_detail[idx_ret]);

				//round(ret_build[idx_ret].area_build * 1000.3025)/100
				sql = "INSERT INTO tblBuild (sName, nFloor, nUnder, sOwner, dMakeDate, nCampus, nAreaType, sArchiIndex, nManageType, fBuildingSizeM3, fTotalAreaM3, fTotalAreaReal, dPeriodStart, dPeriodEnd, nDefaultRoom) ";
				sql += "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";

				var insert_build = await infoQuery(sql, [ret_build_detail[idx_ret].name, ret_build_detail[idx_ret].count_fl, ret_build_detail[idx_ret].count_bf, "고려대", ret_build_detail[idx_ret].com_date_actual.substring(0, 10), 1, ret_build_detail[idx_ret].locate_sub.substring(0, 1), addRoom_build, 1
					, ret_build_detail[idx_ret].area_build, ret_build_detail[idx_ret].area_bd_sum, ret_build_detail[idx_ret].area_rm, ret_build_detail[idx_ret].date_groundbreak.substring(0, 10), ret_build_detail[idx_ret].com_date_actual.substring(0, 10), insert_id]);


				break;
			}
		}
	}

	var room_list = [];
	sql = "SELECT b.sName sBuildName, a.* ";
	sql += "FROM tblRoom a, tblBuild b ";
	sql += "WHERE a.nBuildIndex=b.nIndex ORDER BY a.nIndex";
	//room_list = await infoQuery (sql);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	//var large_lists = await infoQuery(sql);

	sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	//res.render ('vr_space_admin_room', {build_list: build_list});
	res.redirect("vr_room");
});

app.get('/vr_space_admin_buildingList_modify', session_exists, async function (req, res) {
	//res.render("fixtures.html");

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

	res.render("vr_space_admin_buildingList_modify", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_room/view', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var room_idx = req.query.index;

	var room_list = [];
	/*
	var sql  = "SELECT b.sName sBuildName,b.nCampus campus,b.nAreaType area, a.* ";
		sql += "FROM tblRoom a, tblBuild b ";
		sql += "WHERE a.nBuildIndex=b.nIndex AND a.nIndex=? ORDER BY a.nIndex";
	*/

	var sql = "SELECT * FROM tblRoom WHERE nIndex = ?;";

	var db_room = await infoQuery(sql, [room_idx]);

	var ret_build = await get_build_detail();

	for (var idx_ret = 0; idx_ret < ret_build.length; idx_ret++) {
		if (ret_build[idx_ret].bl_id == db_room[0].sBuildCode) {
			var json_obj = {
				nIndex: db_room[0].nIndex,
				campus: 1,
				area: ret_build[idx_ret].locate_sub.substr(1),
				build_nm: ret_build[idx_ret].name,
				floor: db_room[0].nFloor,
				name: db_room[0].sName,
				location: db_room[0].sLocation,
				image: db_room[0].sImage
			}

			room_list.push(json_obj);

			break;
		}
	}

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_room_info", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, room_list: room_list, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/vrRoomDelete', session_exists, async function (req, res) {
	var index = req.body.index;

	var sql = "DELETE FROM tblRoom WHERE nIndex=?;";
	var db_del = await infoQuery(sql, [index]);

	sql = "DELETE FROM tblLink WHERE nLinkRoom=?;";
	db_res = await infoQuery(sql, [index]);

	res.send(true);
});

app.get('/vr_room/modify', session_exists, async function (req, res) {
	//res.render("fixtures.html");
	var room_idx = req.query.index;

	var room_list = [];
	var build_list = [];

	var sel_area = 0;

	var fl_val = 0;
	var bf_val = 0;

	/*
	var sql  = "SELECT b.nIndex sBuildIndex,b.nFloor floor,b.nUnder under,b.nCampus campus,b.nAreaType area, a.* ";
		sql += "FROM tblRoom a, tblBuild b ";
		sql += "WHERE a.nBuildIndex=b.nIndex AND a.nIndex=? ORDER BY a.nIndex";
	*/

	var sql = "SELECT * FROM tblRoom WHERE nIndex = ?;";
	var db_room = await infoQuery(sql, [room_idx]);

	build_list = await get_build_detail();
	room_list = await get_build_info(db_room[0].sBuildCode);

	for (var idx_ret = 0; idx_ret < build_list.length; idx_ret++) {
		if (build_list[idx_ret].bl_id == db_room[0].sBuildCode) {
			if (build_list[idx_ret].locate_sub == '1인문사회')
				sel_area = 1;
			else if (build_list[idx_ret].locate_sub == '2자연')
				sel_area = 2;
			else if (build_list[idx_ret].locate_sub == '3녹지')
				sel_area = 3;

			fl_val = build_list[idx_ret].count_fl;
			bf_val = build_list[idx_ret].count_bf;

			break;
		}
	}

	console.log("fl_val", fl_val);
	console.log("bf_val", bf_val);

	sql = "SELECT * FROM tblBuild ORDER BY nIndex;";
	//var db_build = await infoQuery (sql);

	var sel_build = room_list[0].sBuildIndex;

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_room_modify", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, room_list: room_list, build_list: build_list, db_room: db_room, sel_area: sel_area, fl_val: fl_val, bf_val: bf_val, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/vrRoomModify', upload.single('image'), async function (req, res) {
	//const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file;
	/*
		fieldname: 폼에 정의된 필드명
		originalname: 사용자가 업로드한 파일 명
		encoding: 파일의 엔코딩 타입
		mimetype: 파일의 Mime 타입
		destination: 파일이 저장된 폴더
		filename: destination에 저장된 파일명
		path: 업로드된 파일의 전체 경로
		size: 파일의 바이트(byte 사이즈)
	*/
	var room_idx = req.body.room_index;
	var modify_area = req.body.modify_area;
	var room_name = req.body.room_name;
	//var build_idx = Number (req.body.build_idx);
	var build_idx = req.body.build_idx;
	//var floor_idx     = Number (req.body.floor_idx);
	var floor_idx = req.body.floor_idx;
	//var num_x     = Number (req.body.modify_nX);
	//var num_y     = Number (req.body.modify_nY);
	//var num_z     = Number (req.body.modify_nZ);
	var location = req.body.modify_location;
	var image = req.body.image;
	var file_name = req.body.file_name;

	var file_input = req.body.file_input;
	console.log("file_input", file_input);
	var save_file = file_name;

	if (file_input == "1") {
		const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file;
		save_file = '/assets/builds/' + filename;
	}

	//var save_file = '/assets/builds/' + file_name;

	var room_no = "";

	console.log("room_idx", room_idx);
	console.log("modify_area", modify_area);
	console.log("room_name", room_name);
	console.log("build_idx", build_idx);
	console.log("floor_idx", floor_idx);

	var room_sName = "";
	var floor_value = 0;

	var room_list = await get_build_info(build_idx);

	for (var index = 0; index < room_list.length; index++) {
		if (room_name == room_list[index].rm_id) {
			//console.log("room_list",room_list[index]);

			room_sName = room_list[index].name + " (" + room_list[index].rm_id + ")";
			room_no = room_list[index].rm_id;
			break;
		}
	}

	if (floor_idx.includes('BF')) {
		floor_value = parseInt(floor_idx.substr(2)) * -1;
	}
	else {
		floor_value = parseInt(floor_idx.substr(2));
	}

	//console.log("room_sName",room_sName);

	/*
	var sql  = "UPDATE tblRoom ";
		sql += "SET sName=?,nBuildIndex=?,nFloor=?,nX=?,nY=?,nZ=?,sImage=? ";
		sql += "WHERE nIndex=?;";
	var db_res = await infoQuery (sql, [room_name,build_idx, floor_idx, num_x, num_y, num_z, save_file, room_idx]);
	*/

	var sql = "UPDATE tblRoom ";
	sql += "SET sName=?,sRoomNo=?,sBuildCode=?,nFloor=?,sLocation=?,sImage=? ";
	sql += "WHERE nIndex=?;";
	var db_res = await infoQuery(sql, [room_sName, room_no, build_idx, floor_value, location, save_file, room_idx]);

	res.redirect("vr_room");
});

app.get('/vr_space_admin_room_add', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var build_list = [];
	var sql = "SELECT * FROM tblBuild ORDER BY nIndex";
	build_list = await infoQuery(sql);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_room_add", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, build_list: build_list, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_device/view', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var device_idx = req.query.index;
	/*
	var sql  = "SELECT b.sName sBuild,b.nCampus campus,b.nAreaType area,c.sName sRoom,c.nFloor floor,d.sName sUser,a.* ";
		sql += "FROM tblDevice a,tblBuild b,tblRoom c,tblUser d ";
		sql += "WHERE a.nIndex=? AND a.nBuild=b.nIndex AND a.nRoom=c.nIndex AND a.nUseridx=d.nIndex;";
	var device_res = await infoQuery (sql, [device_idx]);
	*/

	var sql = "SELECT * FROM tblDevice WHERE nIndex=?;";
	var device_res = await infoQuery(sql, [device_idx]);

	var ret_build = await get_build_detail();

	for (var idx_db = 0; idx_db < device_res.length; idx_db++) {
		sql = 'SELECT sRoomNo,nFloor FROM tblRoom where nIndex = ?;';
		var room_info = await infoQuery(sql, [device_res[idx_db].nRoom]);

		if (room_info.length > 0) {
			device_res[idx_db].sRoom = room_info[0].sRoomNo;
			device_res[idx_db].nFloor = room_info[0].nFloor;
		}
		else {
			device_res[idx_db].sRoom = "존재하지 않음";
			device_res[idx_db].nFloor = "알 수 없음";
		}



		for (var idx_ret = 0; idx_ret < ret_build.length; idx_ret++) {
			if (ret_build[idx_ret].bl_id == device_res[idx_db].sBuildCode) {
				device_res[idx_db].sBuild = ret_build[idx_ret].name;

				if (ret_build[idx_ret].locate_sub == '1인문사회')
					device_res[idx_db].area = 1;
				else if (ret_build[idx_ret].locate_sub == '2자연')
					device_res[idx_db].area = 2;
				else if (ret_build[idx_ret].locate_sub == '3녹지')
					device_res[idx_db].area = 3;

				break;
			}
		}
	}

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_product_info", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, device_res: device_res, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/vrDeviceDelete', session_exists, async function (req, res) {
	var index = req.body.index;

	var sql = "DELETE FROM tblDevice WHERE nIndex=?;";
	var db_del = await infoQuery(sql, [index]);

	res.send(true);
});

app.post('/vrLinkDelete', session_exists, async function (req, res) {
	var index = req.body.index;

	console.log("vrLinkDelete");

	var sql = "DELETE FROM tblLink WHERE nIndex=?;";
	var db_del = await infoQuery(sql, [index]);

	res.send(true);
});

app.get('/vr_device/modify', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var device_idx = req.query.index;
	var sql = "SELECT * FROM tblDevice WHERE nIndex=?;";
	var device_res = await infoQuery(sql, [device_idx]);

	var sel_build = device_res[0].sBuildCode;
	var sel_Area = 0;
	var fl_val = 0;
	var bf_val = 0;

	var build_list = [];
	//sql  = "SELECT * FROM tblBuild ORDER BY nIndex;";
	//build_list = await infoQuery (sql);

	var ret_build = await get_build_detail();

	for (var idx_ret = 0; idx_ret < ret_build.length; idx_ret++) {

		if (ret_build[idx_ret].bl_id == sel_build) {

			if (ret_build[idx_ret].locate_sub == '1인문사회')
				sel_Area = 1;
			else if (ret_build[idx_ret].locate_sub == '2자연')
				sel_Area = 2;
			else if (ret_build[idx_ret].locate_sub == '3녹지')
				sel_Area = 3;

			fl_val = ret_build[idx_ret].count_fl;
			bf_val = ret_build[idx_ret].count_bf;

			break;
		}
	}

	for (var idx_ret = 0; idx_ret < ret_build.length; idx_ret++) {
		if (ret_build[idx_ret].locate_sub == '1인문사회' && sel_Area == 1) {
			build_list.push(ret_build[idx_ret]);
		}
		else if (ret_build[idx_ret].locate_sub == '2자연' && sel_Area == 2) {
			build_list.push(ret_build[idx_ret]);
		}
		else if (ret_build[idx_ret].locate_sub == '3녹지' && sel_Area == 3) {
			build_list.push(ret_build[idx_ret]);
		}
	}

	sql = "SELECT * FROM tblBuild WHERE nIndex=?;";
	var build_info = await infoQuery(sql, [sel_build]);

	var room_list = [];
	sql = "SELECT * FROM tblRoom WHERE nIndex=?;";
	room_list = await infoQuery(sql, [device_res[0].nRoom]);

	var sel_room = "0";
	/*
	var res_room = await get_build_info(sel_build);

	if(room_list.length > 0)
	{
		for(var idx_ret = 0; idx_ret < res_room.length; idx_ret++)
		{

			if(res_room[idx_ret].name == room_list[0].sName)
			{
				sel_room = res_room[idx_ret].rm_id;
				break;
			}
		}
	}
	*/

	sql = "SELECT * FROM tblRoom WHERE sBuildCode=?;";
	var res_room = await infoQuery(sql, [device_res[0].sBuildCode]);

	var user_list = [];
	sql = "SELECT * FROM tblUser ORDER BY nIndex";
	user_list = await infoQuery(sql);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

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

	res.render("vr_space_admin_product_modify", {
		idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode,
		large_lists: large_lists, device_res: device_res, build_list: build_list, room_list: room_list, user_list: user_list, sel_build: sel_build, sel_Area: sel_Area, sel_room: sel_room, build_info: build_info, res_room: res_room, fl_val: fl_val, bf_val: bf_val, authority_list: authority_list, sel_authority: req.session.user.selectAuithority
	});
});

app.post('/vrDeviceModify', session_exists, async function (req, res) {

	var index = req.body.index;
	var campus = req.body.campus;
	var area = req.body.area;
	var build = req.body.build;
	var room = req.body.room;
	var yaw = req.body.yaw;
	var pitch = req.body.pitch;
	var no = req.body.no;
	var name = req.body.name;
	var type = req.body.type;
	var user = req.body.user;
	var model = req.body.model;
	var maker = req.body.maker;
	var price = req.body.price;
	var buyday = req.body.buyday;

	var sql = "UPDATE tblDevice ";
	sql += "SET sFixtureNo=?,sName=?,sBuildCode=?,nRoom=?,nYaw=?,nPitch=?,sModel=?,sType=?,sMaker=?,nPrice=?,dBuy=DATE_FORMAT(?,'%Y-%m-%d'),nUseridx=? ";
	sql += "WHERE nIndex=?;";
	var db_res = await infoQuery(sql, [no, name, build, room, yaw, pitch, model, type, maker, price, buyday, user, index]);

	/*
	sql  = "SELECT b.sName sBuild,c.sName sRoom,d.sName sUser,a.* ";
		sql += "FROM tblDevice a,tblBuild b,tblRoom c,tblUser d ";
		sql += "WHERE a.nIndex=? AND a.nBuild=b.nIndex AND a.nRoom=c.nIndex AND a.nUseridx=d.nIndex;";
	var device_res = await infoQuery (sql, [index]);
	*/

	var sql = "SELECT * FROM tblDevice WHERE nIndex=?;";
	var device_res = await infoQuery(sql, [index]);

	sql = 'SELECT nIndex,sName FROM tblBuild;';
	var large_lists = await infoQuery(sql);

	sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	res.render("vr_space_admin_product_info", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, large_lists: large_lists, device_res: device_res });

	//res.send(true);
});

app.get('/vr_space_admin_product_modify', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_product_modify", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_admin_product_info_popup', session_exists, async function (req, res) {
	//res.render("fixtures.html");
	//var buildNo = req.query.buildNo;
	//var room_no = req.query.roomNo;

	var buildNo = req.query.buildNo;
	//var buildNo = "011310";
	var room_no = req.query.roomNo;
	//var room_no = "103";

	var sql = "";

	sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate FROM tblFixture WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus='사용' LIMIT 20 OFFSET 0;";

	var fix_infos = await directQuery(sql, [buildNo, room_no]);

	sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate FROM tblFixture WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus='사용';";

	var pinfos = await directQuery(sql, [buildNo, room_no]);

	var nStart = 0;
	var total = pinfos.length;

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;

	var page_data = {
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'buildNo': buildNo,
		'roomNo': room_no
	};

	res.render("vr_space_admin_product_info_popup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, fix_infos: fix_infos, page_data: page_data });
});

app.post('/vrFixtureSearch', session_exists, async function (req, res) {
	var fixNo = req.body.fixNo;

	var sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate,sFixturePrice FROM tblFixture WHERE sFixtureNo=? ";
	var fix_info = await directQuery(sql, [fixNo]);

	res.send({ fix_info: fix_info });
});

app.post('/vrFixtureInfoSearch', session_exists, async function (req, res) {
	var buildNo = req.body.build;
	var room_no = req.body.room;
	var nStart = 0;
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;

	var fix_infos = [];
	var pinfos = [];
	var sql = "";
	var exsql = "";

	switch (parseInt(ssearch)) {
		case 1: exsql += 'AND sFixtureType LIKE ? '; break; // 분류
		case 2: exsql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 3: exsql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 4: exsql += 'AND sFixtureMaker LIKE ? OR sFixtureModel LIKE ? '; break; // 모델명(제조사)
		case 5: exsql += 'AND sOrg LIKE ? '; break; // 관리부서
		case 6: exsql += 'AND dFixtureDate=? '; break; // 취득일자
	}

	sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate FROM tblFixture WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus='사용' ";
	sql += exsql;

	if (parseInt(ssearch) == 4) {
		pinfos = await directQuery(sql, [buildNo, room_no, sname, sname]);
	}
	else {
		pinfos = await directQuery(sql, [buildNo, room_no, sname]);
	}

	var total = pinfos.length;

	if (total > 0) {
		sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate FROM tblFixture WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus='사용' ";
		sql += exsql;
		sql += "LIMIT 20 OFFSET 0;";

		if (parseInt(ssearch) == 4) {
			fix_infos = await directQuery(sql, [buildNo, room_no, sname, sname]);
		}
		else {
			fix_infos = await directQuery(sql, [buildNo, room_no, sname]);
		}
	}

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;

	var page_data = {
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'buildNo': buildNo,
		'roomNo': room_no
	};

	res.send({ fix_infos: fix_infos, page_data: page_data });
});

app.post('/vrFixturePage', session_exists, async function (req, res) {
	var buildNo = req.body.build;
	var room_no = req.body.room;
	var nStart = req.body.nstart;

	var fix_infos = [];

	var sql = "";

	sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate FROM tblFixture WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus='사용';";

	var pinfos = await directQuery(sql, [buildNo, room_no]);

	var total = pinfos.length;

	console.log(total);

	if (total > 0) {
		sql = "SELECT sFixtureType,sFixtureNo,sFixtureName,sFixtureMaker,sFixtureModel,sOrg,dFixtureDate FROM tblFixture WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus='사용' LIMIT 20 OFFSET ?;";

		fix_infos = await directQuery(sql, [buildNo, room_no, Number(nStart * 20)]);
	}

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;

	var page_data = {
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'buildNo': buildNo,
		'roomNo': room_no
	};


	res.send({ fix_infos: fix_infos, page_data: page_data });
});

app.get('/vr_productInfo_popup', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	res.render("vr_productInfo_popup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode });
});

app.get('/vr_space_admin_product_add_completion', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_product_add_completion", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/vr_space_admin_room_add2', session_exists, async function (req, res) {
	//res.render("fixtures.html");

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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

	res.render("vr_space_admin_room_add2", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/super_delegationList', session_exists, async function (req, res) {
	//res.render("fixtures.html");
	var sql = 'SELECT distinct(b.sNameKor) org, b.sDepartmentCode dptCode,a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name, a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
	sql += 'FROM tblUser a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.nPermission <= 3 and a.nPermission != 0 and a.sPortal != ""';
	var res_org = await directQuery(sql);

	var concurrent_list = [];

	sql = 'SELECT distinct(b.sNameKor) dptName, a.sDepartmentCode dptCode, a.sUserNumber employeeNum ';
	sql += 'FROM tblConcurrentDPT a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.sUserNumber = ?';

	for (var idx = 0; idx < res_org.length; idx++) {
		var res_con = await directQuery(sql, [res_org[idx].employeeNum]);

		if (res_con.length > 0) {
			for (var jdx = 0; jdx < res_con.length; jdx++) {
				concurrent_list.push(res_con[jdx]);
			}
		}
	}

	res.render("super_delegationList", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, res_org: res_org, concurrent_list: concurrent_list });
});

app.get('/super_authorityDelegation', session_exists, async function (req, res) {

	var sql = 'SELECT distinct(b.sNameKor) org, b.sDepartmentCode dptCode, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name, a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
	sql += 'FROM tblUser a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.nPermission = 4 and a.sPortal != ""';
	var res_org = await directQuery(sql);

	var result_list = [];

	//var resp_per = await get_personal_per();

	//console.log(resp_per);

	res.render("super_authorityDelegation", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, res_org: res_org });
});

app.post('/searchSuperAuthority', async function (req, res) {

	var search_index = req.body.search_index;
	var search_value = req.body.search_value;

	var sql = 'SELECT distinct(b.sNameKor) org, b.sDepartmentCode dptCode, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name, a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
	sql += 'FROM tblUser a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.nPermission = 4';
	//var res_org = await directQuery(sql);

	if (search_index == 0) // 포탈 아이디
	{
		sql += ' and a.sPortal = ?';
	}
	else if (search_index == 1) // 교직원 번호
	{
		sql += ' and a.sNumber = ?';
	}
	else if (search_index == 2) // 이름
	{
		sql += ' and a.sName = ?';
	}
	else if (search_index == 3) // 소속부서
	{
		search_value = "%" + search_value + "%";
		sql += ' and b.sOrgName LIKE ?';
	}
	else if (search_index == 4) // 이메일
	{
		sql += ' and a.sEMail = ?';
	}
	else if (search_index == 5) // 연락처
	{
		sql += ' and a.sTel = ?';
	}

	var res_org = await directQuery(sql, [search_value]);

	res.send({ search_list: res_org });
});

app.get('/super_departmentChange', session_exists, async function (req, res) {

	var sql = 'SELECT distinct(b.sNameKor) org, b.sDepartmentCode dptCode, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name, a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
	sql += 'FROM tblUser a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.nPermission <= 3 and a.nPermission != 0 and a.sPortal != ""';
	var res_org = await directQuery(sql);

	var concurrent_list = [];

	sql = 'SELECT distinct(b.sNameKor) dptName, a.sDepartmentCode dptCode, a.sUserNumber employeeNum ';
	sql += 'FROM tblConcurrentDPT a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.sUserNumber = ?';

	for (var idx = 0; idx < res_org.length; idx++) {
		var res_con = await directQuery(sql, [res_org[idx].employeeNum]);

		if (res_con.length > 0) {
			for (var jdx = 0; jdx < res_con.length; jdx++) {
				concurrent_list.push(res_con[jdx]);
			}
		}
	}

	//var resp_per = await get_personal_per();

	//console.log("concurrent_list",concurrent_list);

	res.render("super_departmentChange", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, res_org: res_org, concurrent_list: concurrent_list });
});

app.post('/searchSuperDepartment', async function (req, res) {

	var search_index = req.body.search_index;
	var search_value = req.body.search_value;

	var sql = 'SELECT distinct(b.sNameKor) org, b.sDepartmentCode dptCode, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name, a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
	sql += 'FROM tblUser a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.nPermission <= 3 and a.nPermission != 0 and a.sPortal != ""';
	//var res_org = await directQuery(sql);

	if (search_index == 0) // 포탈 아이디
	{
		sql += ' and a.sPortal = ?';
	}
	else if (search_index == 1) // 교직원 번호
	{
		sql += ' and a.sNumber = ?';
	}
	else if (search_index == 2) // 이름
	{
		sql += ' and a.sName = ?';
	}
	else if (search_index == 3) // 소속부서
	{
		search_value = "%" + search_value + "%";
		sql += ' and b.sNameKor LIKE ?';
	}
	else if (search_index == 4) // 이메일
	{
		sql += ' and a.sEMail = ?';
	}
	else if (search_index == 5) // 연락처
	{
		sql += ' and a.sTel = ?';
	}

	var res_org = await directQuery(sql, [search_value]);

	var concurrent_list = [];

	sql = 'SELECT distinct(b.sNameKor) dptName, a.sDepartmentCode dptCode, a.sUserNumber employeeNum ';
	sql += 'FROM tblConcurrentDPT a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.sUserNumber = ?';

	for (var idx = 0; idx < res_org.length; idx++) {
		var res_con = await directQuery(sql, [res_org[idx].employeeNum]);

		if (res_con.length > 0) {
			for (var jdx = 0; jdx < res_con.length; jdx++) {
				concurrent_list.push(res_con[jdx]);
			}
		}
	}

	res.send({ search_list: res_org, concurrent_list: concurrent_list });
});

app.get('/departmentchange', session_exists, async function (req, res) {

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("departmentchange", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, orgIdx: req.session.user.orgIdx, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/changeDepartment', session_exists, async function (req, res) {
	var userNo = req.body.userNo;
	var dptCode = req.body.dptCode;

	console.log("changeDepartment");

	var sql = "UPDATE tblUser SET sDepartmentCode=? WHERE sNumber=?";
	await directQuery(sql, [dptCode, userNo]);

	res.send({ result: "success" });
});

app.get('/concurrentlist', session_exists, async function (req, res) {

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("concurrentlist", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, orgIdx: req.session.user.orgIdx, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/getConcurrent', session_exists, async function (req, res) {
	var userNo = req.body.userNo;

	var concurrent_list = [];

	var sql = 'SELECT distinct(b.sNameKor) dptName, a.sDepartmentCode dptCode, a.sUserNumber employeeNum ';
	sql += 'FROM tblConcurrentDPT a,tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode=b.sDepartmentCode and a.sUserNumber = ?';

	var res_con = await directQuery(sql, [userNo]);

	if (res_con.length > 0) {
		for (var jdx = 0; jdx < res_con.length; jdx++) {
			concurrent_list.push(res_con[jdx]);
		}
	}

	res.send({ concurrent_list: concurrent_list });
});

app.post('/concurrent_search', async function (req, res) {
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;

	var user_idx = req.session.user.userid;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	var sql = "SELECT distinct(sNameKor) dptName, sDepartmentCode dptCode FROM tblDepartment WHERE nUseYN=1 ";

	var qsname = "%" + sname + "%";
	switch (parseInt(ssearch)) {
		case 0: sql += 'AND sNameKor LIKE ? '; break; // 부서명
		case 1: sql += 'AND sDepartmentCode LIKE ? '; break; // 부서코드
	}

	var dpt_list = await directQuery(sql, [qsname]);
	res.send({ dpt_list: dpt_list });
});

app.post('/concurrent_confirm', async function (req, res) {
	var userNo = req.body.userNo;
	var dptNo = req.body.dptNo;

	var sql = "DELETE FROM tblConcurrentDPT WHERE sUserNumber=?;";
	await directQuery(sql, [userNo]);

	/*
	sql = 'INSERT INTO tblConcurrentDPT(sUserNumber,sDepartmentCode) VALUES(?,?);';
	await directQuery(sql, [userNo,dptNo]);
	*/

	sql = 'INSERT INTO tblConcurrentDPT(sUserNumber,sDepartmentCode) VALUES(?,?);';

	for (var idx = 0; idx < dptNo.length; idx++) {
		await directQuery(sql, [userNo, dptNo[idx]]);
	}

	res.send({ result: true });
});

app.get('/reusable_market', session_exists, async function (req, res) {
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
	res.render("reusable_market", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, rinfos: rinfos, rinfos_reus: rinfos_reus, rinfos_share: rinfos_share, nIndex: nIndex, user_email: user_email, user_phone: user_phone, permission_reusable: req.session.user.permission_reusable, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

//test_popup
// app.get(['/CheckMyItems_Popup'], session_exists, async function (req, res) {
// 	res.render("CheckMyItems_Popup");
// });

//새로운 부분 추가//
// app.get('/reusable_market_new', session_exists, async function (req, res) {
// 	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
// 	var authority_list = await directQuery(sql, [req.session.user.userid]);

// 	sql = "SELECT * FROM tblUser WHERE sNumber=?";

// 	for (var idx = 0; idx < authority_list.length; idx++) {
// 		if (authority_list[idx].sStdId == "210597") {
// 			authority_list[idx].sName = "원격교육센터 02";
// 		}
// 		else if (authority_list[idx].sStdId == "597210") {
// 			authority_list[idx].sName = "테스트자산관리01";
// 		}
// 		else if (authority_list[idx].sStdId == "666308") {
// 			authority_list[idx].sName = "테스트자산관리02";
// 		}
// 		else {
// 			var result = await directQuery(sql, [authority_list[idx].sStdId]);

// 			if (result.length > 0) {
// 				authority_list[idx].sName = result[0].sName;
// 			}
// 			else {
// 				authority_list[idx].sName = "데이터 없음";
// 			}
// 		}

// 	}

// 	res.render("reusable_market_new", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
// });


/// reusable_market_new 종료
app.get('/reusable_market_new', session_exists, async function (req, res) {
	var nIndex = 0;
	var user_email = req.session.user['email'];
	var user_phone = req.session.user['tel'];

	// 검색 파라미터 받기
	const searchType = req.query.searchType || '0';
	const searchKeyword = req.query.searchKeyword || '';


	// 현재 사용자가 등록한 모든 진행 중인 물품 조회 (제한 없음)
	const userProgressQuery = `
	 SELECT a.*, b.sImgPath, b.sImgBin 
	 FROM tblReusable a 
	 LEFT JOIN tblReusableImg b ON a.nReusableNo = b.nReusableIdx 
	 WHERE a.sReusableUserNo = ? 
	 AND a.nReusableState = 1 
	 ORDER BY a.nReusableNo DESC`;

	const progressItems = await directQuery(userProgressQuery, [req.session.user.userid]);

	// 슬라이드 그룹으로 나누기
	const itemsPerSlide = 7;
	const slideGroups = [];
	for (let i = 0; i < progressItems.length; i += itemsPerSlide) {
		slideGroups.push(progressItems.slice(i, i + itemsPerSlide));
	}

	// 기본 쿼리문
	let baseQuery = 'SELECT a.*, b.sImgPath, b.sImgBin, ap.nReusableNo,ap.nApprovalState, ap.nApprovalType FROM carbonKU.tblReusable a JOIN carbonKU.tblReusableImg b ON a.nReusableNo = b.nReusableIdx LEFT JOIN carbonKU.tblApproval ap ON a.nReusableNo = ap.nReusableNo WHERE (a.nApplicantState < 2 OR a.nReusableState < 2)';
	// 검색 조건 추가
	if (searchKeyword && searchType !== '0') {
		switch (searchType) {
			case '1': // 전체
				baseQuery += ` AND (a.sReusableName LIKE ? OR a.sReusableMemo LIKE ? OR a.sReusablePlace LIKE ?)`;
				break;
			case '2': // 제목
				baseQuery += ` AND a.sReusableName LIKE ?`;
				break;
			case '3': // 내용	
				baseQuery += ` AND a.sReusableMemo LIKE ?`;
				break;
		}
	}



	// 페이지네이션 설정s
	const page = parseInt(req.query.page) || 1;
	const itemsPerPage = 12; // 페이지당 12개 아이템
	const offset = (page - 1) * itemsPerPage;

	// 전체 아이템 수를 가져오는 쿼리
	let countQuery = baseQuery.replace('SELECT a.*,b.sImgPath,b.sImgBin', 'SELECT COUNT(*) as total');
	countQuery = countQuery.split('ORDER BY')[0];

	// 페이지네이션을 위한 LIMIT과 OFFSET 추가
	baseQuery = baseQuery.split('ORDER BY')[0]; // 기존 ORDER BY 제거
	baseQuery += ' ORDER BY a.nReusableNo DESC LIMIT ? OFFSET ?'; // DESC 추가하여 최신순 정렬

	//var sql = 'SELECT * FROM tblReusable WHERE nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
	//var sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	// 쿼리 파라미터 설정
	let queryParams = [];
	if (searchKeyword && searchType !== '0') {
		if (searchType === '1') { // 전체 검색
			const likeParam = `%${searchKeyword}%`;
			queryParams = [likeParam, likeParam, likeParam, itemsPerPage, offset];
		} else if (searchType === '2' || searchType === '3') { // 제목 또는 내용 검색
			queryParams = [`%${searchKeyword}%`, itemsPerPage, offset];
		}
	} else {
		queryParams = [itemsPerPage, offset];
	}

	// 전체 개수와 페이지 데이터 조회
	const countResult = await directQuery(countQuery, queryParams.slice(0, -2));
	const totalItems = countResult[0].total;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	// 데이터 조회
	const rinfos = await directQuery(baseQuery, queryParams);

	// 검색 쿼리 처리
	// 검색 쿼리 처리


	//const rinfos = await directQuery(sql, params);
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
	baseQuery = baseQuery.replace('WHERE', 'WHERE a.nReusableShare=0 AND');
	var rinfos_reus = await directQuery(baseQuery, queryParams);


	//sql = 'SELECT * FROM tblReusable WHERE nReusableShare=1 AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
	//sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.nReusableShare=1 AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	baseQuery = baseQuery.replace('nReusableShare=0', 'nReusableShare=1');
	var rinfos_share = await directQuery(baseQuery, queryParams);

	// // 재사용 허락 쿼리 
	// sql = "SELECT r.*, a.* FROM carbonKU.tblReusable r JOIN carbonKU.tblApproval a ON r.nReusableNo = a.nReusableNo WHERE r.nReusableShare = 0 AND a.nApprovalState = 4";
	// var rinfos_reus_approval = await directQuery(sql);

	//email: 'kbw5636@kounosoft.com',
	//tel: '010-9318-5636',

	sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	sql = "SELECT * FROM tblUser WHERE sNumber=?";
	var User_list = await directQuery(sql, [req.session.user.userid]);

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
	res.render("reusable_market_new", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, rinfos: rinfos, rinfos_reus: rinfos_reus, rinfos_share: rinfos_share, nIndex: nIndex, user_email: user_email, user_phone: user_phone, searchType: searchType, searchKeyword: searchKeyword, permission_reusable: req.session.user.permission_reusable, authority_list: authority_list, sel_authority: req.session.user.selectAuithority, currentPage: page, totalPages: totalPages, searchType: searchType, searchKeyword: searchKeyword, slideGroups: slideGroups, progressItems: progressItems, userName: req.session.user.name, User_list: User_list });
});

// 수정 post 

app.post('/reusable/update-progress', async (req, res) => {
	let connection;
	try {
		console.log('Received request body:', {
			...req.body,
			reusableImgBin: req.body.reusableImgBin ? 'BASE64_STRING' : null
		});

		const {
			reusableNo,
			title,
			content,
			reusableImg,
			reusableImgBin
		} = req.body;

		// 입력값 검증
		if (!reusableNo) {
			return res.status(400).json({
				success: false,
				message: 'Reusable number is required'
			});
		}

		// DB 연결
		const pool = mysql.createPool({
			connectionLimit: 250,
			connectTimeout: 30000,
			host: '127.0.0.1',
			user: 'root',
			password: '!kouno0815',
			database: 'carbonKU'
		});

		// 연결 가져오기
		connection = await new Promise((resolve, reject) => {
			pool.getConnection((err, conn) => {
				if (err) reject(err);
				resolve(conn);
			});
		});

		// tblReusable 업데이트
		console.log('Updating tblReusable...');
		await new Promise((resolve, reject) => {
			connection.query(
				'UPDATE tblReusable SET sReusableName = ?, sReusableMemo = ? WHERE nReusableNo = ?',
				[title, content, reusableNo],
				(err, result) => {
					if (err) reject(err);
					resolve(result);
				}
			);
		});

		// 이미지 처리
		if (reusableImg && reusableImgBin) {
			console.log('Processing image...');

			// 이미지 존재 여부 확인
			const [checkResult] = await new Promise((resolve, reject) => {
				connection.query(
					'SELECT COUNT(*) as count FROM tblReusableImg WHERE nReusableIdx = ?',
					[reusableNo],
					(err, result) => {
						if (err) reject(err);
						resolve(result);
					}
				);
			});

			if (checkResult.count > 0) {
				// UPDATE
				await new Promise((resolve, reject) => {
					connection.query(
						'UPDATE tblReusableImg SET sImgBin = ?, sImgPath = ? WHERE nReusableIdx = ?',
						[reusableImgBin, 'main_' + reusableImg, reusableNo],
						(err, result) => {
							if (err) reject(err);
							resolve(result);
						}
					);
				});
			} else {
				// INSERT
				await new Promise((resolve, reject) => {
					connection.query(
						'INSERT INTO tblReusableImg (nReusableIdx, sImgBin, sImgPath) VALUES (?, ?, ?)',
						[reusableNo, reusableImgBin, 'main_' + reusableImg],
						(err, result) => {
							if (err) reject(err);
							resolve(result);
						}
					);
				});
			}
		}

		console.log('Update completed successfully');
		res.json({
			success: true,
			message: '수정이 완료되었습니다.'
		});

	} catch (error) {
		console.error('Server error:', error);
		res.status(500).json({
			success: false,
			message: '서버 처리 중 오류가 발생했습니다',
			error: error.message
		});
	} finally {
		if (connection) {
			connection.release(); // 연결 반환
		}
	}
});


// 바뀌지좀 마라 
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
			nReusableRank: data.reusable_rank,
			nReusableEtc: data.reusable_etc || ''  // 추가된 부분

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


// create_reusable 복구
// app.post('/create_reusable', async function (req, res) {

// 	var data = JSON.parse(req.body.data);

// 	var reusable_name = data.reusable_name;
// 	var reusable_type = data.reusable_type;
// 	var reusable_contnet = data.reusable_contnet;
// 	var reusable_memo = data.reusable_memo;
// 	var reusable_place = data.reusable_place;
// 	var reusable_rank = data.reusable_rank;
// 	var user_email = data.user_email;
// 	var user_phone = data.user_phone;
// 	var reusable_price = data.fixture_price;
// 	var reusable_date = data.fixture_date;
// 	var reusable_UserNo = req.session.user['userid'];
// 	var prev_name = req.session.user['name'];
// 	var now_name = req.session.user['name'];

// 	var reusable_share = 0;

// 	var reusable_number = data.fixture_no; // 이걸 받아서 연결해보기 

// 	let sql = 'INSERT INTO `tblReusable`(sReusableName, sReusableType, sReusableContent, sReusableMemo, sReusablePlace,sReusableUserNo, sReusableEmail, sReusableMobile,nReusableShare,sFixtureNo,sFixtureName,sFixtureType,dFixturePrice,dFixtureDate,sReusableNowUser,sReusablePrevUser,nReusableRank) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?);';

// 	const createReusableManager = await directQuery(sql, [reusable_name, reusable_type, reusable_contnet, reusable_memo, reusable_place, reusable_UserNo, user_email, user_phone, reusable_share, reusable_number, reusable_name, reusable_type, prev_name, now_name, reusable_rank]);
// 	var resIdx = createReusableManager.insertId;

// 	res.send({ sucess: true, result: createReusableManager, reus_id: resIdx })
// });


/// resuable_market_new 종료
/// resuable_market_new 종료
app.get('/registration_list_new', session_exists, async function (req, res) {
	try {
		// 세션에서 사용자 정보 가져오기
		var user_email = req.session.user['email'];
		var user_phone = req.session.user['tel'];
		var user_id = req.session.user['userid'];

		// 페이지 번호 파라미터 받기 (기본값 1)
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;
		const nStart = page - 1;

		// // 전체 재사용 물품 수 조회
		// var tsql = "SELECT count(*) as tot FROM tblReusable; ";
		// var res_total = await directQuery(tsql);
		// var total = res_total[0].tot;

		// // 전체 재사용 물품 목록 조회 (최신순)
		// var sql = "SELECT * FROM tblReusable ORDER BY dFixtureDate DESC";
		// sql += " LIMIT 10 OFFSET ?;";
		// var nStart = 0;
		// var rinfos = await directQuery(sql, [Number(nStart * 10)]);

		// 사용자가 등록한 재사용 물품 조회
		// 사용자가등록한 재사용,나눔합친거 물품 수 조회
		// 사용자가 등록한 재사용 물품 수 조회
		// 전체 아이템 수 조회
		var tsql = "SELECT count(*) as tot FROM tblReusable WHERE sReusableUserNo=?";
		var res_total = await directQuery(tsql, [user_id]);
		var total = res_total[0].tot;

		// 페이지네이션 계산
		const totalPages = Math.ceil(total / itemsPerPage);

		// 사용자가등록한 재사용,나눔합친거 물품 목록 조회 (최신순)
		// var sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC";
		// sql += " LIMIT 10 OFFSET ?;";
		// var nStart = 0;
		// var rinfos = await directQuery(sql, [Number(nStart * 10)]);

		// 아이템 조회
		var sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC LIMIT ? OFFSET ?";
		var rinfos = await directQuery(sql, [user_id, itemsPerPage, nStart * itemsPerPage]);

		console.log("user_id", user_id);

		// 이미지 조회
		var img_sql = 'SELECT b.* FROM tblReusable a INNER JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.sReusableUserNo=? ORDER BY a.dFixtureDate DESC LIMIT ? OFFSET ?';
		var rinfos_img = await directQuery(img_sql, [user_id, itemsPerPage, nStart * itemsPerPage]);


		//registration_list_new 라우트 내부
		const applicantQuery = 'SELECT COUNT(*) as count FROM tblReusableApplicant WHERE nReusableNo = ?';

		// rinfos 데이터를 가져온 후, 각 항목에 대해 신청자 정보를 추가
		for (let i = 0; i < rinfos.length; i++) {
			const applicantResult = await directQuery(applicantQuery, [rinfos[i].nReusableNo]);
			rinfos[i].hasApplicants = applicantResult[0].count > 0;
		}


		// rinfos_reg와 rinfos_appli변수
		// var rinfos_reg = [];
		// var rinfos_appli = [];
		// var rinfos_list = [];
		// var rinfos_result = [];
		// var rinfos_appli = [];

		// 사용자가 신청한 재사용 물품 목록 조회
		// sql = 'SELECT * FROM tblReusableApplicant WHERE sApplicantNumber=?;';
		// var rinfos_list = await directQuery(sql, [user_id]);

		// var rinfos_appli = [];

		/* 기존 신청자 목록 처리 로직 주석처리
		for(var i = 0; i < rinfos.length; i++)
		{
			if(rinfos[i].sReusableApplicant_List != "")
			{
				var resu_list_str = JSON.stringify(rinfos[i].sReusableApplicant_List);
				var resu_str = resu_list_str.replaceAll('"','');
				var resu_str2 = resu_str.replaceAll('[','');
				var resu_str3 = resu_str2.replaceAll(']','');
				var resu_list = resu_str3.split(',');
	
				var indx = resu_list.indexOf(user_id);
	
				for(var j = 0; j < resu_list.length; j++)
				{
					var resu_item = resu_list[j].replaceAll("'","");
	
					if(resu_item == user_id)
					{
						rinfos_appli.push(rinfos[i]);
						break;
					}
				}
			}
		}
		*/

		// 신청한 물품 정보 매칭
		// for (var i = 0; i < rinfos_list.length; i++) {
		// 	var appli_no = rinfos_list[i].nReusableNo;
		// 	for (var j = 0; j < rinfos.length; j++) {
		// 		if (appli_no == rinfos[j].nReusableNo) {
		// 			rinfos_appli.push(rinfos[j]);
		// 		}
		// 	}
		// }

		// 등록 및 신청 물품 목록 병합
		// var rinfos_result = [];
		// for (var i = 0; i < rinfos_reg.length; i++) {
		// 	rinfos_result.push(rinfos_reg[i]);
		// }
		// for (var i = 0; i < rinfos_appli.length; i++) {
		// 	rinfos_result.push(rinfos_appli[i]);
		// }

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
		res.render("registration_list_new", {
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
		console.error('Error in registration_list_new:', error);
		res.status(500).send('Internal Server Error');
	}
});

// 등록물품관리 신청자확인팝업

app.get('/applicant_checkPopup', async function (req, res) {
	try {
		var resuNo = req.query.resuNo;
		var appliV = false;

		//첫 번째 쿼리
		var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
		var rinfos = await directQuery(sql, [resuNo]);

		if (!rinfos || rinfos.length === 0) {
			return res.status(404).send('데이터를 찾을 수 없습니다.');
		}

		// 수정: nApplicantState가 0이거나 1일 때만 선정 버튼이 보이도록 수정
		appliV = !(rinfos[0].nApplicantState === 0 || rinfos[0].nApplicantState === 1);

		// 두 번째 쿼리
		sql = 'SELECT * FROM tblReusableApplicant WHERE nReusableNo=?;';
		var rinfos_list = await directQuery(sql, [resuNo]);

		var arr_aplic = [];

		if (rinfos_list.length > 0) {
			for (var idx = 0; idx < rinfos_list.length; idx++) {
				var userID = rinfos_list[idx].sApplicantNumber;

				console.log(userID);

				if (userID == '210597') {
					var jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': 'kbw5636@kounosoft.com', 'tel': '010-9318-5636' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '597210') {
					var jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': 'jaebeen2@kounosoft.com', 'tel': '010-6277-4800' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '666308') {
					var jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': 'sizin@kounosoft.com', 'tel': '010-3380-4340' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '') {

				}
				else {
					sql = 'SELECT distinct(b.sName) org, a.sName name,a.sEmail email, a.sTel tel, a.nPermission permission ';
					sql += 'FROM tblUser a,tblOrganization b ';
					sql += 'WHERE a.sNumber=? and a.nOrgIdx=b.nIndex';
					var res_org = await directQuery(sql, [userID]);

					jsonData = { 'userid': userID, 'potalId': userID, 'name': res_org[0].name, 'class': res_org[0].org, 'mail': res_org[0].email, 'tel': res_org[0].tel };
					arr_aplic.push(jsonData);
				}
			}
		}



		res.render("applicant_checkPopup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, resuNo: resuNo, arr_aplic: arr_aplic, appliV: appliV });
	} catch (error) {
		console.error('Error in applicant_checkPopup:', error);
		res.status(500).send('서버 오류가 발생했습니다');
	}
});

app.get('/new_applicant_checkPopup', async function (req, res) {
	try {
		var resuNo = req.query.resuNo;
		var appliV = false;

		//첫 번째 쿼리
		var sql = 'SELECT * FROM tblReusable WHERE nReusableNo=?;';
		var rinfos = await directQuery(sql, [resuNo]);

		if (!rinfos || rinfos.length === 0) {
			return res.status(404).send('데이터를 찾을 수 없습니다.');
		}

		if (rinfos[0].nApplicantState != 0) {
			appliV = true;
		}

		// 두 번째 쿼리
		sql = 'SELECT * FROM tblReusableApplicant WHERE nReusableNo=?;';
		var rinfos_list = await directQuery(sql, [resuNo]);

		var arr_aplic = [];

		if (rinfos_list.length > 0) {
			for (var idx = 0; idx < rinfos_list.length; idx++) {
				var userID = rinfos_list[idx].sApplicantNumber;

				console.log(userID);

				if (userID == '210597') {
					var jsonData = { 'userid': '210597', 'potalId': 'atdtest02', 'name': '원격교육센터 02', 'class': '총무부', 'mail': 'kbw5636@kounosoft.com', 'tel': '010-9318-5636' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '597210') {
					var jsonData = { 'userid': '597210', 'potalId': 'test_esgasset01', 'name': '테스트자산관리01', 'class': '공과대학행정팀', 'mail': 'jaebeen2@kounosoft.com', 'tel': '010-6277-4800' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '666308') {
					var jsonData = { 'userid': '666308', 'potalId': 'test_esgasset02', 'name': '테스트자산관리02', 'class': '학생지원팀', 'mail': 'sizin@kounosoft.com', 'tel': '010-3380-4340' };
					arr_aplic.push(jsonData);
				}
				else if (userID == '') {

				}
				else {
					sql = 'SELECT distinct(b.sName) org, a.sName name,a.sEmail email, a.sTel tel, a.nPermission permission ';
					sql += 'FROM tblUser a,tblOrganization b ';
					sql += 'WHERE a.sNumber=? and a.nOrgIdx=b.nIndex';
					var res_org = await directQuery(sql, [userID]);

					jsonData = { 'userid': userID, 'potalId': userID, 'name': res_org[0].name, 'class': res_org[0].org, 'mail': res_org[0].email, 'tel': res_org[0].tel };
					arr_aplic.push(jsonData);
				}
			}
		}



		res.render("new_applicant_checkPopup", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, resuNo: resuNo, arr_aplic: arr_aplic, appliV: appliV });
	} catch (error) {
		console.error('Error in applicant_checkPopup:', error);
		res.status(500).send('서버 오류가 발생했습니다');
	}
});

// 바뀌지좀마라 
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

// app.get('/applications_list_new2', session_exists, async function (req, res) {
// 	// 세션에서 사용자 정보 가져오기
// 	var user_email = req.session.user['email'];
// 	var user_phone = req.session.user['tel'];
// 	var user_id = req.session.user['userid'];

// 	console.log('user_id ==>', user_id);
// 	// 페이지 번호 파라미터 받기 (기본값 1)
// 	const page = parseInt(req.query.page) || 1;
// 	const itemsPerPage = 10;
// 	const nStart = page - 1;

// 	// 전체 재사용 물품 수 조회
// 	var tsql = "SELECT count(*) as tot FROM tblReusable; ";
// 	var res_total = await directQuery(tsql);
// 	var total = res_total[0].tot;
// 	// 페이지네이션 계산
// 	const totalPages = Math.ceil(total / itemsPerPage);

// 	// 전체 재사용 물품 목록 조회 (최신순)
// 	var sql = "SELECT * FROM tblReusable ORDER BY dFixtureDate DESC";
// 	sql += " LIMIT 10 OFFSET ?;";
// 	//var nStart = 0;
// 	// 아이템 조회
// 	var sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC LIMIT ? OFFSET ?";
// 	//var sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? and nApplicantState in ('1','2','3') ORDER BY dFixtureDate DESC LIMIT ? OFFSET ?";
// 	var rinfos = await directQuery(sql, [user_id, itemsPerPage, nStart * itemsPerPage]);
// 	//var rinfos = await directQuery(sql, [Number(nStart * 10)]);
// 	// 재사용 물품의 이미지 정보를 가져오는 쿼리
// 	var img_sql = 'SELECT b.* FROM tblReusable a INNER JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.sReusableUserNo=? ORDER BY a.dFixtureDate DESC LIMIT ? OFFSET ?';
// 	//var img_sql = 'SELECT b.* FROM tblReusable a INNER JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.sReusableUserNo=? and a.nApplicantState in (1, 2, 3) ORDER BY a.dFixtureDate DESC LIMIT ? OFFSET ?';
// 	var rinfos_img = await directQuery(img_sql, [user_id, 10, Number(nStart * 10)]);

// 	console.log('rinfos_img===>',rinfos_img);

// 	// 사용자가 등록한 재사용 물품 조회
// 	sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC";
// 	sql += " LIMIT 10 OFFSET ?;";
// 	// 사용자가 등록한 재사용 물품 목록을 조회하는 쿼리 실행
// 	// rinfos_reg: 사용자가 등록한 재사용 물품 정보를 담는 배열
// 	// user_id: 현재 로그인한 사용자의 ID
// 	// nStart: 페이지네이션을 위한 시작 인덱스 (0부터 시작)
// 	// Number(nStart * 10): 한 페이지당 10개씩 표시하기 위해 offset 계산
// 	var rinfos_reg = await directQuery(sql, [user_id, Number(nStart * 10)]);

// 	// 디버깅용 - 현재 로그인한 사용자의 ID 출력 
// 	console.log("user_id", user_id);

// 	// 사용자가 신청한 재사용 물품 목록 조회
// 	sql = 'SELECT * FROM tblReusableApplicant WHERE sApplicantNumber=?;';
// 	var rinfos_list = await directQuery(sql, [user_id]);

// 	var rinfos_appli = [];

// 	/* 기존 신청자 목록 처리 로직 주석처리
// 	for(var i = 0; i < rinfos.length; i++)
// 	{
// 		if(rinfos[i].sReusableApplicant_List != "")
// 		{
// 			var resu_list_str = JSON.stringify(rinfos[i].sReusableApplicant_List);
// 			var resu_str = resu_list_str.replaceAll('"','');
// 			var resu_str2 = resu_str.replaceAll('[','');
// 			var resu_str3 = resu_str2.replaceAll(']','');
// 			var resu_list = resu_str3.split(',');

// 			var indx = resu_list.indexOf(user_id);

// 			for(var j = 0; j < resu_list.length; j++)
// 			{
// 				var resu_item = resu_list[j].replaceAll("'","");

// 				if(resu_item == user_id)
// 				{
// 					rinfos_appli.push(rinfos[i]);
// 					break;
// 				}
// 			}
// 		}
// 	}
// 	*/

// 	// 신청한 물품 정보 매칭
// 	for (var i = 0; i < rinfos_list.length; i++) {
// 		var appli_no = rinfos_list[i].nReusableNo;
// 		for (var j = 0; j < rinfos.length; j++) {
// 			if (appli_no == rinfos[j].nReusableNo) {
// 				rinfos_appli.push(rinfos[j]);
// 			}
// 		}
// 	}

// 	// 등록 및 신청 물품 목록 병합
// 	var rinfos_result = [];
// 	for (var i = 0; i < rinfos_reg.length; i++) {
// 		rinfos_result.push(rinfos_reg[i]);
// 	}
// 	for (var i = 0; i < rinfos_appli.length; i++) {
// 		rinfos_result.push(rinfos_appli[i]);
// 	}

// 	// 페이지네이션 정보 설정
// 	var start_page = nStart - (nStart % 10);
// 	var end_page = total / 10;
// 	var page_data = {
// 		'name': req.session.user.name,
// 		'count': nStart,
// 		'start': start_page,
// 		'end': end_page,
//                 'currentPage': page,
//                 'totalPages': totalPages,		
// 		'total': total
// 	};

// 	// 사용자 권한 정보 조회
// 	sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
// 	var authority_list = await directQuery(sql, [req.session.user.userid]);

// 	// 권한별 사용자 정보 조회
// 	sql = "SELECT * FROM tblUser WHERE sNumber=?";

// 	// 권한별 사용자 이름 매핑
// 	for (var idx = 0; idx < authority_list.length; idx++) {
// 		if (authority_list[idx].sStdId == "210597") {
// 			authority_list[idx].sName = "원격교육센터 02";
// 		}
// 		else if (authority_list[idx].sStdId == "597210") {
// 			authority_list[idx].sName = "테스트자산관리01";
// 		}
// 		else if (authority_list[idx].sStdId == "666308") {
// 			authority_list[idx].sName = "테스트자산관리02";
// 		}
// 		else {
// 			var result = await directQuery(sql, [authority_list[idx].sStdId]);
// 			if (result.length > 0) {
// 				authority_list[idx].sName = result[0].sName;
// 			}
// 			else {
// 				authority_list[idx].sName = "데이터 없음";
// 			}
// 		}
// 	}

// 	// 디버깅용 로그 출력
// 	console.log("rinfos", rinfos);
// 	console.log("rinfos_result", rinfos_result);
// 	console.log("rinfos_reg", rinfos_reg);
// 	console.log("rinfos_list", rinfos_list);

// 	// 재사용 물품 조회 페이지 렌더링
// 	//res.render("reusable_view", {
// 	res.render("applications_list_new", {
// 		idx: req.session.user.name,
// 		uname: req.session.user.name,
// 		userid: req.session.user.userid,
// 		permission: req.session.user.permission,
// 		stdtype: req.session.user.stdtype,
// 		rinfos: rinfos_result,
// 		rinfos_img: rinfos_img,
// 		page_data: page_data,
// 		user_email: user_email,
// 		user_phone: user_phone,
// 		rinfos_reg: rinfos_reg,
// 		rinfos_appli: rinfos_appli,
// 		authority_list: authority_list,
// 		sel_authority: req.session.user.selectAuithority
// 	});
// });



app.get('/return_application_list_new', session_exists, async function (req, res) {

	// 세션에서 사용자 정보 가져오기
	var user_email = req.session.user['email'];
	var user_phone = req.session.user['tel'];
	var user_id = req.session.user['userid'];

	// 사용자가 등록한 재사용 물품 수 조회
	var tsql = "SELECT count(*) as tot FROM tblReusable WHERE sReusableUserNo=? AND nReusableShare=0";
	var res_total = await directQuery(tsql, [user_id]);
	var total = res_total[0].tot;

	var nStart = 0;

	var user_no = req.session.user.userid;

	var sql = "SELECT sPortal FROM tblUser WHERE sNumber=?";
	var user_info = await directQuery(sql, [user_no]);

	sql = 'SELECT sFixtureNo FROM tblApproval WHERE sUserPortal=? and nApprovalType=2';
	var user_approval = await directQuery(sql, [user_info[0].sPortal]);

	//sql = 'SELECT * FROM tblReusable WHERE nReusableShare=0 AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
	//sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM tblReusable a JOIN tblReusableImg b ON a.nReusableNo=b.nReusableIdx WHERE a.nReusableShare=0 AND a.nReusableState = 1 AND a.nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;'
	sql = 'SELECT a.*,b.sImgPath,b.sImgBin FROM carbonKU.tblReusable a, carbonKU.tblReusableImg b WHERE a.nReusableNo=b.nReusableIdx AND a.nReusableShare=0 AND a.sReusableUserNo=? ORDER BY nReusableNo DESC ;'
	var rinfos_reus = await directQuery(sql, [user_id, 10, Number(nStart * 10)]);

	// 페이지네이션 정보 설정
	var start_page = nStart - (nStart % 10);
	var end_page = Math.ceil(total / 10);
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total
	};


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
	// 페이지 렌더링
	res.render("return_application_list_new", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		userid: req.session.user.userid,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		rinfos_reus: rinfos_reus,
		page_data: page_data,
		user_email: user_email,
		user_phone: user_phone,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});

app.get('/return_applicationPopup', session_exists, async function (req, res) {
	res.render("return_applicationPopup");
});

app.get('/approval_applicationPopup', session_exists, async function (req, res) {
	res.render("approval_applicationPopup");
});

app.get('/approval_applicationPopup02', session_exists, async function (req, res) {
	// 예를 들어 세션 또는 다른 소스에서 user id를 추출합니다.
	let userid = req.session.user.userid;
	res.render('approval_applicationPopup02', { userid });
});




// 예시: views/approval_applicationPopup03.ejs 뷰를 렌더링하는 라우트
app.get('/approval_applicationPopup03', session_exists, (req, res) => {
	// 예를 들어 세션 또는 다른 소스에서 user id를 추출합니다.
	let userid = req.session.user.userid;
	res.render('approval_applicationPopup03', { userid });
});

app.get('/approval_applicationPopup04', session_exists, async function (req, res) {
	res.render("approval_applicationPopup04");
});

app.post('/getReturnReusableInfo', async function (req, res) {
	var reus_no = req.body.resuNo;

	var sql = "SELECT * FROM tblReusable WHERE nReusableNo=?";
	var resu_info = await directQuery(sql, [reus_no]);

	res.send({ resu_info: resu_info });
});

app.post('/getReturnReusableList', async function (req, res) {
	var resuList = req.body.resuList;
	const resu_data = resuList.split(',');

	var sql = "SELECT * FROM tblReusable WHERE nReusableNo in (?);";
	var resu_info = await directQuery(sql, [resu_data]);

	res.send({ resu_info: resu_info });
});

app.post('/updateReturnReusableInfo', async function (req, res) {
	var reus_no = req.body.resuNo;
	var reus_title = req.body.resuTitle;
	var reus_content = req.body.resuContent;
	var reus_rank = req.body.resuRank;
	var reus_type = req.body.resuType;
	var reus_price = req.body.resuPrice;
	var reus_date = req.body.resuDate;

	var sql = "UPDATE tblReusable SET sReusableName=?, sReusableContent=?, nReusableRank=?, nReusableType=?, nReusablePrice=?, nReusableGetDate=? WHERE nReusableNo=?";
	await directQuery(sql, [reus_title, reus_content, reus_rank, reus_type, reus_price, reus_date, reus_no]);

	res.send({ result: "sucess" });
});

// 요청받은 requestReturnFix 
app.post('/return_request', async function (req, res) {
	// 반납 요청 관련 변수 초기화
	var approval_title = "";
	var approval_date = "";
	var approval_memo = "";
	var fix_list = [];
	var approver_list = [];

	// 요청 본문에서 데이터 추출
	if (req.body) {
		approval_title = req.body.title;
		approval_date = req.body.date;
		approval_memo = req.body.memo;
		fix_list = req.body.fixItem;
		approver_list = req.body.approvalList;
	}

	// 세션에서 사용자 정보 가져오기
	var user_no = req.session.user.userid;
	var user_name = req.session.user.name;
	var user_org = req.session.user.class;
	var user_email = req.session.user.email;

	// 사용자의 포털 정보 조회
	var sql = "SELECT sPortal FROM tblUser WHERE sNumber=?";
	var user_info = await directQuery(sql, [user_no]);

	// 이메일 내 불용 리스트(반납 물품 리스트)를 누적할 변수
	let aggregatedList = "";

	// 각 반납 물품에 대한 처리
	for (var fix_id = 0; fix_id < fix_list.length; fix_id++) {
		// 결재 정보 삽입 SQL 쿼리 구성
		sql = 'INSERT INTO tblApproval(nReusableNo,sFixtureNo,sApprovalTitle,dApprovalDate,sApprovalReason,sFixtureName,sBuild,sRoomNo,sFixturePrice,nReusableRank,sUserName,sUserOrg,sUserPortal,nApprovalState,nApprovalType,sNumber) ';
		sql += 'VALUES(?,?,?,NOW(),?,?,?,?,?,?,?, ?,?,1,2,?);';

		// 데이터베이스에 결재 정보 삽입
		var approval_ret = await directQuery(sql, [
			fix_list[fix_id].nReusableNo,
			fix_list[fix_id].sFixtureNo,
			approval_title,
			approval_memo,
			fix_list[fix_id].sFixtureName,
			fix_list[fix_id].sFixtureBuildName,
			fix_list[fix_id].sFixtureRoomNo,
			fix_list[fix_id].sFixturePrice,
			fix_list[fix_id].nReusableRank,
			user_name,
			user_org,
			user_info[0].sPortal,
			user_no
		]);

		// 삽입된 결재 정보의 ID 저장
		var approvalIdx = approval_ret.insertId;

		// ★ 신청한 자기자신도 tblApprover에 추가 (nApprOrder 0번)
		sql = 'INSERT INTO tblApprover(sName,sNumber,sPortal,sOrg,sEMail,sTel,nApprIdx,nApprOrder) VALUES(?,?,?,?,?,?,?,?);';
		await directQuery(sql, [
			user_name,
			user_no,
			user_info[0].sPortal,
			user_org,
			user_email,
			"",   // 전화번호 정보가 없으면 빈 문자열로 처리
			approvalIdx,
			0    // nApprOrder 0번으로 지정
		]);

		// 결재자 정보 삽입 처리 (각 물품마다 데이터베이스에 삽입됨)
		for (var approver_idx = 0; approver_idx < approver_list.length; approver_idx++) {
			// 하드코딩으로 sNumber 값 설정
			let customSNumber = "";
			if (approver_idx === 0) {
				customSNumber = "210597";
			} else if (approver_idx === 1) {
				customSNumber = "597210";
			} else if (approver_idx === 2) {
				customSNumber = "666308";
			} else {
				customSNumber = approver_list[approver_idx].employeeNum;
			}

			sql = 'INSERT INTO tblApprover(sName,sNumber,sPortal,sOrg,sEMail,sTel,nApprIdx,nApprOrder) ';
			sql += 'VALUES(?,?,?,?,?,?,?,?);';

			await directQuery(sql, [
				approver_list[approver_idx].name,
				customSNumber,
				approver_list[approver_idx].portal,
				approver_list[approver_idx].org,
				approver_list[approver_idx].email,
				approver_list[approver_idx].tel,
				approvalIdx,
				(approver_idx + 1)
			]);
		}

		// 불용 리스트에 현재 물품 정보를 누적해서 추가
		aggregatedList += fix_list[fix_id].sFixtureNo + " " +
			fix_list[fix_id].sFixtureName + " " +
			fix_list[fix_id].sFixtureBuildName + " " +
			fix_list[fix_id].sFixtureRoomNo + " " +
			fix_list[fix_id].sFixturePrice + "<br>";
	}

	// 이메일 내용 구성
	let html_data = user_name + " (" + user_email + ")님으로부터 불용 신청 결재가 요청되었습니다.<br><br>";
	html_data += "결재 링크<br><a href='http://192.168.100.136:33000/approval_box_new'>http://192.168.100.136:33000/approval_box_new</a><br><br>";
	html_data += "불용 리스트<br>" + aggregatedList;

	// 결재자에게 각각 한 통씩 이메일 발송 (총 3개)
	for (var approver_idx = 0; approver_idx < approver_list.length; approver_idx++) {
		// 현재 결재자의 이메일 주소 사용 (현재는 예시로 사용중)
		let mailOptions = {
			from: 'kbw3672@naver.com',
			to: 'xhdlsql12@kounosoft.com', // 각 결재자의 이메일
			subject: "탄소중립 자산관리 시스템 반납 신청",
			html: html_data,
		};

		transporter.sendMail(mailOptions);
	}

	// 처리 완료 응답 전송
	res.send({ result: "완료" });
});

app.post('/searchStaffQuiry', async function (req, res) {
	var ssearch = req.body.ssearch;
	var svalue = req.body.svalue;

	var sql = 'SELECT distinct(b.sNameKor) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a, tblDepartment b ';
	sql += 'WHERE a.sDepartmentCode = b.sDepartmentCode and a.nPermission <= 4 and a.nPermission != 0 and a.sPortal != ""';

	if (ssearch == 1) {
		// 만약 교직원 번호 검색일 경우, 최소 4자리 이상 입력되었는지 확인
		if (svalue.trim().length < 4) {
			return res.send({ result: [], message: "교직원 번호는 최소 4자리 이상 입력해주세요." });
		}
		// 접두어 검색(예: "8010" 입력 시 "8010%" 형태로 처리)
		svalue = svalue.trim() + "%";
		sql += " and a.sNumber LIKE ?;";
	} else if (ssearch == 2) {
		// 이름 검색은 부분 일치 처리
		svalue = "%" + svalue.trim() + "%";
		sql += " and a.sName LIKE ?;";
	} else if (ssearch == 3) {
		// 소속부서 이름 검색은 부분 일치 처리
		svalue = "%" + svalue.trim() + "%";
		sql += " and b.sNameKor LIKE ?";
	}

	var result = await directQuery(sql, [svalue]);
	res.send({ result: result });
});

app.get('/approval_box_new', session_exists, async function (req, res) {
	// 사용자의 권한 정보를 조회하는 SQL 쿼리
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// 사용자 정보를 조회하는 SQL 쿼리
	sql = "SELECT * FROM tblUser WHERE sNumber=?";
	for (var idx = 0; idx < authority_list.length; idx++) {
		if (authority_list[idx].sStdId == "210597") {
			authority_list[idx].sName = "원격교육센터 02";
		} else if (authority_list[idx].sStdId == "597210") {
			authority_list[idx].sName = "테스트자산관리01";
		} else if (authority_list[idx].sStdId == "666308") {
			authority_list[idx].sName = "테스트자산관리02";
		} else {
			var result = await directQuery(sql, [authority_list[idx].sStdId]);
			authority_list[idx].sName = result.length > 0 ? result[0].sName : "데이터 없음";
		}
	}

	// 승인자 목록을 조회하는 SQL 쿼리 (현재 로그인한 사용자의 승인 요청정보만 조회)
	sql = "SELECT * FROM tblApprover WHERE sNumber = ?;";
	var appprover_list = await directQuery(sql, [req.session.user.userid]);

	// 진행중인 승인 목록: 현재 로그인한 사용자가 결재 요청을 받은 문서만 보여줌
	sql = "SELECT * FROM tblApproval WHERE nApprovalType=2 AND nApprovalState!=4 AND nIndex IN (SELECT nApprIdx FROM tblApprover WHERE sNumber = ?);";
	var approval_list_process = await directQuery(sql, [req.session.user.userid]);

	// 완료된 승인 목록: 현재 로그인한 사용자가 결재 요청을 받은 문서만 보여줌
	sql = "SELECT * FROM tblApproval WHERE nApprovalType=2 AND nApprovalState=4 AND nIndex IN (SELECT nApprIdx FROM tblApprover WHERE sNumber = ?);";
	var approval_list_comp = await directQuery(sql, [req.session.user.userid]);

	// approval_box_new 페이지 렌더링
	res.render("approval_box_new", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		userid: req.session.user.userid,
		portalid: req.session.user.portalid,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority,
		approval_list_process: approval_list_process,
		approval_list_comp: approval_list_comp
	});
});

// approval_applicationPopup03 에서 확인 버튼 누르면 1올라가고 누른사람 상태값 1로 만들기
// approval_applicationPopup03 에서 확인 버튼 누르면 1올라가고 누른사람 상태값 1로 만들기
app.post('/returnApprovalOne', async function (req, res) {
	try {
		// 1. 클라이언트로부터 승인 문서 번호를 받음
		const apprNo = req.body.apprNo;
		// 2. 세션에서 현재 로그인한 사용자 아이디를 가져옴
		const userId = req.session.user.userid;

		// 3. tblApprover 테이블의 nApprState 값을 1로 업데이트 (수정된 부분: nIndex에서 nApprIdx로 변경)
		const updateApproverQuery = `
        UPDATE tblApprover 
        SET nApprState = 1 
        WHERE nApprIdx = ? AND sNumber = ?
        `;
		await directQuery(updateApproverQuery, [apprNo, userId]);

		// 4. tblApproval 테이블의 nApprovalState를 1씩 증가
		const updateApprovalQuery = `
        UPDATE tblApproval 
        SET nApprovalState = nApprovalState + 1 
        WHERE nIndex = ?
        `;
		await directQuery(updateApprovalQuery, [apprNo]);

		// 5. 성공 응답 전송
		res.json({ status: 'success' });
	} catch (err) {
		console.error('Error in /returnApprovalOne:', err);
		res.status(500).json({ status: 'error', message: err.message });
	}
});


// 회수버튼시 클릭시 호출 post 
app.post('/returnApprovalConfirm', async function (req, res) {
	try {
		// 1. 클라이언트로부터 승인 문서 번호를 받음 (이 값은 tblApproval의 nIndex 및 tblApprover의 nApprIdx와 매핑됨)
		const apprNo = req.body.apprNo;

		// 2. 세션에서 현재 로그인한 사용자 아이디를 가져옴
		const userId = req.session.user.userid;

		// 3. tblApprover 테이블에서 해당 결재 요청에 대한 행 삭제
		const deleteApproverQuery = `
            DELETE FROM tblApprover 
            WHERE nApprIdx = ?
        `;
		await directQuery(deleteApproverQuery, [apprNo, userId]);

		// 4. tblApproval 테이블에서 해당 결재 요청 행 삭제
		const deleteApprovalQuery = `
            DELETE FROM tblApproval 
            WHERE nIndex = ?
        `;
		await directQuery(deleteApprovalQuery, [apprNo]);

		// 5. 성공 응답 전송
		res.json({ status: 'success' });
	} catch (err) {
		console.error('Error in /returnApprovalConfirm:', err);
		res.status(500).json({ status: 'error', message: err.message });
	}
});

app.post('/searchApprovalProcess', async function (req, res) {
	var ssearch = req.body.ssearch;
	var svalue = req.body.svalue;
	var date_start = req.body.startDate;
	var date_end = req.body.endDate;

	var sql = "SELECT * FROM tblApprover where sPortal = ?;";
	var appprover_list = await directQuery(sql, [req.session.user.portalid]);

	var sql = "SELECT * FROM tblApproval where nApprovalType=2 and nApprovalState!=4 and nIndex=?";

	var result = [];

	if (date_start == "" && date_end == "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "카메라")
				svalue = 2
			else if (svalue == "악기류")
				svalue = 3
			else if (svalue == "모니터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}
	else if (date_start != "" && date_end == "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "컴퓨터")
				svalue = 2
			else if (svalue == "컴퓨터")
				svalue = 3
			else if (svalue == "컴퓨터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and dApprovalDate > ?;";

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue, date_start]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue, date_start]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, date_start]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}
	else if (date_start == "" && date_end != "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "컴퓨터")
				svalue = 2
			else if (svalue == "컴퓨터")
				svalue = 3
			else if (svalue == "컴퓨터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and dApprovalDate < ?;";

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate < ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue, date_start, date_end]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue, date_start, date_end]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, date_start, date_end]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}
	else if (date_start != "" && date_end != "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "컴퓨터")
				svalue = 2
			else if (svalue == "컴퓨터")
				svalue = 3
			else if (svalue == "컴퓨터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue, date_end]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue, date_end]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, date_end]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}

	res.send({ result: result });
});

app.post('/searchApprovalComplete', async function (req, res) {
	var ssearch = req.body.ssearch;
	var svalue = req.body.svalue;
	var date_start = req.body.startDate;
	var date_end = req.body.endDate;

	var sql = "SELECT * FROM tblApprover where sPortal = ?;";
	var appprover_list = await directQuery(sql, [req.session.user.portalid]);

	sql = "SELECT * FROM tblApproval where nApprovalType=2 and nApprovalState=4 and nIndex=?";

	var result = [];

	if (date_start == "" && date_end == "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "카메라")
				svalue = 2
			else if (svalue == "악기류")
				svalue = 3
			else if (svalue == "모니터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}
	else if (date_start != "" && date_end == "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "컴퓨터")
				svalue = 2
			else if (svalue == "컴퓨터")
				svalue = 3
			else if (svalue == "컴퓨터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and dApprovalDate > ?;";

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?";
			sql += " and dApprovalDate > ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue, date_start]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue, date_start]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, date_start]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}
	else if (date_start == "" && date_end != "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "컴퓨터")
				svalue = 2
			else if (svalue == "컴퓨터")
				svalue = 3
			else if (svalue == "컴퓨터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and dApprovalDate < ?;";

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate < ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue, date_start, date_end]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue, date_start, date_end]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, date_start, date_end]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}
	else if (date_start != "" && date_end != "") {
		var svalue_def1 = 0;
		var svalue_def2 = 0;

		if (ssearch == 1) {
			sql += " and sApprovalTitle = ?";

			if (svalue == "컴퓨터")
				svalue_def1 = 1
			else if (svalue == "카메라")
				svalue_def1 = 2
			else if (svalue == "악기류")
				svalue_def1 = 3
			else if (svalue == "모니터")
				svalue_def1 = 4
			else
				svalue_def1 = 0;

			sql += " and nApprovalType = ?";

			svalue_def2 = "%" + svalue + "%";

			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and sFixtureName = ?";
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 2) {
			sql += " and sApprovalTitle = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 3) {
			if (svalue == "컴퓨터")
				svalue = 1
			else if (svalue == "컴퓨터")
				svalue = 2
			else if (svalue == "컴퓨터")
				svalue = 3
			else if (svalue == "컴퓨터")
				svalue = 4
			else
				svalue = 0;

			sql += " and nApprovalType = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 4) {
			sql += ' and (sBuild LIKE ? or sRoomNo LIKE ?)';
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";

			svalue = "%" + svalue + "%";
		}
		else if (ssearch == 5) {
			sql += " and sFixtureName = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}
		else if (ssearch == 6) {
			sql += " and sFixtureNo = ?";
			sql += " and dApprovalDate > ?";
			sql += " and dApprovalDate < ?;";
		}

		for (var idx = 0; idx < appprover_list.length; idx++) {
			var approval_info = [];

			if (ssearch == 1) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue_def1, svalue_def2, svalue_def2, svalue, svalue, date_end]);
			}
			else if (ssearch == 4) {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, svalue, date_end]);
			}
			else {
				approval_info = await directQuery(sql, [appprover_list[idx].nApprIdx, svalue, date_end]);
			}

			if (approval_info.length != 0) {
				result.push(approval_info[0]);
			}
		}
	}

	res.send({ result: result });
});

app.post('/returnConfirm', async function (req, res) {
	var appr_no = req.body.apprNo;
	var user_no = req.session.user.userid;

	var sql = "UPDATE tblApproval SET nApprovalState=4 WHERE nIndex=?;";
	await directQuery(sql, [appr_no]);

	sql = "UPDATE tblApprover SET nApprState=1,dApprovalDoneDate=NOW() WHERE nApprIdx=? and sNumber=?;";
	await directQuery(sql, [appr_no, user_no]);

	res.send({ result: "Sucess" });
});

app.post('/getCompApprInfo', async function (req, res) {
	var apprIdx = req.body.apprIdx;

	var sql = "SELECT * FROM tblApproval where nIndex=?";
	var approval_info = await directQuery(sql, [apprIdx]);

	sql = "SELECT * FROM tblApprover where nApprIdx = ?;";
	var appprover_list = await directQuery(sql, [apprIdx]);

	sql = "SELECT * FROM tblApprovalFix where nApprIdx = ?;";
	var approval_fix = await directQuery(sql, [apprIdx]);

	var resu_list = [];

	sql = "SELECT * FROM tblReusable where nReusableNo = ?;";

	for (var idx = 0; idx < approval_fix.length; idx++) {
		var resu_info = await directQuery(sql, [approval_fix[idx].nReusableNo]);
		resu_list.push(resu_info);
	}

	var fix_list = [];

	sql = "SELECT * FROM tblFixture where sFixtureNo = ?;";

	for (var idx = 0; idx < resu_list.length; idx++) {
		var fix_info = await directQuery(sql, [resu_list[idx].sFixtureNo]);
		fix_list.push(fix_info);
	}

	sql = "SELECT sTel FROM tblUser where sPortal = ?;";
	var user_tel = await directQuery(sql, [approval_info[0].sUserPortal]);

	res.send({ approval_info: approval_info, appprover_list: appprover_list, fix_list: fix_list, resu_list: resu_list, user_tel: user_tel });
});

// 양도된 물품목록 페이지 
app.get('/transactions_list_new', session_exists, async function (req, res) {
	var tsql = `SELECT count(*) as tot 
	FROM tblReusable 
	WHERE nReusableState = 3 AND nApplicantState = 3;`;
	var res_total = await directQuery(tsql);
	var total = res_total[0].tot;

	// 페이지 파라미터 가져오기
	var nStart = parseInt(req.query.page) || 0;

	// 완료된 항목만 조회하도록 수정
	var sql = `SELECT * FROM tblReusable 
			   WHERE nReusableState = 3 AND nApplicantState = 3 
			   ORDER BY dReusableDoneDate DESC 
			   LIMIT 10 OFFSET ?;`;
	var rinfos = await directQuery(sql, [Number(nStart * 10)]);

	var start_page = nStart - (nStart % 10);
	var end_page = Math.ceil(total / 10);
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	var user_email = req.session.user['email'];
	var user_phone = req.session.user['tel'];

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

	console.log('total', total);

	res.render("transactions_list_new", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, rinfos: rinfos, page_data: page_data, user_email: user_email, user_phone: user_phone, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});




///새로운부분추가 

app.post('/getReusableMemo', async function (req, res) {
	var reus_no = req.body.reus_no;

	var sql = "SELECT sReusableMemo FROM tblReusable WHERE nReusableNo=?";
	var rinfos_memo = await directQuery(sql, [reus_no]);

	res.send({ memo: rinfos_memo[0].sReusableMemo });
});

app.post('/getReusableImage_One', async function (req, res) {
	var reus_no = req.body.reus_no;

	console.log("reus_no", reus_no);

	var sql = "SELECT sImgPath, sImgBin FROM tblReusableImg WHERE nReusableIdx=?";
	var rinfos_img = await directQuery(sql, [reus_no]);

	console.log("rinfos_img", rinfos_img);

	var img_path = rinfos_img[0].sImgPath;
	var img_bin = rinfos_img[0].sImgBin;

	res.send({ img_path: img_path, img_bin: img_bin });
});

app.post('/searchReusable', async function (req, res) {
	var nIndex = 0;
	var user_email = req.session.user['email'];

	var search_index = req.body.search_index;
	var search_value = req.body.search_value;

	var sql = "";
	var rinfos = [];

	if (search_index == 0) {
		sql = 'SELECT * FROM tblReusable WHERE (sReusableName=? OR sReusableType=? OR sFixtureNo=?) AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
		rinfos = await directQuery(sql, [search_value, search_value, search_value, nIndex]);
	}
	else if (search_index == 1) {
		sql = 'SELECT * FROM tblReusable WHERE nReusableShare=0 AND (sReusableName=? OR sReusableType=? OR sFixtureNo=?) AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
		rinfos = await directQuery(sql, [search_value, search_value, search_value, nIndex]);
	}
	else if (search_index == 2) {
		sql = 'SELECT * FROM tblReusable WHERE nReusableShare=1 AND (sReusableName=? OR sReusableType=? OR sFixtureNo=?) AND nReusableState = 1 AND nApplicantState = 0 ORDER BY nReusableNo LIMIT 20 OFFSET ?;';
		rinfos = await directQuery(sql, [search_value, search_value, search_value, nIndex]);
	}

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

	var rinfos_img = [];

	var sql_img = 'SELECT * FROM tblReusableImg  WHERE nReusableIdx=?;';

	for (var index = 0; index < rinfos.length; index++) {
		var reus_no = rinfos[index].nReusableNo;

		var img_reus = await directQuery(sql_img, [reus_no]);

		var img_obj = {
			"reus_no": reus_no,
			"img_reus": img_reus
		};

		rinfos_img.push(img_obj);
	}

	res.send({ rinfos: rinfos, rinfos_img, rinfos_img });

});

app.get('/reusable_create', session_exists, async function (req, res) {

	var user_idx = req.session.user.userid;
	var user_mail = req.session.user.email;
	var user_phone = req.session.user.tel;

	//var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	tsql += "AND (sPublic='개인' or sPublic='')";

	//var res_total = await directQuery(tsql, [user_idx]);
	var res_total = await directQuery(tsql);


	var total = res_total[0].tot;

	//var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	var sql = "SELECT * FROM tblFixture WHERE (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	sql += "AND (sPublic='개인' or sPublic='')";
	sql += " LIMIT 10 OFFSET ?;";

	var nStart = 0;

	//var pinfos = await directQuery(sql, [user_idx, Number(nStart * 10)]);
	var pinfos = await directQuery(sql, [Number(nStart * 10)]);

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	console.log('total', total);

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

	res.render("reusable_create", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, pinfos: pinfos, page_data: page_data, user_mail: user_mail, user_phone: user_phone, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

// 재사용 물품 신청 처리를 위한 POST 라우트 핸들러
app.post('/requestReusable', async function (req, res) {
	// 요청 body에서 필요한 데이터 추출
	var resu_no = req.body.resu_no;      // 재사용 물품 번호
	var user_email = req.body.email;      // 신청자 이메일
	var user_name = req.body.name;        // 신청자 이름 
	var user_no = req.body.user_no;       // 신청자 번호

	// 재사용 물품 정보 조회
	var sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
	var res_resu = await directQuery(sql, [resu_no]);

	// 재사용 물품의 상태 정보 추출
	var resu_state = res_resu[0].nApplicantState;    // 신청 상태
	var resu_email = res_resu[0].sReusableEmail;     // 등록자 이메일
	var resu_name = res_resu[0].sReusableName;       // 물품명
	var resu_place = res_resu[0].sReusablePlace;     // 수령 장소

	// 응답으로 보낼 HTML 초기화
	var html = ``;

	// 신청 상태가 0(신청 가능)인 경우 처리
	if (resu_state == 0) {
		// 재사용 물품 테이블 업데이트 - 신청자 정보와 상태 변경
		sql = "UPDATE tblReusable SET sReusableApplicant=?, nReusableState=?, nApplicantState=? WHERE nReusableNo=?";
		await directQuery(sql, [user_name, 2, 2, resu_no]);

		// 해당 물품의 다른 신청자들 삭제
		sql = "DELETE FROM tblReusableApplicant WHERE nReusableNo=? AND sApplicantNumber!=?;";
		await directQuery(sql, [resu_no, user_no]);

		// 신청 성공 메시지를 보여주는 HTML 생성
		html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 마켓</title></head>
		<body><script>alert ('재사용 물품을 신청하였습니다.');window.close ();</script></body>
		</html>`;

		// 현재 날짜 생성
		let today = new Date();

		// 등록자에게 보낼 이메일 내용 구성
		var html_data = user_name + " 님께서 다음과 같은 재사용 물품에 신청을 하였습니다.<br>";
		html_data += "일자 : " + today.toLocaleString() + "<br>";
		html_data += "재사용 물품 이름 : " + resu_name + "<br>";
		html_data += "수령 위치 : " + resu_place + "<br>";

		// 등록자에게 보낼 메일 옵션 설정
		let mailOptions = {
			from: 'kbw3672@naver.com',    // 발신자 이메일
			to: resu_email,               // 수신자(등록자) 이메일
			subject: "고려대학교 자산관리 시스템 재사용 물품 신청", // 제목
			html: html_data,              // 내용
		};

		// 등록자에게 메일 발송
		transporter.sendMail(mailOptions);

		// 신청자 이메일 주소 결정
		var applic_email = "";
		if (user_no == '210597') {
			applic_email = 'kbw5636@kounosoft.com';
		}
		else if (user_no == '597210') {
			applic_email = 'jaebeen2@kounosoft.com';
		}
		else if (user_no == '666308') {
			applic_email = 'sizin@kounosoft.com';
		}
		else {
			// 일반 사용자의 경우 DB에서 이메일 조회
			sql = 'SELECT a.sEmail email';
			sql += 'FROM tblUser a ';
			sql += 'WHERE a.sNumber=?';
			var res_org = await directQuery(sql, [user_no]);
			applic_email = res_org[0].email;
		}

		// 신청자에게 보낼 이메일 내용 구성
		var html_data_applic = resu_email + " 님께서 재사용 물품의 신청을 승인하였습니다.<br>";
		html_data_applic += "일자 : " + today.toLocaleString() + "<br>";
		html_data_applic += "재사용 물품 이름 : " + resu_name + "<br>";
		html_data_applic += "수령 위치 : " + resu_place + "<br>";

		// 신청자에게 보낼 메일 옵션 설정
		let mailOptions_applic = {
			from: 'kbw5636@kounosoft.com', // 발신자 이메일
			to: applic_email,              // 수신자(신청자) 이메일
			subject: "고려대학교 자산관리 시스템 재사용 물품 신청", // 제목
			html: html_data_applic,        // 내용
		};

		// 신청자에게 메일 발송
		transporter.sendMail(mailOptions_applic);
	}
	else {
		// 이미 신청된 경우의 응답 HTML 생성
		html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 마켓</title></head>
		<body><script>alert ('이미 신청한 사용자가 존재한 상태입니다.');window.close ();</script></body>
		</html>`;
	}
	// 최종 HTML 응답 전송
	res.send(html);
});


// 상제정보 라우트 
app.post('/getReusableDetail', async function (req, res) {
	try {
		const reusableNo = req.body.reusableNo;

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
				fixturePrice: item.sFixturePrice,  // 수정: dFixturePrice -> nFixturePrice
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


////////////////// 위 와 구분 짓자 ///////////////////////////
////////////////// 위 와 구분 짓자 ///////////////////////////
app.post('/requestReusable_new', async function (req, res) {
	try {
		var resu_no = req.body.resu_no;
		var user_email = req.body.email;
		var user_name = req.body.name;
		var user_no = req.body.user_no;
		var user_tel = req.body.user_tel;

		var sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
		var res_resu = await directQuery(sql, [resu_no]);

		var resu_state = res_resu[0].nApplicantState;
		var resu_email = res_resu[0].sReusableEmail;
		var resu_name = res_resu[0].sReusableName;
		var resu_place = res_resu[0].sReusablePlace;

		if (resu_state == 1) {
			// 재사용 물품 상태 업데이트
			sql = "UPDATE tblReusable SET sReusableApplicant=?, nReusableState=?, nApplicantState=? WHERE nReusableNo=?";
			await directQuery(sql, [user_name, 2, 2, resu_no]);

			// 다른 신청자 삭제
			sql = "DELETE FROM tblReusableApplicant WHERE nReusableNo=? AND sApplicantNumber!=?;";
			await directQuery(sql, [resu_no, user_no]);

			return res.json({
				success: true,
				message: '재사용 물품 신청이 완료되었습니다.'
			});
		} else {
			return res.json({
				success: false,
				message: '이미 신청한 사용자가 존재한 상태입니다.'
			});
		}
	} catch (error) {
		console.error('Error in requestReusable_new:', error);
		return res.status(500).json({
			success: false,
			message: '처리 중 오류가 발생했습니다.'
		});
	}
});


app.post('/requestReusable_List', async function (req, res) {
	var resu_no = req.body.resu_no;
	var user_email = req.body.email;
	var user_no = req.body.userno;

	var sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
	var res_resu = await directQuery(sql, [resu_no]);

	var resu_state = res_resu[0].nApplicantState;
	var resu_email = res_resu[0].sReusableEmail;
	var resu_name = res_resu[0].sReusableName;
	var resu_place = res_resu[0].sReusablePlace;

	sql = "SELECT * FROM tblReusableApplicant WHERE nReusableNo=? AND sApplicantNumber=?";
	var res_list = await directQuery(sql, [resu_no, user_no]);

	var html = ``;

	//if(resu_state == 0)
	if (resu_email == user_email) {
		html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 마켓</title></head>
		<body><script>alert ('자신이 신청한 물품입니다.');window.close ();</script></body>
		</html>`;
	}
	else if (res_list.length == 0) {
		//sql = "UPDATE tblReusable SET sReusableApplicant=?, nApplicantState=? WHERE nReusableNo=?";
		sql = 'INSERT INTO tblReusableApplicant(nReusableNo,sApplicantNumber) VALUES(?,?);';
		await directQuery(sql, [resu_no, user_no]);

		/*
		if(resu_state == 0)
		{
			sql = "UPDATE tblReusable SET nApplicantState=1 WHERE nReusableNo=?";
			await directQuery(sql, [resu_no]);
		}
		*/

		html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 마켓</title></head>
		<body><script>alert ('재사용 물품을 신청하였습니다.');window.close ();</script></body>
		</html>`;

		let today = new Date();

		var html_data = user_email + " 님께서 다음과 같은 재사용 물품에 신청을 하였습니다.<br>";
		html_data += "일자 : " + today.toLocaleString() + "<br>";
		html_data += "재사용 물품 이름 : " + resu_name + "<br>";
		html_data += "수령 위치 : " + resu_place + "<br>";

		let mailOptions = {
			from: 'kbw3672@naver.com', // 보내는 메일의 주소
			to: resu_email, // 수신할 이메일
			subject: "고려대학교 자산관리 시스템 재사용 물품 신청", // 메일 제목
			html: html_data, // 메일 내용
		};

		transporter.sendMail(mailOptions);
	}
	else {
		html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 마켓</title></head>
		<body><script>alert ('이미 신청한 사용자가 존재한 상태입니다.');window.close ();</script></body>
		</html>`;
	}
	res.send(html);
});

//바뀌지좀 마라 
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

app.post('/reusableCreate_page', async function (req, res) {

	var user_idx = req.body.userid;
	var nStart = 0;

	var user_mail = req.session.user.email;
	var user_phone = req.session.user.tel;

	if (req.body.nstart) {
		nStart = req.body.nstart;
	}

	//var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	tsql += "AND (sPublic='개인' or sPublic='')";

	//var res_total = await directQuery(tsql, [user_idx]);
	var res_total = await directQuery(tsql);

	var total = res_total[0].tot;

	//var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	var sql = "SELECT * FROM tblFixture WHERE (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	sql += "AND (sPublic='개인' or sPublic='')";
	sql += " LIMIT 10 OFFSET ?;";

	//var pinfos = await directQuery(sql, [user_idx, Number(nStart * 10)]);
	var pinfos = await directQuery(sql, [Number(nStart * 10)]);

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	console.log('total', total);

	res.send({ pinfos: pinfos, page_data: page_data, user_mail: user_mail, user_phone: user_phone });
});

app.get('/reusable_view', session_exists, async function (req, res) {
	// 세션에서 사용자 정보 가져오기
	var user_email = req.session.user['email'];
	var user_phone = req.session.user['tel'];
	var user_id = req.session.user['userid'];

	// 전체 재사용 물품 수 조회
	var tsql = "SELECT count(*) as tot FROM tblReusable; ";
	var res_total = await directQuery(tsql);
	var total = res_total[0].tot;

	// 전체 재사용 물품 목록 조회 (최신순)
	var sql = "SELECT * FROM tblReusable ORDER BY dFixtureDate DESC";
	sql += " LIMIT 10 OFFSET ?;";
	var nStart = 0;
	var rinfos = await directQuery(sql, [Number(nStart * 10)]);

	// 사용자가 등록한 재사용 물품 조회
	sql = "SELECT * FROM tblReusable WHERE sReusableUserNo=? ORDER BY dFixtureDate DESC";
	sql += " LIMIT 10 OFFSET ?;";
	// 사용자가 등록한 재사용 물품 목록을 조회하는 쿼리 실행
	// rinfos_reg: 사용자가 등록한 재사용 물품 정보를 담는 배열
	// user_id: 현재 로그인한 사용자의 ID
	// nStart: 페이지네이션을 위한 시작 인덱스 (0부터 시작)
	// Number(nStart * 10): 한 페이지당 10개씩 표시하기 위해 offset 계산
	var rinfos_reg = await directQuery(sql, [user_id, Number(nStart * 10)]);

	// 디버깅용 - 현재 로그인한 사용자의 ID 출력 
	console.log("user_id", user_id);

	// 사용자가 신청한 재사용 물품 목록 조회
	sql = 'SELECT * FROM tblReusableApplicant WHERE sApplicantNumber=?;';
	var rinfos_list = await directQuery(sql, [user_id]);

	var rinfos_appli = [];

	/* 기존 신청자 목록 처리 로직 주석처리
	for(var i = 0; i < rinfos.length; i++)
	{
		if(rinfos[i].sReusableApplicant_List != "")
		{
			var resu_list_str = JSON.stringify(rinfos[i].sReusableApplicant_List);
			var resu_str = resu_list_str.replaceAll('"','');
			var resu_str2 = resu_str.replaceAll('[','');
			var resu_str3 = resu_str2.replaceAll(']','');
			var resu_list = resu_str3.split(',');

			var indx = resu_list.indexOf(user_id);

			for(var j = 0; j < resu_list.length; j++)
			{
				var resu_item = resu_list[j].replaceAll("'","");

				if(resu_item == user_id)
				{
					rinfos_appli.push(rinfos[i]);
					break;
				}
			}
		}
	}
	*/

	// 신청한 물품 정보 매칭
	for (var i = 0; i < rinfos_list.length; i++) {
		var appli_no = rinfos_list[i].nReusableNo;
		for (var j = 0; j < rinfos.length; j++) {
			if (appli_no == rinfos[j].nReusableNo) {
				rinfos_appli.push(rinfos[j]);
			}
		}
	}

	// 등록 및 신청 물품 목록 병합
	var rinfos_result = [];
	for (var i = 0; i < rinfos_reg.length; i++) {
		rinfos_result.push(rinfos_reg[i]);
	}
	for (var i = 0; i < rinfos_appli.length; i++) {
		rinfos_result.push(rinfos_appli[i]);
	}

	// 페이지네이션 정보 설정
	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
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

	// 디버깅용 로그 출력
	console.log("rinfos", rinfos);
	console.log("rinfos_result", rinfos_result);
	console.log("rinfos_reg", rinfos_reg);
	console.log("rinfos_list", rinfos_list);

	// 재사용 물품 조회 페이지 렌더링
	res.render("reusable_view", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		userid: req.session.user.userid,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		rinfos: rinfos_result,
		page_data: page_data,
		user_email: user_email,
		user_phone: user_phone,
		rinfos_reg: rinfos_reg,
		rinfos_appli: rinfos_appli,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});

app.get('/reusable_admin', session_exists, async function (req, res) {
	var tsql = "SELECT count(*) as tot FROM tblReusable; ";

	var res_total = await directQuery(tsql);

	var total = res_total[0].tot;

	var sql = "SELECT * FROM tblReusable";
	sql += " LIMIT 10 OFFSET ?;";

	var nStart = 0;

	var rinfos = await directQuery(sql, [Number(nStart * 10)]);

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	var user_email = req.session.user['email'];
	var user_phone = req.session.user['tel'];

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

	console.log('total', total);

	res.render("reusable_admin", { idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, rinfos: rinfos, page_data: page_data, user_email: user_email, user_phone: user_phone, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

/*
 * 고장신고(별도화면) html 데이터 가져오기
 */
app.get('/user_set', session_exists, async function (req, res) {
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
app.get('/timetables', session_exists, async function (req, res) {
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
app.get('/status_set', session_exists, function (req, res) {
	console.log('app.get /status_set');

	/*
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	*/

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

	const value_email = data.email;
	const value_tel = data.tel;

	//처리완료일 때만
	const updateQuery = 'UPDATE tblRepair ';
	const setQuery = value_mode === 2 ? 'SET nMode=?,sDoneName=?,sMail=?,sTel=?,dDoneDate=NOW() ' : 'SET nMode=?,sDoneName=?,sMail=?,sTel=? ';
	const whereQuery = 'WHERE nIndex=? ';
	const queryEnd = ';'
	var sql = updateQuery + setQuery + whereQuery + queryEnd;
	console.log(sql, value_mode, value_done, value_idx, value_email, value_tel)

	var ret = await directQuery(sql, [value_mode, value_done, value_email, value_tel, value_idx,]);
	const html = `<!DOCTYPE html>
	<html><head><meta charset='UTF-8'><title>고려대AV비품관리</title></head></head>
	<body><script>alert('저장되었습니다.');window.close();</script></body>
	</html>`;

	if (value_mode == 2) {
		let today = new Date();

		var html_data = data.name + "님께서 신청하신 고장 점검 요청에 관한 처리가 완료되었습니다.<br>";
		html_data += "일자 : " + today.toLocaleString() + "<br>";
		html_data += "고장내용 : " + data.memo + "<br>";

		let mailOptions = {
			from: 'kbw3672@naver.com', // 보내는 메일의 주소
			to: data.email, // 수신할 이메일
			subject: "고려대학교 자산관리 시스템 고장 점검 완료", // 메일 제목
			html: html_data, // 메일 내용
		};

		//transporter.sendMail(mailOptions);
	}

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

app.post('/fImg_set', async function (req, res) {
	console.log('fImg_set start!!');
	//console.log('ret first==>'+ret[0].sImgPath);
	var data = JSON.parse(req.body.data);
	var repairIdx = data.idx;
	var ret = 0;
	var ret2 = 0;
	console.log('ret==>' + ret);
	console.log('ret2==>' + ret2);
	console.log('repairIdx==>' + repairIdx);


	sql0 = 'select * from tblFixtureImg where nFixtureIdx =? ;';

	ret0 = await directQuery(sql0, [repairIdx]);
	console.log('ret0==>' + JSON.stringify(ret0));
	console.log('ret0==>' + typeof ret0);
	if (ret0.length == 0) {
		console.log('조회된 이미지가 없습니다!!');
		for (var i = 0; i < data.repairImg.length; i++) {
			sql = 'INSERT INTO tblFixtureImg(nFixtureIdx,sImgPath,sImgBin) ';
			sql += 'VALUES(?,?,?);';

			ret = await directQuery(sql, [repairIdx, data.repairImg[i], data.repairImgBin[i]]);
			console.log('ret==>' + JSON.stringify(ret));
			console.log('ret==>' + typeof ret);
		}
	} else {
		console.log('이미지가 있습니다!!');
		console.log('ret0[0].nIndex==>' + ret0[0].nIndex);
		console.log('ret0[0].nFixtureIdx==>' + ret0[0].nFixtureIdx);
		var beforeIdx = ret0[0].nIndex;
		var beforeFixIdx = ret0[0].nFixtureIdx;
		console.log('beforeIdx==>' + beforeIdx);
		console.log('beforeFixIdx==>' + beforeFixIdx);

		sql1 = 'delete from tblFixtureImg where nIndex = ? and nFixtureIdx = ?;';
		ret1 = await directQuery(sql1, [beforeIdx, beforeFixIdx]);
		console.log('ret1: ' + JSON.stringify(ret1));
		console.log('ret1: ' + typeof ret1);
		if (!ret1.affectedRows) {
			console.log('기존 이미지 삭제가 되지 않았습니다.');
		} else if (ret1.affectedRows) {
			console.log('기존 이미지가 삭제되었습니다.');
			for (var i = 0; i < data.repairImg.length; i++) {
				sql = 'INSERT INTO tblFixtureImg(nFixtureIdx,sImgPath,sImgBin) ';
				sql += 'VALUES(?,?,?);';

				ret2 = await directQuery(sql, [repairIdx, data.repairImg[i], data.repairImgBin[i]]);
				console.log('ret2: ' + JSON.stringify(ret2));
				console.log('ret2: ' + typeof ret2);
			}
		}

	}
	/*
	for (var i = 0; i < data.repairImg.length; i++) {
		sql = 'INSERT INTO tblFixtureImg(nFixtureIdx,sImgPath,sImgBin) ';
		sql += 'VALUES(?,?,?);';

		ret = await directQuery(sql, [repairIdx, data.repairImg[i], data.repairImgBin[i]]);
	}*/

	var result = '저장되었습니다.';
	console.log('ret==>' + ret);
	console.log('ret.affectedRows==>' + ret.affectedRows);
	console.log('ret==>' + typeof ret);
	console.log('ret==>' + JSON.stringify(ret));
	console.log('ret2==>' + ret2);
	console.log('ret2.affectedRows==>' + ret2.affectedRows);
	console.log('ret2==>' + typeof ret2);
	console.log('ret2==>' + JSON.stringify(ret2));
	//if (!ret.affectedRows) {
	if (!ret.affectedRows) {
		console.log('ret.affectedRows if==>' + ret.affectedRows);
	}
	if (!ret.affectedRows && !ret2.affectedRows) {
		result = '저장하지 못했습니다.\n관리자에게 문의해주세요.';
	}

	res.send({ result: result });
});

app.post('/fImg_select', async function (req, res) {
	console.log('fImg_select start!!');
	var data = JSON.parse(req.body.data);
	var nFixtureIdx = data.nFixtureIdx;
	console.log('nFixtureIdx==>' + nFixtureIdx);
	console.log('nFixtureIdx==>' + typeof nFixtureIdx);
	/*for (var i = 0; i < data.repairImg.length; i++) {
		sql = 'select * from tblFixtureImg ';
		sql += 'where nFixtureIdx =?;';

		ret = await directQuery(sql, [nFixtureIdx]);
	}*/
	sql = 'select * from tblFixtureImg where nFixtureIdx =? ;';

	ret = await directQuery(sql, [nFixtureIdx]);
	//console.log('ret==>'+JSON.stringify(ret[0].nIndex));
	/*var result = '조회되었습니다.';
	if (!ret.affectedRows) {
		result = '해당sFixtureNo의이미지가 없습니다.\n관리자에게 문의해주세요.';
	}*/
	sql2 = 'select dDiligence from tblFixture where sFixtureNo =? ;';

	ret2 = await directQuery(sql2, [nFixtureIdx]);
	//console.log('ret2==>'+JSON.stringify(ret2[0].nIndex));
	console.log('ret2==>' + JSON.stringify(ret2[0].dDiligence));
	var dili = ret2[0].dDiligence;
	console.log('dili==>', dili, typeof dili);

	//res.send({ result: ret });
	res.send({ result: ret, dili: dili });
});

app.post('/fImg_select2', async function (req, res) {
	console.log('fImg_select2 start!!');
	var data = JSON.parse(req.body.data);
	var nFixtureIdx = data.nFixtureIdx;
	console.log('nFixtureIdx==>' + nFixtureIdx);
	console.log('nFixtureIdx==>' + typeof nFixtureIdx);
	/*for (var i = 0; i < data.repairImg.length; i++) {
		sql = 'select * from tblFixtureImg ';
		sql += 'where nFixtureIdx =?;';

		ret = await directQuery(sql, [nFixtureIdx]);
	}*/
	sql = 'select * from tblFixtureImg where nFixtureIdx =? ;';

	ret = await directQuery(sql, [nFixtureIdx]);
	//console.log('ret==>'+JSON.stringify(ret[0].nIndex));

	sql2 = 'select dDiligence from tblFixture where sFixtureNo =? ;';

	ret2 = await directQuery(sql2, [nFixtureIdx]);
	//console.log('ret2==>'+JSON.stringify(ret2[0].nIndex));
	console.log('ret2==>' + JSON.stringify(ret2[0].dDiligence));
	var dili = ret2[0].dDiligence;
	console.log('dili==>', dili, typeof dili);

	res.send({ result: ret, dili: dili });
});


app.post('/updateFixture', async function (req, res) {
	console.log("updateFixture start!!");
	var data = req.body.data;
	var setIdx2 = data.setIdx;
	var userId2 = data.userid;
	var memo2 = data.memo;
	console.log('data==>' + data);
	console.log('setIdx2==>' + setIdx2);
	console.log('userId2==>' + userId2);
	console.log('memo2==>' + memo2);
	var sname = '';
	var ssearch = 0;
	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}

	sql = 'update tblFixture set dMemo = ?, dDiligence = 2, dUserNo = ?, dDiligenceDate = now()  where sFixtureNo = ?;';

	ret = await directQuery(sql, [memo2, userId2, setIdx2]);
	console.log('ret==>' + JSON.stringify(ret));

	var sql2 = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
	var rinfos = await directQuery(sql2, [userId2]);
	var total = rinfos.length;
	var pinfos = await directQuery(sql2, [userId2]);
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total
	};

	//console.log('req.session.user.userid==>'+req.session.user.userid);

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ result: ret, page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });

	//res.send({ result: ret });

});

app.post('/updateFixture2', async function (req, res) {
	console.log("updateFixture2 start!!");
	var data = req.body.data;
	var setIdx2 = data.setIdx;
	var userId2 = data.userid;
	var memo2 = data.memo;
	console.log('data==>' + data);
	console.log('setIdx2==>' + setIdx2);
	console.log('userId2==>' + userId2);
	console.log('memo2==>' + memo2);
	var sname = '';
	var ssearch = 0;
	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}

	sql = 'update tblFixture set dMemo = ?, dDiligence = 2, dUserNo = ?, dDiligenceDate = now()  where sFixtureNo = ?;';

	ret = await directQuery(sql, [memo2, userId2, setIdx2]);
	console.log('ret==>' + JSON.stringify(ret));

	var sql2 = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
	var rinfos = await directQuery(sql2, [userId2]);
	var total = rinfos.length;
	var pinfos = await directQuery(sql2, [userId2]);
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total
	};

	//console.log('req.session.user.userid==>'+req.session.user.userid);

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ result: ret, page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });

	//res.send({ result: ret });

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

app.get('/classroom', session_exists, async function (req, res) {
	console.log("/classroom 1288 line start!!");
	var build = 43;
	// var room = 4141;
	var nstart = 0;

	var build_all = 1;
	var category = 110;

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_all_info = await directQuery(sql, [build_all]);

	console.log('build_all_info[0] JSON==>' + JSON.stringify(build_all_info[0]));
	console.log('build_all_info[0]==>' + build_all_info[0].nIndex);
	console.log('category==>' + category);
	const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory =? AND sCatagory!="" ORDER BY nIndex;';
	const rooms = await directQuery(roomsSql, [build_all_info[0].nIndex, category]);
	const roomsInitData = rooms[0];
	/*
	var build_all = 1;
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery (sql, [build_all]);

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? and nIndex= ? ;';
	var room_info = await directQuery (sql, [build,room]);
	*/

	sql = 'SELECT * FROM tblBuild WHERE sCatagory=? limit 1;';
	var room_info = await directQuery(sql, [category]);

	sql = 'SELECT * FROM tblBuild WHERE nIndex= ? ;';
	var build_select_info = await directQuery(sql, [room_info[0].nRootIndex]);


	// 강의실 비품 가져오기
	/*
		var sql = 'SELECT a.sName name,b.nIndex dindex,b.sItemNumber dnum,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
		sql += 'b.sStatus status,c.sOrgName org_name,c.sMasterName master_name,c.sRealName real_name,c.sUserName user_name,c.nPublic public ';
		sql += 'FROM tblBuild a,tblDevice b LEFT OUTER JOIN tblRelation c ';
		sql += 'ON b.nIndex=c.nDeviceIdx WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=? ';
		*/

	sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	var res_room = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID, Number(nstart * 10)]);

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / 10;

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
		'build': roomsInitData.nRootIndex,
		'room': roomsInitData.nIndex,
		'roomID': roomsInitData.sRoomID,
		'roomName': roomsInitData.sName
	};

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})

	res.render("sub_classroom", { page_data: page_data, lists: build_all_info, rinfos: changedRinfos, room_info: rooms });
});

app.post('/classroom_build', async function (req, res) {

	var build = 1;
	var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	if (req.body.build) {
		build = req.body.build;
	}

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	console.log("new build num", build);

	var sql = '';
	//sql = 'SELECT * FROM tblBuild WHERE nRootIndex=?;';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and sCatagory="110";';
	var room_info = await directQuery(sql, [build]);

	if (room_info.length == 0) {
		var rinfos = [];

		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;

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

		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
	else {
		// 강의실 비품 가져오기

		console.log("new room num", room_info[0].sRoomID);

		sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT ? OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, plimit, Number(nstart * plimit)]);
		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;
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
			'roomID': room_info[0].sRoomID,
			'roomNm': room_info[0].sName
		};

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rinfos: changedRinfos, room_info: room_info });
	}
});

app.post('/classroom_room', async function (req, res) {

	var build = 1;
	var room = 2;
	var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	if (req.body.build) {
		build = req.body.build;
	}
	if (req.body.room) {
		room = req.body.room;
	}

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var sql = '';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and nIndex=? and sCatagory="110";';
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
			'roomID': room_info[0].sRoomID,
			'roomNm': room_info[0].sName
		};

		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
	else {
		// 강의실 비품 가져오기

		sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT ? OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, plimit, Number(nstart * plimit)]);
		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;
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
			'roomID': room_info[0].sRoomID,
			'roomNm': room_info[0].sName
		};

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rinfos: changedRinfos, room_info: room_info });
	}


});

app.post('/classroom_page', async function (req, res) {

	var build = 1;
	var room = 2;
	var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	if (req.body.build) {
		build = parseInt(req.body.build);
	}
	if (req.body.room) {
		room = parseInt(req.body.room);
	}
	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var sql = '';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and nIndex=? and sCatagory="110";';
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
			'roomID': ''//room_info[0].sRoomID
		};

		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rinfos: rinfos, room_info: room_info });
	}
	else {
		console.log("room_info page");

		// 강의실 비품 가져오기

		sql = 'SELECT sBuild build,sRoom room, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT ? OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, plimit, Number(nstart * plimit)]);
		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;
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

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})

		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rinfos: changedRinfos, room_info: room_info });
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
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
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

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.render("sub_classroom", { page_data: page_data, lists: build_info, rinfos: changedRinfos, room_info: room_info });
});

app.post('/classroom', async function (req, res) {

	console.log("/classroom 1718 line start!!");
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
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
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

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, lists: lists, rooms: rooms, rinfos: changedRinfos, room_info: room_info });
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
		const room_id = req.query.roomid

		/*
		var sql = 'SELECT b.sName buildname,a.sFloorID floor,a.sRoomID roomnum,a.sName roomname,c.sType type,c.sItemNumber itemnum,c.sList list,c.sMaker maker, ';
		sql += 'c.sModel model,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public,c.sStatus status ';
		sql += 'FROM tblBuild a,tblBuild b,tblDevice c LEFT OUTER JOIN tblRelation d ';
		sql += 'ON c.nIndex=d.nDeviceIdx ';
		sql += 'WHERE a.nIndex=c.nRoomIndex AND a.nRootIndex=b.nIndex AND c.nRoomIndex=? ';
		*/

		/**
		 * SELECT * FROM tblFixture JOIN `tblBuild` ON `tblBuild`.`sBuildID` = `tblFixture`.`sBuildNo` WHERE `nRootIndex`=? AND `nIndex`=? AND sFixtureStatus="사용";
		 */
		var sql = 'SELECT * ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo= ? AND sRoomNo= ? AND sFixtureStatus="사용";';
		const testQuery = 'SELECT * FROM tblFixture JOIN `tblBuild` ON `tblBuild`.`sBuildID` = `tblFixture`.`sBuildNo` WHERE `nRootIndex`=? AND `nIndex`=? AND `sRoomNo`=? AND sFixtureStatus="사용";';
		var res_room = await directQuery(testQuery, [build_idx, room_idx, room_id]);

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
			{ header: '취득일자', key: 'date', width: 10 },
			{ header: '취득금액', key: 'price', width: 10 },
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

			var fix_date = res_room[i].dFixtureDate.substring(0, 10);
			var fix_price = res_room[i].sFixturePrice == null ? 0 : res_room[i].sFixturePrice.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

			rows['build'] = res_room[i].sBuild;
			rows['floor'] = res_room[i].sFloor;
			rows['roomnum'] = res_room[i].sRoomNo;
			rows['room'] = res_room[i].sRoom;
			rows['category'] = res_room[i].sFixtureType;
			rows['itemnum'] = res_room[i].sFixtureNo;
			rows['name'] = res_room[i].sFixtureName;
			rows['model'] = res_room[i].sFixtureModel + "(" + res_room[i].sFixtureMaker + ")";
			rows['date'] = fix_date;
			rows['price'] = fix_price;
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

app.get('/organization', session_exists, async function (req, res) {

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
	var org_index = 55;			// 가져올 값

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


	var sql = 'SELECT sName name ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE nindex=? ';

	var res_org = await directQuery(sql, [org_index]);

	sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

	var res_total = await directQuery(sql, [res_org[0].name]);
	var total = res_total.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var oinfos = await directQuery(sql, [res_org[0].name, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	const changedOinfos = oinfos.map((data) => {
		if (data.user === '공동사용') {
			data.user = '공용'
		}
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	sql = "SELECT * FROM tblAuthority WHERE sStdId=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	res.render("sub_organization", {
		page_data: page_data, large_lists: large_lists, middle_lists: middle_lists,
		small_lists: small_lists, contents_lists: contents_lists, slarge: select_l,
		smiddle: select_m, ssmall: select_s, scontents: select_c, oinfos: changedOinfos, authority_list: authority_list, sel_authority: req.session.user.selectAuithority
	});
});

app.post('/organization_large', async function (req, res) {

	console.log('app.post /organization_large');

	var middle_lists = '';		// 중분류 결과 리스트
	var small_lists = '';		// 소분류 결과 리스트
	var content_lists = '';	// 부속 결과 리스트

	// 선택된 대분류가 있다면
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
	middle_lists = await directQuery(sql, [req.body.slarge]);

	if (middle_lists.length > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		small_lists = await directQuery(sql, [middle_lists[0].nIndex]);
	}

	if (small_lists.length > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		content_lists = await directQuery(sql, [small_lists[0].nIndex]);
	}

	res.send({ middle_lists: middle_lists, small_lists: small_lists, content_lists: content_lists });
});

app.post('/organization_middle', async function (req, res) {

	console.log('app.post /organization_middle');

	var small_lists = '';		// 소분류 결과 리스트
	var content_lists = '';	// 부속 결과 리스트

	// 선택된 대분류가 있다면
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
	small_lists = await directQuery(sql, [req.body.smiddle]);

	if (small_lists.length > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		content_lists = await directQuery(sql, [small_lists[0].nIndex]);
	}

	res.send({ small_lists: small_lists, content_lists: content_lists });
});

app.post('/organization_small', async function (req, res) {

	console.log('app.post /organization_small');

	var content_lists = '';	// 부속 결과 리스트

	// 선택된 대분류가 있다면
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
	content_lists = await directQuery(sql, [req.body.ssmall]);

	res.send({ content_lists: content_lists });
});

app.post('/organization', async function (req, res) {

	console.log('app.post /organization');

	var large_lists = [];		// 대분류 결과 리스트
	var middle_lists = [];		// 중분류 결과 리스트
	var small_lists = [];		// 소분류 결과 리스트
	var contents_lists = [];	// 부속 결과 리스트
	var select_l = -1;			// 대분류 선택값
	var select_m = -1;			// 중분류 선택값
	var select_s = -1;			// 소분류 선택값
	var select_c = -1;			// 부속 선택값
	var mode = 'large';			// 분류값 기본
	var org_index = 0;			// 가져올 값
	var pmode = 0;
	var plimit = 10;

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
		//if (select_l > 0)
		//org_index = req.body.slarge;
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

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
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
		middle_lists = [];
		for (var index = 0; index < large_lists.length; index++) {
			var part_middle_list = [];
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			part_middle_list = await directQuery(sql, [large_lists[index].nIndex]);

			for (var part_index = 0; part_index < part_middle_list.length; part_index++) {
				middle_lists.push(part_middle_list[part_index]);
			}
		}
		//sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		//middle_lists = await directQuery(sql, [large_lists[0].nIndex]);
	}


	// 소분류 리스트
	if (req.body.smiddle > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		small_lists = await directQuery(sql, [req.body.smiddle]);
	}
	else {
		small_lists = [];

		for (var index = 0; index < middle_lists.length; index++) {
			var part_small_list = [];
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			part_small_list = await directQuery(sql, [middle_lists[index].nIndex]);

			for (var part_index = 0; part_index < part_small_list.length; part_index++) {
				small_lists.push(part_small_list[part_index]);
			}
		}
	}
	if (req.body.ssmall > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		contents_lists = await directQuery(sql, [req.body.ssmall]);
	}
	else {
		contents_lists = [];

		for (var index = 0; index < small_lists.length; index++) {
			var part_contents_list = [];
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			part_contents_list = await directQuery(sql, [small_lists[index].nIndex]);

			console.log("part_contents_list", part_contents_list);

			for (var part_index = 0; part_index < part_small_list.length; part_index++) {
				contents_lists.push(part_contents_list[part_index]);
			}
		}
	}

	/*
	var sql = 'SELECT a.sName roomname,b.nIndex dindex,b.sItemNumber dnum,c.sName buildname,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	sql += 'b.sStatus status,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public ';
	sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx AND d.nOrgIdx=? ';
	*/

	var oinfos = [];
	var oinfos_total = [];
	var total = 0;

	if (org_index == 0) {
		if (contents_lists.length != 0) {
			for (var index = 0; index < contents_lists.length; index++) {
				if (contents_lists[index] != undefined) {
					sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
					sql += 'FROM tblFixture ';
					sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

					var res_total = await directQuery(sql, [contents_lists[index].sName]);
					total += res_total.length;

					for (var part_index = 0; part_index < res_total.length; part_index++) {
						oinfos_total.push(res_total[part_index]);
					}
				}
			}
		}

		if (small_lists.length != 0) {
			for (var index = 0; index < small_lists.length; index++) {
				if (small_lists[index] != undefined) {
					sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
					sql += 'FROM tblFixture ';
					sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

					var res_total = await directQuery(sql, [small_lists[index].sName]);
					total += res_total.length;

					for (var part_index = 0; part_index < res_total.length; part_index++) {
						oinfos_total.push(res_total[part_index]);
					}
				}
			}
		}

		if (middle_lists.length != 0) {
			for (var index = 0; index < middle_lists.length; index++) {
				if (middle_lists[index] != undefined) {
					sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
					sql += 'FROM tblFixture ';
					sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

					var res_total = await directQuery(sql, [middle_lists[index].sName]);
					total += res_total.length;

					for (var part_index = 0; part_index < res_total.length; part_index++) {
						oinfos_total.push(res_total[part_index]);
					}
				}
			}
		}

		oinfos = oinfos_total.slice(0, plimit);
	}
	else {
		var sql = 'SELECT sName name ';
		sql += 'FROM tblOrganization ';
		sql += 'WHERE nindex=? ';

		var res_org = await directQuery(sql, [org_index]);

		sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

		var res_total = await directQuery(sql, [res_org[0].name]);

		total = res_total.length;
		sql += 'LIMIT ? OFFSET ?;';
		oinfos = await directQuery(sql, [res_org[0].name, plimit, Number(nstart * 10)]);
		//console.log("oinfos",oinfos);
	}



	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	const changedOinfos = oinfos.map((data) => {
		if (data.user === '공동사용') {
			data.user = '공용'
		}
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({
		page_data: page_data, large_lists: large_lists, middle_lists: middle_lists,
		small_lists: small_lists, contents_lists: contents_lists, slarge: select_l,
		smiddle: select_m, ssmall: select_s, scontents: select_c, oinfos: changedOinfos
	});
});

app.post('/organization_search', async function (req, res) {
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	var nstart = parseInt(req.body.nstart);
	var sname = req.body.sname;
	var smode = req.body.smode;
	//var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var user_idx = req.session.user.userid;

	var sql = "";

	var res_org = [];
	var res_total = [];
	var oinfos = [];
	var org_index = -1;
	var total = 0;

	if (smode == 1) {
		sql = 'SELECT nOrgIdx ';
		sql += 'FROM tblUser ';
		sql += 'WHERE sName=? ';
		var res_user = await directQuery(sql, [sname]);
		org_index = res_user[0].nOrgIdx;

		sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sUser=? AND sFixtureStatus="사용" ';

		res_total = await directQuery(sql, [sname]);
		total = res_total.length;

		sql += 'LIMIT ? OFFSET ?;';
		oinfos = await directQuery(sql, [sname, plimit, Number(nstart * plimit)]);
	}
	else if (smode == 2) {
		sql = 'SELECT sName, nIndex ';
		sql += 'FROM tblOrganization ';
		sql += 'WHERE sName=? ';
		res_org = await directQuery(sql, [sname]);
		org_index = res_org[0].nIndex;

		sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

		res_total = await directQuery(sql, [res_org[0].sName]);
		total = res_total.length;

		sql += 'LIMIT ? OFFSET ?;';
		oinfos = await directQuery(sql, [res_org[0].sName, plimit, Number(nstart * plimit)]);
	}

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	const changedOinfos = oinfos.map((data) => {
		if (data.user === '공동사용') {
			data.user = '공용'
		}
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, oinfos: changedOinfos });
});

app.post('/organization_page', async function (req, res) {
	var large_lists = [];		// 대분류 결과 리스트
	var middle_lists = [];		// 중분류 결과 리스트
	var small_lists = [];		// 소분류 결과 리스트
	var contents_lists = [];	// 부속 결과 리스트
	var select_l = -1;			// 대분류 선택값
	var select_m = -1;			// 중분류 선택값
	var select_s = -1;			// 소분류 선택값
	var select_c = -1;			// 부속 선택값
	var mode = 'large';			// 분류값 기본
	var org_index = 0;			// 가져올 값
	var pmode = 0;
	var plimit = 10;
	var sname = '';				//search 결과 적용

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
		//if (select_l > 0)
		//org_index = req.body.slarge;
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

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	if (req.body.sname) {
		sname = req.body.sname;
	}
	// 대분류 리스트
	sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=0 ORDER BY sName ASC';
	large_lists = await directQuery(sql);

	// 중분류 리스트
	if (req.body.slarge > 0) {
		// 선택된 대분류가 있다면
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		middle_lists = await directQuery(sql, [req.body.slarge]);
	}
	else {
		middle_lists = [];
		for (var index = 0; index < large_lists.length; index++) {
			var part_middle_list = [];
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
			part_middle_list = await directQuery(sql, [large_lists[index].nIndex]);

			for (var part_index = 0; part_index < part_middle_list.length; part_index++) {
				middle_lists.push(part_middle_list[part_index]);
			}
		}
		//sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		//middle_lists = await directQuery(sql, [large_lists[0].nIndex]);
	}


	// 소분류 리스트
	if (req.body.smiddle > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		small_lists = await directQuery(sql, [req.body.smiddle]);
	}
	else {
		small_lists = [];

		for (var index = 0; index < middle_lists.length; index++) {
			var part_small_list = [];
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';

			part_small_list = await directQuery(sql, [middle_lists[index].nIndex]);

			for (var part_index = 0; part_index < part_small_list.length; part_index++) {
				small_lists.push(part_small_list[part_index]);
			}
		}
	}
	if (req.body.ssmall > 0) {
		sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';
		contents_lists = await directQuery(sql, [req.body.ssmall]);
	}
	else {
		contents_lists = [];

		for (var index = 0; index < small_lists.length; index++) {
			var part_contents_list = [];
			sql = 'SELECT * FROM tblOrganization WHERE nRootIndex=? ORDER BY sName ASC;';

			part_contents_list = await directQuery(sql, [small_lists[index].nIndex]);

			for (var part_index = 0; part_index < part_small_list.length; part_index++) {
				contents_lists.push(part_contents_list[part_index]);
			}
		}
	}

	var sql = 'SELECT sName name ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE nindex=? ';

	var oinfos = [];
	var oinfos_total = [];
	var total = 0;

	if (org_index == 0) {
		if (contents_lists.length != 0) {
			const sNames = [];
			for (var index = 0; index < contents_lists.length; index++) {
				if (contents_lists[index] != undefined) {
					sNames.push(small_lists[index].sName)
				}
			}
			//반복문 밖으로 빼내기
			let sNamesText = sNames
			var sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price, sPublic public ';
			sql += 'FROM tblFixture ';
			sql += 'WHERE sUserOrg IN (?) AND sFixtureStatus="사용" ';

			if (sname) {
				sNamesText = sname;
			}
			var res_total = await directQuery(sql, [sNamesText]);
			total += res_total.length;

			for (var part_index = 0; part_index < res_total.length; part_index++) {
				oinfos_total.push(res_total[part_index]);
			}
		}

		if (small_lists.length != 0) {
			const sNames = [];
			for (var index = 0; index < small_lists.length; index++) {
				if (small_lists[index] != undefined) {
					sNames.push(small_lists[index].sName)
				}
			}
			//반복문 밖으로 빼내기
			let sNamesText = sNames
			var sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price, sPublic public ';
			sql += 'FROM tblFixture ';
			sql += 'WHERE sUserOrg IN (?) AND sFixtureStatus="사용" ';

			if (sname) {
				sNamesText = sname;
			}
			var res_total = await directQuery(sql, [sNamesText]);
			total += res_total.length;

			for (var part_index = 0; part_index < res_total.length; part_index++) {
				oinfos_total.push(res_total[part_index]);
			}
		}

		if (middle_lists.length != 0) {
			const sNames = [];
			for (var index = 0; index < middle_lists.length; index++) {
				if (middle_lists[index] != undefined) {
					sNames.push(middle_lists[index].sName)
				}
			}
			//반복문 밖으로 빼내기
			let sNamesText = sNames
			var sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price, sPublic public ';
			sql += 'FROM tblFixture ';
			sql += 'WHERE sUserOrg IN (?) AND sFixtureStatus="사용" ';

			if (sname) {
				sNamesText = sname;
			}
			var res_total = await directQuery(sql, [sNamesText]);
			total += res_total.length;

			for (var part_index = 0; part_index < res_total.length; part_index++) {
				oinfos_total.push(res_total[part_index]);
			}
		}

		oinfos = oinfos_total.slice((nstart * plimit), ((nstart + 1) * plimit));
	}
	else {
		var sql = 'SELECT sName name ';
		sql += 'FROM tblOrganization ';
		sql += 'WHERE nindex=? ';

		var res_org = await directQuery(sql, [org_index]);

		sql = 'SELECT sBuild build,sRoom room,sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price, sPublic public ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sUserOrg=? AND sFixtureStatus="사용" ';

		var res_total = await directQuery(sql, [res_org[0].name]);

		total = res_total.length;
		sql += 'LIMIT ? OFFSET ?;';
		oinfos = await directQuery(sql, [res_org[0].name, plimit, Number(nstart * plimit)]);
		//console.log("oinfos",oinfos);
	}

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total,
		'org_index': org_index
	};

	const changedOinfos = oinfos.map((data) => {
		if (data.user === '공동사용') {
			data.user = '공용'
		}
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({
		page_data: page_data, large_lists: large_lists, middle_lists: middle_lists,
		small_lists: small_lists, contents_lists: contents_lists, slarge: select_l,
		smiddle: select_m, ssmall: select_s, scontents: select_c, oinfos: changedOinfos
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

		// 쿼리 원본
		// sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
		// sql += 'FROM tblFixture ';
		// sql += 'WHERE sUserOrg=? ';
		sql = 'SELECT sBuild buildname, sFloor floor, sRoomNo roomnum, sRoom roomname,sFixtureType type,sFixtureName itemname,sFixtureNo itemnum,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price,sPublic public ';
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
			{ header: '물품명', key: 'itemname', width: 20 },
			{ header: '모델명(제조사)', key: 'model', width: 45 },
			{ header: '취득일자', key: 'date', width: 10 },
			{ header: '취득금액', key: 'price', width: 10 },
			{ header: '소속부서', key: 'org', width: 10 },
			{ header: '공용/개인', key: 'public', width: 10 },
			{ header: '물품관리자', key: 'real', width: 10 },
			{ header: '사용자', key: 'user', width: 10 },
			{ header: '상태', key: 'status', width: 10 }
		];
		// 필드값 넣기
		for (i = 0; i < res_org.length; i++) {
			var rows = {};

			var fix_date = res_org[i].date.substring(0, 10);
			var fix_price = res_org[i].price == null ? 0 : res_org[i].price.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

			rows['build'] = res_org[i].buildname;
			rows['floor'] = res_org[i].floor;
			rows['roomnum'] = res_org[i].roomnum;
			rows['room'] = res_org[i].roomname;
			rows['category'] = res_org[i].type;
			rows['itemnum'] = res_org[i].itemnum;
			rows['itemname'] = res_org[i].itemname;
			rows['model'] = res_org[i].model ? res_org[i].model + "(" + res_org[i].maker + ")" : " ";
			rows['org'] = res_org[i].org;
			rows['date'] = fix_date;
			rows['price'] = fix_price;
			rows['public'] = res_org[i].public;;
			rows['real'] = res_org[i].real_name;
			rows['user'] = res_org[i].user;
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

app.get('/org_download_name', async function (req, res) {
	try {
		console.log('app.get /org_download_name');
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

		/*
		sql = 'SELECT nOrgIdx ';
		sql += 'FROM tblUser ';
		sql += 'WHERE sName=? ';

		var res_name = await directQuery(sql, [req.query.name]);
		*/

		// 쿼리 원본
		// sql = 'SELECT sBuild build,sRoom room,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price ';
		// sql += 'FROM tblFixture ';
		// sql += 'WHERE sUserOrg=? ';
		sql = 'SELECT sBuild buildname, sFloor floor, sRoomNo roomnum, sRoom roomname,sFixtureType type,sFixtureName itemname,sFixtureNo itemnum,sFixtureModel model,sFixtureMaker maker,sUserOrg org,sUser user, sRuStatus status, dFixtureDate date, sFixturePrice price,sPublic public ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sUser=? AND sFixtureStatus="사용" ';
		var res_org = await directQuery(sql, [req.query.name]);

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
			{ header: '물품명', key: 'itemname', width: 20 },
			{ header: '모델명(제조사)', key: 'model', width: 45 },
			{ header: '취득일자', key: 'date', width: 10 },
			{ header: '취득금액', key: 'price', width: 10 },
			{ header: '소속부서', key: 'org', width: 10 },
			{ header: '공용/개인', key: 'public', width: 10 },
			{ header: '물품관리자', key: 'real', width: 10 },
			{ header: '사용자', key: 'user', width: 10 },
			{ header: '상태', key: 'status', width: 10 }
		];
		// 필드값 넣기
		for (i = 0; i < res_org.length; i++) {
			var rows = {};

			var fix_date = res_org[i].date.substring(0, 10);
			var fix_price = res_org[i].price == null ? 0 : res_org[i].price.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

			rows['build'] = res_org[i].buildname;
			rows['floor'] = res_org[i].floor;
			rows['roomnum'] = res_org[i].roomnum;
			rows['room'] = res_org[i].roomname;
			rows['category'] = res_org[i].type;
			rows['itemnum'] = res_org[i].itemnum;
			rows['itemname'] = res_org[i].itemname;
			rows['model'] = res_org[i].model ? res_org[i].model + "(" + res_org[i].maker + ")" : " ";
			rows['org'] = res_org[i].org;
			rows['date'] = fix_date;
			rows['price'] = fix_price;
			rows['public'] = res_org[i].public;;
			rows['real'] = res_org[i].real_name;
			rows['user'] = res_org[i].user;
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
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	//req.session.user.selectAuithority = sel_authority;
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

	//var ret = await get_user (user_idx);
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	tsql += "AND (sPublic='개인' or sPublic='')";
	sql += "AND (sPublic='개인' or sPublic='')";

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
		pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	}
	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedRinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	res.render('sub_personal', { page_data: page_data, pinfos: changedRinfos, pindex: user_idx, ssearch: ssearch, sname: sname });
});

app.post('/personal_details', async function (req, res) {
	console.log('app.get /personal_details');

	//const productNumber = req.body;
	//console.log('/personal_details productNumber: '+productNumber);
	const productNumber = req.body.number;  // req.body를 통해 데이터를 받아옵니다.
	console.log('/personal_details productNumber: ' + productNumber);
	res.json({ message: 'Data received successfully!!' });

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
	var pmode = 0;
	var plimit = 10;

	console.log('ssearch==>' + ssearch);
	console.log('sname==>' + sname);

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	//await get_user_item (user_idx);
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	tsql += "AND (sPublic='개인' or sPublic='')";
	sql += "AND (sPublic='개인' or sPublic='')";

	var res_total = '';
	// if (ssearch > 0) {
	// 	sql += exsql;
	// 	tsql += exsql;
	// 	res_total = await directQuery(tsql, [user_idx, qsname]);
	// } else {
	// 	res_total = await directQuery(tsql, [user_idx]);
	// }
	// var total = res_total[0].tot;
	//sql += " LIMIT 10 OFFSET ?;";
	// sql += " LIMIT ? OFFSET ?;";

	var qsname = "%" + sname + "%";
	//var qsname = "'%" + sname + "%'";
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
	//sql += 'LIMIT 10 OFFSET ?;';
	//var pinfos = await directQuery (sql, [user_idx,qsname, Number (nstart * 10)]);
	//sql += `LIMIT ${plimit} OFFSET ${plimit};`;
	sql += `LIMIT ${plimit};`;

	console.log("sql==>" + sql);
	console.log("user_idx==>" + user_idx);
	console.log("qsname==>" + qsname);
	console.log("nstart==>" + nstart);
	console.log("Number(nstart)==>" + Number(nstart));
	console.log("Number(nstart)==>" + Number(nstart * 10));
	var pinfos = await directQuery(sql, [user_idx, qsname, Number(nstart * 10)]);
	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};
	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	console.log('changedPinfos==>' + JSON.stringify(changedPinfos));
	res.send({ page_data: page_data, pinfos: changedPinfos, pindex: user_idx, ssearch: ssearch, sname: sname });
});

app.post('/personal_page', async function (req, res) {

	if (req.session.user == undefined) {
		res.render('index');
		return;
	}
	var ssearch = 0;
	let qsname = '';
	var sname = '';
	var nstart = 0;
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var pmode = 0;
	var plimit = 10;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	if (req.body.ssearch) {
		ssearch = parseInt(req.body.ssearch);
	}
	if (req.body.sname) {
		sname = req.body.sname;
	}
	if (sname != '') {
		qsname = "%" + sname + "%";
	}
	var exsql = '';
	// switch (parseInt(ssearch)) {
	// 	case 1: exsql += 'AND sFixtureName LIKE ? '; break; // 물품명
	// 	case 2: exsql += 'AND sBuildNo LIKE ? '; break; // 건물명(번호로 검색)
	// 	case 3: exsql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
	// 	case 4: exsql += 'AND sFixtureModel LIKE ? '; break; // 모델명
	// 	case 5: exsql += 'AND sUserOrg LIKE ? '; break; // 소속부서
	// 	case 6: exsql += 'AND sUserNo=? '; qsname = sname; break; // 관리자(사원번호로 검색)
	// }
	switch (parseInt(ssearch)) {
		case 1: exsql += 'AND sBuild LIKE ? '; break; // 건물명
		case 2: exsql += 'AND sRoom LIKE ? '; break; // 호실
		case 3: exsql += 'AND sFixtureType LIKE ? '; break; // 구분
		case 4: exsql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 5: exsql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 6: exsql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 7: exsql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		case 8: exsql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: exsql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: exsql += 'AND dFixtureDate LIKE ? '; break; // 구입일
	}

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	//await get_user_item (user_idx);
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=?";
	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	tsql += "AND (sPublic='개인' or sPublic='')";
	sql += "AND (sPublic='개인' or sPublic='')";

	var res_total = '';
	if (ssearch > 0) {
		sql += exsql;
		tsql += exsql;
		res_total = await directQuery(tsql, [user_idx, qsname]);
	} else {
		res_total = await directQuery(tsql, [user_idx]);
	}
	var total = res_total[0].tot;

	/*
	sql += " LIMIT 10 OFFSET ?;";
	var pinfos = '';
	if (ssearch > 0) {
		pinfos = await directQuery (sql, [user_idx,qsname, Number (nstart * 10)]);
	} else {
		//console.log(user_idx);
		pinfos = await directQuery (sql, [user_idx,Number (nstart * 10)]);
	}
	*/
	sql += " LIMIT ? OFFSET ?;";
	var pinfos = '';
	if (ssearch > 0) {
		pinfos = await directQuery(sql, [user_idx, qsname, plimit, Number(nstart * plimit)]);
	} else {
		//console.log(user_idx);
		pinfos = await directQuery(sql, [user_idx, plimit, Number(nstart * plimit)]);
	}
	//var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, pinfos: changedPinfos, pindex: user_idx, ssearch: ssearch, sname: sname });

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
		//var user_idx = req.session.user.userid;
		var user_idx = req.session.user.selectAuithority;

		//var user_idx = 112563;

		if (req.query.nstart) {
			user_idx = req.query.idx;
		}

		//var sql = "SELECT * FROM tblUserItem WHERE sCode=?"
		var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
		sql += " AND (sPublic='개인' or sPublic='')";
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
			{ header: '취득일자', key: 'date', width: 10 },
			{ header: '취득금액', key: 'price', width: 10 },
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

			var fix_date = res_pers[i].dFixtureDate.substring(0, 10);
			var fix_price = res_pers[i].sFixturePrice == null ? 0 : res_pers[i].sFixturePrice.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

			rows['build'] = res_pers[i].sBuild;
			rows['floor'] = res_pers[i].sFloor;
			rows['roomnum'] = res_pers[i].sRoomNo;
			rows['room'] = res_pers[i].sRoom;
			rows['category'] = res_pers[i].sFixtureType;
			rows['itemnum'] = res_pers[i].sFixtureNo;
			rows['device'] = res_pers[i].sFixtureName;
			rows['model'] = res_pers[i].sFixtureModel + "(" + res_pers[i].sFixtureMaker + ")";
			rows['date'] = fix_date;
			rows['price'] = fix_price;
			rows['organi'] = res_pers[i].sUserOrg;
			rows['public'] = res_pers[i].sUser === '공동사용' ? '공동' : '개인';
			rows['master'] = res_pers[i].sName;
			rows['real'] = '';
			rows['user'] = res_pers[i].sUser === '공동사용' ? '공동' : res_pers[i].sUser;
			rows['status'] = res_pers[i].sFixtureStatus;
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
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;

	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	console.log("public 1");

	var res_total = await directQuery(tsql, [req.session.user['userid']]);
	var total = res_total[0].tot;

	console.log("total", total);
	console.log("public 2");

	tsql += 'AND `sPublic`="공동"';
	sql += 'AND `sPublic`="공동"';
	sql += 'LIMIT 10;';
	var rinfos = await directQuery(sql, [req.session.user['userid']]);

	console.log("public 3");
	//var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / 10;

	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	console.log("public 4");

	res.render("sub_public", { page_data: page_data, rinfos: changedRinfos, pindex: user_idx, ssearch: ssearch, sname: sname });
});

app.post('/public_page', async function (req, res) {

	var nstart = 0;
	var ssearch = 0;
	let qsname = '';
	var sname = '';
	var pmode = 0;
	var plimit = 10;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	if (req.body.ssearch) {
		ssearch = parseInt(req.body.ssearch);
	}
	if (req.body.sname) {
		sname = req.body.sname;
	}
	if (sname != '') {
		qsname = "%" + sname + "%";
	}

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var sql = '';
	var tsql = '';
	tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	tsql += 'AND `sPublic`="공동"';
	sql += 'AND `sPublic`="공동"';

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
	var res_total = '';
	if (ssearch > 0) {
		res_total = await directQuery(tsql, [req.session.user['userid'], qsname]);
	} else {
		res_total = await directQuery(tsql, [req.session.user['userid']]);
	}
	var total = res_total[0].tot;

	/*
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery (sql, [Number (nstart * 10)]);
	*/
	sql += 'LIMIT ? OFFSET ?;';
	// var rinfos = await directQuery(sql, [plimit, Number(nstart * plimit)]);

	var rinfos = '';
	if (ssearch > 0) {
		rinfos = await directQuery(sql, [req.session.user['userid'], qsname, plimit, Number(nstart * plimit)]);
	} else {
		//console.log(user_idx);
		rinfos = await directQuery(sql, [req.session.user['userid'], plimit, Number(nstart * plimit)]);
	}


	//var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, rinfos: changedRinfos, ssearch: ssearch, sname: sname });

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
	var plimit = 10;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	var sql = '';
	sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	sql += 'AND `sPublic`="공동"';
	var qsname = "%" + sname + "%";
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
	var res_total = await directQuery(sql, [req.session.user['userid'], qsname]);
	var total = res_total.length;

	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [req.session.user['userid'], qsname, Number(nstart * 10)]);
	//var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user['name'],
		'userid': req.session.user['userid'],
		'class': req.session.user['class'],
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, rinfos: changedRinfos, ssearch: ssearch, sname: sname });
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
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	//var user_idx = req.session.user.dptCode;
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

	var sql = "";
	var rinfos;
	var pinfos;

	var nstart = 0;
	var plimit = 1000;

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql);

		sql += 'LIMIT 1000 OFFSET 0;';
		pinfos = await directQuery(sql);
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql, [user_idx]);

		sql += 'LIMIT 1000 OFFSET 0;';
		pinfos = await directQuery(sql, [user_idx]);
	}


	//var sql = "SELECT * FROM tblFixture WHERE sDepartmentCode=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
	//var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	//var pinfos = await directQuery(sql, [user_idx]);
	//var total = pinfos.length;

	var start_page = nstart - (nstart % 10);
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	console.log('req.session.user.userid==>' + req.session.user.userid);

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	res.render('sub_personalCheck', { page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });
});

app.post('/personalCheck_page_new', async function (req, res) {
	console.log('app.get /personalCheck_page_new');

	var ssearch = 0;
	var sname = '';

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	var nstart = 0;
	if (req.body.start) {
		nstart = req.body.start;
	}

	var user_idx = req.session.user.selectAuithority;

	var plimit = 1000;

	var sql = "";
	var rinfos;
	var pinfos;

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql);

		sql += 'LIMIT 1000 OFFSET ?;';
		pinfos = await directQuery(sql, [Number(nstart * plimit)]);
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql, [user_idx]);

		sql += 'LIMIT 1000 OFFSET ?;';
		pinfos = await directQuery(sql, [user_idx, Number(nstart * plimit)]);
	}

	var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });

});

//app.post('/personalCheck_item2',session_exists, async function (req, res) {
app.post('/personalCheck_item2', async function (req, res) {

	console.log('app.post /personalCheck_item2 start!!');

	const isChecked = req.body.myCheckbox;
	const picChecked = req.body.picCheckbox;
	const startDate = req.body.startDate;
	const endDate = req.body.endDate;
	//const startMoney = req.body.startMoney;
	//const endMoney = req.body.endMoney;
	//const startMoney = req.body.startMoney.replace(",","");
	//const endMoney = req.body.endMoney.replace(",","");
	//const startMoney = Number(req.body.startMoney.replace(/,/g,""));
	//const endMoney = Number(req.body.endMoney.replace(/,/g,""));
	const startMoney = Number(req.body.startMoney);
	const endMoney = Number(req.body.endMoney);
	//const userId = req.body.userId;
	const userId = req.session.user.selectAuithority;
	const sendDPT = req.body.sendDPT;

	console.log('isChecked==>', isChecked);
	console.log('picChecked==>', picChecked);
	console.log('startDate==>', startDate);
	console.log('endDate: ', endDate);
	console.log('startMoney: ', startMoney);
	console.log('endMoney: ', endMoney);
	console.log('userId: ', userId);

	var isCheckedArr = [];
	/*
	for (i = 0; i < isChecked.length; i++) {
		console.log('for isChecked==> ', isChecked[i]);

		if (isChecked[i] == '교수학습개발원') {
			//isCheckedArr.push(['교수학습개발원','교수학습지원팀','원격교육센터']);
			isCheckedArr = isCheckedArr.concat(['교수학습개발원','교수학습지원팀','원격교육센터']);
		} 
		
		else if (isChecked[i] == '교양교육원') {
			isCheckedArr = isCheckedArr.concat(['교양교육원','교양교육원행정실']);
		}
		else if (isChecked[i] == '관리처') {
			isCheckedArr = isCheckedArr.concat(['관리처','관리팀','건축팀','안전관리팀','시설운영팀']);
		}
		else if (isChecked[i] == '교무처') {
			isCheckedArr = isCheckedArr.concat(['교무처','교무팀','학사팀','교육혁신팀']);
		}
		else if (isChecked[i] == '국제처') {
			isCheckedArr = isCheckedArr.concat(['국제처','국제교류팀','국제교육팀','글로벌서비스센터']);
		}
		else if (isChecked[i] == '대외협력처') {
			isCheckedArr = isCheckedArr.concat(['대외협력처','대외협력팀','커뮤니케이션팀','디자인혁신센터']);
		}
		else if (isChecked[i] == '디지털정보처') {
			isCheckedArr = isCheckedArr.concat(['디지털정보처','정보개발팀','정보인프라팀','데이터Hub팀','정보전략팀']);
		}
		else if (isChecked[i] == '인재발굴처') {
			isCheckedArr = isCheckedArr.concat(['인재발굴처','입학전형기획팀','입학전형관리팀']);
		}
		else if (isChecked[i] == '총무처') {
			isCheckedArr = isCheckedArr.concat(['총무처','경영지원팀','인력개발팀','재정팀','병무행정팀']);
		}
		else if (isChecked[i] == '학생처') {
			isCheckedArr = isCheckedArr.concat(['학생처','학생지원팀','Student Success Center','ONE-STOP서비스센터','학생상담센터','장애학생지원센터']);
		}
		else if (isChecked[i] == '부속교육기관') {
			isCheckedArr = isCheckedArr.concat(['부속교육기관','국제어학원','영재교육원','평생교육원','외국어센터','한국어센터','행정실','사회교육실','방과후학교지원센터','문화예술교육원']);
		}
		else if (isChecked[i] == '부속기관') {
			isCheckedArr = isCheckedArr.concat(['부속기관','도서관','체육위원회','출판문화원','혁신공유대학본부','농장','박물관','교육매체실','안암학사','대학혁신지원사업단','현장실습지원센터','인권·성평등센터','캠퍼스타운 조성 추진단','노르딕-베네룩스센터','중앙도서관','체육지원부','혁신공유대학운영팀','에너지신산업혁신공유대학사업단','기획관리부','학예부','대학기록실','교육매체지원부','행정팀','혁신지원사업운영팀','학술정보기획팀','학술정보개발팀','학술정보서비스팀','학술정보큐레이션팀']);
		}
		else if (isChecked[i] == '사회공헌원') {
			isCheckedArr = isCheckedArr.concat(['사회공헌원','사회공헌지원부']);
		}
		else if (isChecked[i] == '간호대학') {
			isCheckedArr = isCheckedArr.concat(['간호대학','간호대학행정실','간호학연구소']);
		}
		else if (isChecked[i] == '경영대학') {
			isCheckedArr = isCheckedArr.concat(['경영대학','경영대학행정실','기업경영연구원','기업지배구조연구소','스타트업연구원']);
		}
		else if (isChecked[i] == '공과대학') {
			isCheckedArr = isCheckedArr.concat(['공과대학'
			,'공과대학행정실'
			,'공동실험실'
			,'공학교육혁신센터'
			,'기업산학연협력센터'
			,'첨단소재부품개발연구소'
			,'정보통신기술연구소'
			,'반도체기술연구소'
			,'차세대기계설계기술연구소'
			,'융합화공시스템연구소'
			,'미래건설환경융합연구소'
			,'전력시스템기술연구소'
			,'나노기술연구소'
			,'녹색생산기술연구소'
			,'테라헤르츠연구소'
			,'스마트시티연구소'
			,'인공지능공학연구소'
			,'공학연구원'
			,'에너지기술공동연구소']);
		}
		else if (isChecked[i] == '국제대학') {
			isCheckedArr = isCheckedArr.concat(['국제대학','국제대학행정실']);
		}
		else if (isChecked[i] == '디자인조형학부') {
			isCheckedArr = isCheckedArr.concat(['디자인조형학부','디자인조형학부행정실','색채연구소']);
		}
		else if (isChecked[i] == '문과대학') {
			isCheckedArr = isCheckedArr.concat(['문과대학'
			,'문과대학행정실'
			,'영미문화연구소'
			,'러시아·CIS연구소'
			,'한국사회연구소'
			,'철학연구소'
			,'스페인· 라틴아메리카연구소'
			,'한국사연구소'
			,'글로벌일본연구원'
			,'한류융복합연구소'
			,'국제한국언어문화연구소'
			,'역사연구소'
			,'응용문화연구소'
			,'인문융합연구원'
			,'동아시아인문사회연구원'
			,'번역인문학연구원'
			,'한국언어문화학술확산연구소'
			,'중국학연구소'
			,'한자·한문연구소'
			,'독일어권문화연구소'
			,'언어정보연구소'
			,'번역과레토릭연구소']);
		}
		else if (isChecked[i] == '미디어학부') {
			isCheckedArr = isCheckedArr.concat(['미디어학부','미디어학부행정실','정보문화연구소']);
		}
		else if (isChecked[i] == '보건과학대학') {
			isCheckedArr = isCheckedArr.concat(['보건과학대학'
			,'보건과학대학행정실'
			,'보건의료과학기기센터'
			,'보건과학연구소'
			,'생물신소재연구소'
			,'글로벌헬스텍연구소']);
		}
		else if (isChecked[i] == '사범대학') {
			isCheckedArr = isCheckedArr.concat(['사범대학'
			,'사범대학행정실'
			,'교직팀'
			,'교육연수원'
			,'교육문제연구소'
			,'교과교육연구소'
			,'생활과학연구소'
			,'동아시아문화교류연구소'
			,'영어교육연구소'
			,'고등교육정책연구소'
			,'두뇌동기연구소'
			,'한국어문교육연구소'
			,'미래국토연구소'
			,'사회통합교육연구소'
			,'HRD정책연구소']);
		}
		else if (isChecked[i] == '생명과학대학') {
			isCheckedArr = isCheckedArr.concat(['생명과학대학'
			,'생명과학대학행정실'
			,'기기센터'
			,'식품과학종합실험실'
			,'생명자원연구소'
			,'식품생의학안전연구소'
			,'한국곤충연구소'
			,'생명공학연구소'
			,'건강기능식품연구센터'
			,'미생물제어소재 연구소'
			,'동물분자생체공학연구소'
			,'오정리질리언스연구원'
			,'한국생물방어연구소'
			,'오정육종연구소']);
		}
		else if (isChecked[i] == '스마트모빌리티학부') {
			isCheckedArr = isCheckedArr.concat(['스마트모빌리티학부','스마트모빌리티학부행정실']);
		}
		else if (isChecked[i] == '스마트보안학부') {
			isCheckedArr = isCheckedArr.concat(['스마트보안학부','스마트보안학부행정실']);
		}
		else if (isChecked[i] == '심리학부') {
			isCheckedArr = isCheckedArr.concat(['심리학부'
			,'심리학부행정실'
			,'행동과학연구소'
			,'KU마음건강연구소'
			,'지혜과학연구센터']);
		}
		else if (isChecked[i] == '이과대학') {
			isCheckedArr = isCheckedArr.concat(['이과대학'
			,'이과대학행정실'
			,'공동기기실'
			,'기초과학연구원'
			,'전략광물자원연구소'
			,'기초과학연구소']
			);
		}
		else if (isChecked[i] == '자유전공학부') {
			isCheckedArr = isCheckedArr.concat(['자유전공학부','자유전공학부행정실']);
		}
		else if (isChecked[i] == '정경대학') {
			isCheckedArr = isCheckedArr.concat(['정경대학'
			,'정경대학행정실'
			,'경제연구소'
			,'통계연구소'
			,'정부학연구소'
			,'평화와민주주의연구소'
			,'정치연구소'
			,'비교거버넌스연구소']);
		}
		else if (isChecked[i] == '정보대학') {
			isCheckedArr = isCheckedArr.concat(['정보대학'
			,'정보대학행정실'
			,'공동실험실'
			,'정보창의교육연구소'
			,'융합소프트웨어연구소'
			,'차세대가상증강현실연구소'
			,'소프트웨어보안연구소'
			,'블록체인연구소'
			,'컴퓨터·정보통신연구소'
			,'뇌공학연구소'
			,'Human-Inspired AI연구소'
			,'인공지능연구원']);
		}		
	}
		*/
	console.log('isCheckedArr==> ', isCheckedArr);

	var ssearch = 0;
	var sname = '';

	/*
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}*/
	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}

	//console.log(req.session.user.userid);
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var permission = req.session.user.permission_personalchk;
	var dpt_code = req.session.user.dptCode;
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
	//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now() WHERE sFixtureNo in (select distinct nFixtureIdx  from tblFixtureImg) and sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?)";
	if (picChecked == 'false') {

		if (user_idx == "98765432") {
			if (startMoney == 0 && endMoney == 0 && startDate == '' && endDate == '') {
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and sOrg in ( ? );" ;
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				//var rinfos0 = await directQuery(sql0, [userId, isCheckedArr]);
				var rinfos0 = await directQuery(sql0, [userId, sendDPT]);
				//sendDPT
			}
			else if (startMoney == 0 && endMoney == 0) {
				if (startDate == '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sOrg in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					//var rinfos0 = await directQuery(sql0, [userId, endDate, isCheckedArr]);
					var rinfos0 = await directQuery(sql0, [userId, endDate, sendDPT]);
				}
				else if (startDate != '' && endDate == '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sOrg in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					//var rinfos0 = await directQuery(sql0, [userId, startDate, isCheckedArr]);
					var rinfos0 = await directQuery(sql0, [userId, startDate, sendDPT]);
				}
				else if (startDate != '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sOrg in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					//var rinfos0 = await directQuery(sql0, [userId, startDate, endDate, isCheckedArr]);
					var rinfos0 = await directQuery(sql0, [userId, startDate, endDate, sendDPT]);
				}
			}
			else if (startDate == '' && endDate == '') {
				if (startMoney == 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice < ?) and sOrg in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					//var rinfos0 = await directQuery(sql0, [userId, endMoney, isCheckedArr]);
					var rinfos0 = await directQuery(sql0, [userId, endMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney == 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice > ?) and sOrg in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					//var rinfos0 = await directQuery(sql0, [userId, startMoney, isCheckedArr]);
					var rinfos0 = await directQuery(sql0, [userId, startMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice between ? and ?) and sOrg in ( ? );" ;
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					//var rinfos0 = await directQuery(sql0, [userId, startMoney, endMoney, isCheckedArr]);
					var rinfos0 = await directQuery(sql0, [userId, startMoney, endMoney, sendDPT]);
				}
			}
			else {
				if (startDate == '') {
					startDate = '1950-01-01';
				}

				if (endDate == '') {
					var today = new Date();
					endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
				}

				if (endMoney == 0) {
					endMoney = 1000000000000000000000;
				}

				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sOrg in ( ? );" ;
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				//var rinfos0 = await directQuery(sql0, [userId, startDate, endDate, startMoney, endMoney, isCheckedArr]);
				var rinfos0 = await directQuery(sql0, [userId, startDate, endDate, startMoney, endMoney, sendDPT]);
			}
		}
		else {
			if (startMoney == 0 && endMoney == 0 && startDate == '' && endDate == '') {
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  sOrg in ( ? );" ;
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				var rinfos0 = await directQuery(sql0, [userId, user_idx, sendDPT]);
			}
			else if (startMoney == 0 && endMoney == 0) {
				if (startDate == '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, endDate, sendDPT]);
				}
				else if (startDate != '' && endDate == '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, endDate, sendDPT]);
				}
				else if (startDate != '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, sendDPT]);
				}
			}
			else if (startDate == '' && endDate == '') {
				if (startMoney == 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, endMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney == 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, startMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, startMoney, endMoney, sendDPT]);
				}
			}
			else {
				if (startDate == '') {
					startDate = '1950-01-01';
				}

				if (endDate == '') {
					var today = new Date();
					endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
				}

				if (endMoney == 0) {
					endMoney = 1000000000000000000000;
				}

				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='F', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney, sendDPT]);
			}
		}
	} else if (picChecked == 'true') {
		if (user_idx == "98765432") {
			if (startMoney == 0 && endMoney == 0 && startDate == '' && endDate == '') {
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sFixtureStatus='사용' and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sFixtureStatus='사용' and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				var rinfos0 = await directQuery(sql0, [userId, sendDPT]);
			}
			else if (startMoney == 0 && endMoney == 0) {
				if (startDate == '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, endDate, sendDPT]);
				}
				else if (startDate != '' && endDate == '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, startDate, sendDPT]);
				}
				else if (startDate != '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, startDate, endDate, sendDPT]);
				}
			}
			else if (startDate == '' && endDate == '') {
				if (startMoney == 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, endMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney == 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, startMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE  sFixtureStatus='사용'  and  (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, startMoney, endMoney, sendDPT]);
				}
			}
			else {
				if (startDate == '') {
					startDate = '1950-01-01';
				}

				if (endDate == '') {
					var today = new Date();
					endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
				}

				if (endMoney == 0) {
					endMoney = 1000000000000000000000;
				}

				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				var rinfos0 = await directQuery(sql0, [userId, startDate, endDate, startMoney, endMoney, sendDPT]);
			}
		}
		else {
			if (startMoney == 0 && endMoney == 0 && startDate == '' && endDate == '') {
				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용' and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용' and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				var rinfos0 = await directQuery(sql0, [userId, user_idx, sendDPT]);
			}
			else if (startMoney == 0 && endMoney == 0) {
				if (startDate == '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, endDate, sendDPT]);
				}
				else if (startDate != '' && endDate == '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, endDate, sendDPT]);
				}
				else if (startDate != '' && endDate != '') {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, sendDPT]);
				}
			}
			else if (startDate == '' && endDate == '') {
				if (startMoney == 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice < ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice < ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, endMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney == 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice > ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice > ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, startMoney, sendDPT]);
				}
				else if (startMoney != 0 && endMoney != 0) {
					//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
					var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
					//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
					var rinfos0 = await directQuery(sql0, [userId, user_idx, startMoney, endMoney, sendDPT]);
				}
			}
			else {
				if (startDate == '') {
					startDate = '1950-01-01';
				}

				if (endDate == '') {
					var today = new Date();
					endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
				}

				if (endMoney == 0) {
					endMoney = 1000000000000000000000;
				}

				//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? );" ;
				var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now(), picCheck ='T', dMemo ='' WHERE sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?) and sDepartmentCode in ( ? ) and ((sFixtureNo LIKE '12%' and sFixturePrice > 100000) or (sFixtureNo LIKE '11%' and sFixturePrice > 300000));";
				//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);
				var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney, sendDPT]);
			}
		}
	}
	console.log('rinfos0 sql0==>', sql0);
	console.log('rinfos0==>', rinfos0);

	//var sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' ";
	//var sql = "select * from  tblFixture  WHERE sFixtureNo in (select distinct nFixtureIdx  from tblFixtureImg) and sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?);";
	var sql = "";
	var rinfos = [];

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql);
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sDepartmentCode=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql, [dpt_code]);
	}

	//var rinfos = await directQuery(sql, [user_idx]);
	//var total = rinfos.length;
	//var pinfos = await directQuery(sql, [user_idx]);
	//var rinfos = await directQuery(sql, [user_idx, startDate, endDate, startMoney, endMoney]);
	//var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	console.log("rinfos", rinfos);
	//var pinfos = await directQuery(sql, [user_idx, startDate, endDate, startMoney, endMoney]);
	var pinfos = await directQuery(sql, [user_idx]);
	//var total = pinfos.length;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total
	};

	console.log('req.session.user.userid==>' + req.session.user.userid);

	//var user_org = rinfos[0].sOrg;
	var user_org = "";

	if (user_idx == "98765432") {
		user_org = "총무처";
	}
	else {
		user_org = rinfos[0].sOrg;
	}

	sql = 'SELECT nIndex ';
	sql += 'FROM tblOrganization ';
	sql += 'WHERE sName=? ';

	var res_org = await directQuery(sql, [user_org]);

	console.log("res_org", res_org);

	sql = 'SELECT * ';
	sql += 'FROM tblUser ';
	//sql += 'WHERE nOrgIdx=? ';
	sql += 'WHERE sDepartmentCode in ( ? ) ';
	//sendDPT

	var res_user = await directQuery(sql, [sendDPT]);

	console.log("res_user.length", res_user.length);

	//for(var idx = 0; idx < 1; idx++)
	for (var idx = 0; idx < res_user.length; idx++) {
		var to_user = res_user[idx].sEMail;
		var startMoney_text = startMoney.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "원";
		var endMoney_text = endMoney.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "원";

		var html_data = req.session.user.name + "님께서 물품 실사를 요청하였습니다.<br>";
		html_data += "취득 일자 : " + startDate.toLocaleString() + " ~ " + endDate.toLocaleString() + "<br>";
		html_data += "취득 금액 : " + startMoney_text + " ~ " + endMoney_text + "<br>";

		let mailOptions = {
			from: 'furniture@korea.ac.kr', // 보내는 메일의 주소
			to: to_user, // 수신할 이메일
			//to: "jaebeen2@kounosoft.com", // 수신할 이메일
			subject: "고려대학교 자산관리 시스템 비품 물품 실사 요청", // 메일 제목
			html: html_data, // 메일 내용
		};

		transporter.sendMail(mailOptions);
	}

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	//res.render('sub_personalCheck2', { page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname,permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk});
	//res.render('sub_personalCheck', { page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname,permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk});
	//res.status(200).json({ message: `교수학습개발원체크: ${isChecked},${picChecked},${startDate},${endDate},${startMoney},${endMoney}` });
	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });
	//res.render('sub_personalCheck_item', {page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname,permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk});
});

app.post('/personalCheck_item3', async function (req, res) {

	console.log('app.post /personalCheck_item3 start!!');

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

	var plimit = 1000;

	console.log(req.session.user);
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var permission = req.session.user.permission_personalchk;
	//var user_idx = 112563;
	//98765432

	// 개인별 정보 가져오기
	/*
	var sql = 'SELECT a.sName roomname,b.nIndex dindex,b.sItemNumber dnum,c.sName buildname,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	sql += 'b.sStatus status,d.sOrgName org_name,d.sMasterName master_name,d.sRealName real_name,d.sUserName user_name,d.nPublic public ';
	sql += 'FROM tblBuild a,tblDevice b,tblBuild c,tblRelation d,tblUser e ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND a.nRootIndex=c.nIndex AND b.nIndex=d.nDeviceIdx ';
	sql += 'AND d.nMasterIdx=e.nIndex AND e.sNumber=? ';
	*/
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";

	var sql = "";
	var rinfos = [];
	var total = 0;
	var pinfos = [];

	//var sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
	//var rinfos = await directQuery(sql, [user_idx]);
	//var total = rinfos.length;
	//var pinfos = await directQuery(sql, [user_idx]);

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql);
		total = rinfos.length;

		sql += ' LIMIT 1000 OFFSET ?;';
		pinfos = await directQuery(sql, [Number(nstart * plimit)]);
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sDepartmentCode=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql, [req.session.user.dptCode]);
		total = rinfos.length;

		sql += ' LIMIT 1000 OFFSET ?;';
		pinfos = await directQuery(sql, [req.session.user.dptCode, Number(nstart * plimit)]);
	}

	var start_page = nstart - (nstart % plimit);
	var end_page = total / plimit;

	//var total = pinfos.length;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total,
		'start': start_page,
		'end': end_page
	};

	console.log('req.session.user.userid==>' + req.session.user.userid);

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });
});

app.post('/dDiliCheck_page', async function (req, res) {
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	var ssearch = 0;
	var sname = '';

	var nstart = 0;
	var plimit = 1000;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	if (req.body.ssearch) {
		ssearch = req.body.ssearch;
	}

	if (req.body.sname) {
		sname = req.body.sname;
	}

	var user_idx = req.session.user.selectAuithority;

	var sql = "";
	var rinfos = [];
	var total = 0;
	var pinfos = [];

	if (ssearch == 0) {
		if (user_idx == "98765432") {
			sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
			rinfos = await directQuery(sql);
			total = rinfos.length;

			sql += ' LIMIT 1000 OFFSET ?;';
			pinfos = await directQuery(sql, [Number(nstart * plimit)]);
		}
		else {
			sql = "SELECT * FROM tblFixture WHERE sDepartmentCode=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
			rinfos = await directQuery(sql, [req.session.user.dptCode]);
			total = rinfos.length;

			sql += ' LIMIT 1000 OFFSET ?;';
			pinfos = await directQuery(sql, [req.session.user.dptCode, Number(nstart * plimit)]);
		}
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' ";

		if (parseInt(ssearch) != 12) {
			sql += 'AND dDiligence in (1,2) ';
		}

		if (user_idx != "98765432") {
			sql += 'AND sDepartmentCode=? ';
		}

		var qsname = "%" + sname + "%";

		switch (parseInt(ssearch)) {
			case 1: sql += 'AND sBuild LIKE ? '; break; // 건물명
			case 2: sql += 'AND sRoom LIKE ? '; break; // 호실
			case 3: sql += 'AND sFixtureType LIKE ? '; break; // 구분
			case 4: sql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
			case 5: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
			case 6: sql += 'AND sFixtureModel LIKE ? '; break; // 모델명
			case 7: sql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
			//case 8: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
			case 9: sql += 'AND sUser LIKE ? '; break; // 사용자
			case 10: sql += 'AND dFixtureDate LIKE ? '; break; // 구입일
			case 11: sql += 'AND sOrg LIKE ? '; break; // 사용자
		}

		if (parseInt(ssearch) == 8) {
			var dpt_sql = "SELECT * FROM tblDepartment WHERE sNameKor=?";
			var dpt_info = await directQuery(dpt_sql, [sname]);

			qsname = dpt_info[0].sDepartmentCode;
			sql += 'AND sDepartmentCode = ? ';
		}
		else if (parseInt(ssearch) == 12) {
			if (sname.includes('미요청')) {
				qsname = '0';
			} else if (sname.includes('요청')) {
				qsname = '1';
			} else if (sname.includes('완료')) {
				qsname = '2';
			}
			sql += 'AND dDiligence = ? ';
		}

		if (user_idx == "98765432") {
			rinfos = await directQuery(sql, [qsname]);

			sql += 'LIMIT 1000 OFFSET ?;';
			pinfos = await directQuery(sql, [qsname, Number(nstart * plimit)]);
		}
		else {
			rinfos = await directQuery(sql, [user_idx, qsname]);

			sql += 'LIMIT 1000 OFFSET ?;';
			pinfos = await directQuery(sql, [user_idx, qsname, Number(nstart * plimit)]);
		}
	}

	var start_page = nstart - (nstart % plimit);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;

	console.log("start_page", start_page);

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total,
		'start': start_page,
		'end': end_page
	};

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });
});

app.post('/personalCheck_item4', async function (req, res) {

	console.log('app.post /personalCheck_item4 start!!');

	var data = req.body.data;
	var setIdx2 = data.setIdx;
	var userId2 = data.userid;
	var memo2 = data.memo;
	console.log('data==>' + data);
	console.log('setIdx2==>' + setIdx2);
	console.log('userId2==>' + userId2);
	console.log('memo2==>' + memo2);
	//const userId = req.body.userId;
	//var setIdx2 = data.setIdx;
	//console.log('setIdx2==>'+setIdx2);

	//console.log('userId: ',userId);


	var ssearch = 0;
	var sname = '';

	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}

	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var permission = req.session.user.permission_personalchk;
	var dpt_code = req.session.user.dptCode;
	//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now() WHERE sFixtureNo in (select distinct nFixtureIdx  from tblFixtureImg) and sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?)";
	//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);


	if (user_idx == "98765432") {
		var sql0 = "UPDATE tblFixture SET dMemo = ?, dDiligence = 1, dUserNo = ?, dDiligenceDate = now() WHERE sFixtureNo = ? and sFixtureStatus='사용'";
		var rinfos0 = await directQuery(sql0, [memo2, userId2, setIdx2]);
		console.log('rinfos0==>', rinfos0);
	}
	else {
		var sql0 = "UPDATE tblFixture SET dMemo = ?, dDiligence = 1, dUserNo = ?, dDiligenceDate = now() WHERE sFixtureNo = ? and sUserNo=?  AND sFixtureStatus='사용'";
		var rinfos0 = await directQuery(sql0, [memo2, userId2, setIdx2, user_idx]);
		console.log('rinfos0==>', rinfos0);
	}

	var sql = "";
	var rinfos = [];
	var total = 0;
	var pinfos = [];

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql);
		total = rinfos.length;
		pinfos = await directQuery(sql);
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql, [user_idx]);
		total = rinfos.length;
		pinfos = await directQuery(sql, [user_idx]);
	}
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total
	};

	console.log('req.session.user.userid==>' + req.session.user.userid);

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });
});

app.post('/personalCheck_item5', async function (req, res) {

	console.log('app.post /personalCheck_item5 start!!');

	var data = req.body.data;
	var setIdx2 = data.setIdx;
	var userId2 = data.userid;
	var memo2 = data.memo;
	console.log('data==>' + data);
	console.log('setIdx2==>' + setIdx2);
	console.log('userId2==>' + userId2);
	console.log('memo2==>' + memo2);
	//const userId = req.body.userId;
	//var setIdx2 = data.setIdx;
	//console.log('setIdx2==>'+setIdx2);

	//console.log('userId: ',userId);


	var ssearch = 0;
	var sname = '';

	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}

	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var permission = req.session.user.permission_personalchk;
	var dpt_code = req.session.user.dptCode;
	//var sql0 = "UPDATE tblFixture SET dDiligence = 1, dUserNo = ?, dDiligenceDate = now() WHERE sFixtureNo in (select distinct nFixtureIdx  from tblFixtureImg) and sUserNo=?  AND sFixtureStatus='사용'  and  (SUBSTRING(dFixtureDate, 1, 10) between ? and ?) and (sFixturePrice between ? and ?)";
	//var rinfos0 = await directQuery(sql0, [userId, user_idx, startDate, endDate, startMoney, endMoney]);

	if (user_idx == "98765432") {
		var sql0 = "UPDATE tblFixture SET dMemo = ?  WHERE sFixtureNo = ? AND sFixtureStatus='사용'";
		var rinfos0 = await directQuery(sql0, [memo2, setIdx2]);
		console.log('rinfos0==>', rinfos0);
	}
	else {
		//var sql0 = "UPDATE tblFixture SET dMemo = ?  WHERE sFixtureNo = ? and sUserNo=?  AND sFixtureStatus='사용'";
		//var rinfos0 = await directQuery(sql0, [memo2,  setIdx2, user_idx]);
		var sql0 = "UPDATE tblFixture SET dMemo = ?  WHERE sFixtureNo = ? and sDepartmentCode=?  AND sFixtureStatus='사용'";
		var rinfos0 = await directQuery(sql0, [memo2, setIdx2, dpt_code]);
		console.log('rinfos0==>', rinfos0);
	}

	var sql = "";
	var rinfos = [];
	var total = 0;
	var pinfos = [];

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql);
		total = rinfos.length;
		pinfos = await directQuery(sql);
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2)";
		rinfos = await directQuery(sql, [user_idx]);
		total = rinfos.length;
		pinfos = await directQuery(sql, [user_idx]);
	}


	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'total': total
	};

	console.log('req.session.user.userid==>' + req.session.user.userid);

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname, permission: req.session.user.permission, userid: req.session.user.userid, stdtype: req.session.user.stdtype, permission_personalchk: req.session.user.permission_personalchk });
});
app.post('/personalCheck_page', async function (req, res) {

	var nstart = 0;
	var ssearch = 0;
	var sname = '';
	var plimit = 1000;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}

	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;

	console.log("user_idx", user_idx);
	console.log("nstart", nstart);

	var ssearch = req.body.ssearch;
	var sname = req.body.sname;

	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	var qsname = "%" + sname + "%";
	switch (parseInt(ssearch)) {
		case 1: sql += 'AND sBuild LIKE ? '; break; // 건물명
		case 2: sql += 'AND sRoom LIKE ? '; break; // 호실
		case 3: sql += 'AND sFixtureType LIKE ? '; break; // 구분
		case 4: sql += 'AND sFixtureNo LIKE ? '; break; // 물품번호
		case 5: sql += 'AND sFixtureName LIKE ? '; break; // 물품명
		case 6: sql += 'AND sFixtureModel LIKE ? '; break; // 모델명
		case 7: sql += 'AND sFixtureMaker LIKE ? '; break; // 제조사
		//case 8: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: sql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: sql += 'AND dFixtureDate LIKE ? '; break; // 구입일
	}

	if (parseInt(ssearch) == 8) {
		var dpt_sql = "SELECT * FROM tblDepartment WHERE sNameKor=?";
		var dpt_info = await directQuery(dpt_sql, [sname]);

		qsname = dpt_info[0].sDepartmentCode;
		sql += 'AND sDepartmentCode = ? ';
	}

	var rinfos = await directQuery(sql, [user_idx]);
	var total = rinfos.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var pinfos = await directQuery(sql, [user_idx, Number(nstart * 10)]);
	//var total = pinfos.length;



	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname });

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
	var plimit = 1000;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var permission = req.session.user.permission_personalchk;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	//if(user_idx == "98765432")

	//var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";

	var sql = "";

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2) ";
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sUserNo=?  AND sFixtureStatus='사용' AND dDiligence in (1,2) ";
	}

	var qsname = "%" + sname + "%";
	var qsname_8 = [];

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
		//case 8: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: sql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: sql += 'AND dFixtureDate LIKE ? '; break; // 구입일
	}

	if (parseInt(ssearch) == 8) {
		var dpt_sql = "SELECT sDepartmentCode FROM tblDepartment WHERE sNameKor LIKE ?";
		var dpt_info = await directQuery(dpt_sql, ['%' + sname + '%']);

		//qsname = dpt_info[0].sDepartmentCode;

		qsname = '';

		for (var idx = 0; idx < dpt_info.length; idx++) {
			qsname_8.push(dpt_info[idx].sDepartmentCode);
		}


		sql += 'AND sDepartmentCode in (?) ';
	}

	//var pinfos = await directQuery (sql, [user_idx, qsname]);
	//var total = pinfos.length;
	var pinfos = [];

	if (user_idx == "98765432") {
		if (parseInt(ssearch) == 8) {
			pinfos = await directQuery(sql, [qsname_8]);
		}
		else {
			pinfos = await directQuery(sql, [qsname]);
		}
	}
	else {
		if (parseInt(ssearch) == 8) {
			pinfos = await directQuery(sql, [user_idx, qsname_8]);
		}
		else {
			pinfos = await directQuery(sql, [user_idx, qsname]);
		}
	}

	var total = pinfos.length;

	var start_page = nstart - (nstart % 10);
	var end_page = total / plimit;

	res.send({ pinfos: pinfos, ssearch: ssearch, sname: sname });
});

app.post('/personalCheck_search3', async function (req, res) {
	console.log('app.post /personalCheck_search3');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;
	var nstart = 0;
	var plimit = 1000;

	if (req.body.nstart) {
		nstart = req.body.nstart;
	}
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
	var permission = req.session.user.permission_personalchk;

	var sql = "";
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	//var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' AND dDiligence in (1,2)";
	//var sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' AND dDiligence in (1,2)";

	if (user_idx == "98765432") {
		sql = "SELECT * FROM tblFixture WHERE sFixtureStatus='사용' ";
	}
	else {
		sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND sFixtureStatus='사용' ";
	}

	if (parseInt(ssearch) != 12) {
		sql += 'AND dDiligence in (1,2) ';
	}

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
		//case 8: sql += 'AND sUserOrg LIKE ? '; break; // 소속부서
		case 9: sql += 'AND sUser LIKE ? '; break; // 사용자
		case 10: sql += 'AND dFixtureDate LIKE ? '; break; // 구입일
		case 11: sql += 'AND sOrg LIKE ? '; break; // 사용자
	}

	if (parseInt(ssearch) == 8) {
		var dpt_sql = "SELECT * FROM tblDepartment WHERE sNameKor=?";
		var dpt_info = await directQuery(dpt_sql, [sname]);

		qsname = dpt_info[0].sDepartmentCode;
		sql += 'AND sDepartmentCode = ? ';
	}
	else if (parseInt(ssearch) == 12) {
		if (sname.includes('미요청')) {
			qsname = '0';
		} else if (sname.includes('요청')) {
			qsname = '1';
		} else if (sname.includes('완료')) {
			qsname = '2';
		}
		sql += 'AND dDiligence = ? ';
	}

	//var pinfos = await directQuery (sql, [user_idx, qsname]);
	//var total = pinfos.length;
	var pinfos = [];
	var rinfos = [];

	if (user_idx == "98765432") {
		//pinfos = await directQuery(sql, [qsname]);
		rinfos = await directQuery(sql, [qsname]);

		sql += 'LIMIT 1000 OFFSET 0;';
		pinfos = await directQuery(sql, [qsname, Number(nstart * plimit)]);
	}
	else {
		//pinfos = await directQuery(sql, [user_idx, qsname]);
		rinfos = await directQuery(sql, [user_idx, qsname]);

		sql += 'LIMIT 1000 OFFSET 0;';
		pinfos = await directQuery(sql, [user_idx, qsname, Number(nstart * plimit)]);
	}

	var total = rinfos.length;

	var start_page = nstart - (nstart % 10);
	var end_page = total / plimit;

	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	const changedPinfos = pinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	});

	res.send({ page_data: page_data, pinfos: changedPinfos, ssearch: ssearch, sname: sname });
});

function base64ToArrayBuffer(base64) {
	var binaryString = atob(base64);
	var bytes = new Uint8Array(binaryString.length);
	for (var i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

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

		//removePath
		const p = __dirname + '/CheckImage';
		const files = fs.readdirSync(p);

		if (files.length > 0) {
			for (var idx = 0; idx < files.length; idx++) {
				var file_path = p + '/' + files[idx];
				fs.unlinkSync(file_path);
			}
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
			{ header: '관리부서', key: 'organi', width: 20 },
			{ header: '사용자', key: 'master', width: 20 },
			{ header: '사용부서', key: 'real_organi', width: 20 },
			{ header: '물품번호', key: 'item_num', width: 20 },
			{ header: '물품구분', key: 'category', width: 20 },
			{ header: '물품명', key: 'item_name', width: 20 },
			{ header: '모델명(제조사)', key: 'maker', width: 45 },
			{ header: '규격', key: 'class', width: 20 },
			{ header: '취득일자', key: 'ddate', width: 20 },
			{ header: '취득금액', key: 'bill', width: 20 },
			{ header: '현재캠퍼스', key: 'campus', width: 20 },
			{ header: '현재건물', key: 'build', width: 20 },
			{ header: '현재층', key: 'floor', width: 20 },
			{ header: '현재호실', key: 'roomnum', width: 20 },
			{ header: '전자결재문서번호', key: 'epdn', width: 20 },
			{ header: '비고', key: 'memo', width: 20 },
			{ header: '실사 이미지', key: 'memo', width: 100 }
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

				if (res_pers[0].dDiligence == '0') {
					rows['ru_done_day'] = '';
					rows['ru_user'] = '';
				}
				else if (res_pers[0].dDiligence == '1') {
					rows['ru_done_day'] = '';
					//rows['ru_user'] = res_pers[0].dUserNo;
					//rows['ru_user'] = res_pers[0].dUserNo;
					rows['ru_user'] = '';
				}
				else if (res_pers[0].dDiligence == '2') {
					//rows['ru_done_day'] = res_pers[0].dDiligenceDate;
					rows['ru_done_day'] = '';
					rows['ru_user'] = res_pers[0].dUserNo;
				}

				var state_chk = res_pers[0].dDiligence;

				if (state_chk == '2') {
					rows['ru_status'] = 'Y';
					rows['ru_done'] = '완료';
				}
				else if (state_chk == '1') {
					rows['ru_status'] = 'N';
					rows['ru_done'] = '미완료';
				}
				else {
					rows['ru_status'] = 'N';
					rows['ru_done'] = '미완료';
				}
				rows['organi'] = res_pers[0].sOrg;
				rows['master'] = res_pers[0].sUser;
				rows['real_organi'] = res_pers[0].sUserOrg;
				rows['item_num'] = res_pers[0].sFixtureNo;

				var item_path = res_pers[0].sFixtureNo.substr(0, 2);

				//rows['category'] = res_pers[0].sFixtureType;

				if (item_path == '11') {
					rows['category'] = '기계기구';
				}
				else if (item_path == '12') {
					rows['category'] = '집기비품';
				}
				else {
					rows['category'] = res_pers[0].sFixtureType;
				}

				rows['item_name'] = res_pers[0].sFixtureName;
				rows['maker'] = res_pers[0].sFixtureModel + "(" + res_pers[0].sFixtureMaker + ")";
				//rows['class'] = "";
				rows['class'] = res_pers[0].sFixtureStandard;
				//rows['ddate'] = res_pers[0].dFixtureDate.substring(0, 10);

				let date_str = res_pers[0].dFixtureDate.substring(0, 10).replace(/-/g, '');
				rows['ddate'] = date_str;

				rows['bill'] = res_pers[0].sFixturePrice;
				rows['campus'] = '서울캠퍼스';
				rows['build'] = res_pers[0].sBuild;
				var floor = res_pers[0].sFloor;

				if (floor.includes("FL")) {
					var floor_int = parseInt(floor.substr(2));
					rows['floor'] = "지상" + floor_int + "층";
				}
				else if (floor.includes("BF")) {
					var floor_int = parseInt(floor.substr(2));
					rows['floor'] = "지하" + floor_int + "층";
				}
				else {
					rows['floor'] = "데이터 없음";
				}

				rows['roomnum'] = res_pers[0].sRoom + '(' + res_pers[0].sRoomNo + ')';
				rows['epdn'] = res_pers[0].sEPDN;

				rows['memo'] = res_pers[0].dMemo;

				var img_sql = "SELECT * FROM tblFixtureImg WHERE nFixtureIdx=? ";
				var res_image = await directQuery(img_sql, [res_pers[0].sFixtureNo]);

				if (res_image.length > 0) {
					var img_ext = "";

					var iValue_png = res_image[0].sImgBin.indexOf("png");

					var iValue_jpeg = res_image[0].sImgBin.indexOf("jpeg");
					var img_bin = "";

					if (iValue_png != -1) {
						img_ext = 'png';
						img_bin = res_image[0].sImgBin.replace("data:image\/png;base64,", "");
					}

					if (iValue_jpeg != -1) {
						img_ext = 'jpeg';
						img_bin = res_image[0].sImgBin.replace("data:image\/jpeg;base64,", "");
					}

					var img_path = __dirname + '/DiligenceImage/' + res_image[0].sImgPath;

					fs.writeFileSync(img_path, img_bin, "base64");
					const dimension = sizeOf(img_path);

					const myBase64Image = res_image[0].sImgBin;
					const imageId = workbook.addImage({
						base64: myBase64Image,
						extension: img_ext
					});

					sheetOne.addImage(imageId, {
						tl: { col: 20, row: i + 1 },
						//ext: { width: dimension.width, height: dimension.height }
						ext: { width: 100, height: 20 }
					});
				}

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

app.post('/image_check', async function (req, res) {
	console.log('post /image_check');

	//console.log(req.body.chk_btn[0]);

	var list_chk = req.body.chk_btn[0].split(',');

	try {
		if (list_chk) {

			//removePath
			const p = __dirname + '/DiligenceImage';
			const files = fs.readdirSync(p);

			if (files.length > 0) {
				for (var idx = 0; idx < files.length; idx++) {
					var file_path = p + '/' + files[idx];
					fs.unlinkSync(file_path);
				}
			}

			var sql = "SELECT * FROM tblFixtureImg WHERE nFixtureIdx=? ";

			//const jarFilePath = __dirname + '/java/DecodeEncryptor168.jar';

			for (var i = 0; i < list_chk.length; i++) {
				var res_image = await directQuery(sql, [list_chk[i]]);

				if (res_image.length > 0) {
					/*
					for (var idx = 0; idx < res_image.length; idx++) {
						//var img_path = __dirname + '/DiligenceImage/'+ res_image[idx].sImgPath;
						var img_path = "";

						var img_bin = "";

						var iValue_png = res_image[idx].sImgBin.indexOf("png");

						var iValue_jpeg = res_image[idx].sImgBin.indexOf("jpeg");

						if(iValue_png != -1)
						{
							img_bin = res_image[idx].sImgBin.replace("data:image\/png;base64,", "");
							img_path = __dirname + '/DiligenceImage/'+ list_chk[i] + '_' + (idx + 1) + ".png";
						}

						if(iValue_jpeg != -1)
						{
							img_bin = res_image[idx].sImgBin.replace("data:image\/jpeg;base64,", "");
							img_path = __dirname + '/DiligenceImage/'+ list_chk[i] + '_' + (idx + 1) + ".jpg";
						}

						fs.writeFileSync(img_path, img_bin, "base64");
					}
					*/

					var img_path = "";

					var img_bin = "";

					var iValue_png = res_image[0].sImgBin.indexOf("png");

					var iValue_jpeg = res_image[0].sImgBin.indexOf("jpeg");

					if (iValue_png != -1) {
						img_bin = res_image[0].sImgBin.replace("data:image\/png;base64,", "");
						img_path = __dirname + '/DiligenceImage/' + list_chk[i] + ".png";
					}

					if (iValue_jpeg != -1) {
						img_bin = res_image[0].sImgBin.replace("data:image\/jpeg;base64,", "");
						img_path = __dirname + '/DiligenceImage/' + list_chk[i] + ".jpg";
					}

					fs.writeFileSync(img_path, img_bin, "base64");
				}
			}

			const curr_date = new Date();

			var month = curr_date.getMonth() + 1;
			var day = curr_date.getDate();
			var hour = curr_date.getHours();
			var min = curr_date.getMinutes();
			var sec = curr_date.getSeconds();

			let folderPath = __dirname + '/DiligenceImage'; // 압축할 폴더 경로
			//let zipName = 'folder_image.zip'; // 압축된 zip 이름
			let zipName = '연간물품실사_이미지_' + curr_date.getFullYear() + month + day + hour + min + sec + '.zip';
			let zipPath = __dirname + '/' + zipName; // zip을 저장할 폴더

			const output = fs.createWriteStream(zipPath);
			const archive = archiver("zip", {
				zlib: { level: 9 }, // 압축 레벨 설정 (최대 압축)
			});

			output.on("close", function () {
				console.log(archive.pointer() + " total bytes...");
				res.sendFile(zipPath); // 압축된 파일 전송

				setTimeout(() => {
					fs.unlink(zipPath, (err) => {
						if (err) {
							console.error("Error deleting file:", err);
						} else {
							console.log(`${zipName} has been deleted.`);
						}
					});
				}, 30000); // 30초 후에 실행
			});

			archive.on("error", function (err) {
				throw err;
			});

			archive.pipe(output); // 압축 파일 스트림을 출력 스트림(output)에 연결
			archive.directory(folderPath, false); // 지정된 경로를 압축 파일에 추가
			archive.finalize(); // 압축 프로세스 완료 후 압축 파일 생성

			//res.end();
		}
	} catch (Error) {
		console.error('Error: ' + Error);
	}
});

// 실사 요청서 부서 조회 팝업창
app.get('/departmentlist', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");pm2 restart KUcarbon
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("departmentlist", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, orgIdx: req.session.user.orgIdx, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});
// 실사 요청서 부서 조회 팝업창

app.post('/department_list', async function (req, res) {
	var dpt_code = '0001';

	if (req.body.code) {
		dpt_code = req.body.code;
	}

	var sql = "SELECT * FROM tblDepartment WHERE sUpCode=? and nUseYN=1";
	var dpt_list = await directQuery(sql, [dpt_code]);

	var sub_chk = [];

	sql = "SELECT count(*) cnt ";
	sql += "FROM tblDepartment ";
	sql += "WHERE sUpCode=?;";

	for (var idx = 0; idx < dpt_list.length; idx++) {
		let res = await directQuery(sql, [dpt_code]);

		if (res[0].cnt == 0) {
			sub_chk.push(false);
		}
		else {
			sub_chk.push(true);
		}
	}

	sql = "SELECT * FROM tblDepartment WHERE nUseYN=1";
	var all_list = await directQuery(sql, [dpt_code]);

	res.send({ dpt_list: dpt_list, sub_chk: sub_chk, all_list: all_list });
});

app.post('/department_search', async function (req, res) {
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var nstart = parseInt (req.body.nstart);
	var ssearch = req.body.ssearch;
	var sname = req.body.sname;

	var user_idx = req.session.user.userid;
	//var user_idx = 112563;
	// 개인별 정보 가져오기
	//var sql = "SELECT * FROM tblUserItem WHERE sCode=? ";
	var sql = "SELECT * FROM tblDepartment WHERE nUseYN=1 ";

	var qsname = "%" + sname + "%";
	switch (parseInt(ssearch)) {
		case 0: sql += 'AND sNameKor LIKE ? '; break; // 부서명
		case 1: sql += 'AND sDepartmentCode LIKE ? '; break; // 부서코드
	}

	var dpt_list = await directQuery(sql, [qsname]);
	res.send({ dpt_list: dpt_list });
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
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
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

	res.render('sub_takeover', { pinfos: rinfos, ssearch: ssearch, sname: sname });
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
	//var total = pinfos.length;


	res.send({ pinfos: rinfos, ssearch: ssearch, sname: sname });

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
	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;
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
	//var total = pinfos.length;

	res.send({ pinfos: rinfos, ssearch: ssearch, sname: sname });
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
		/*
		sheetOne.columns = [
			{header: '건물명'    , key: 'build'   , width: 20},
			{header: '층'        , key: 'floor'   , width: 10},
			{header: '호실번호'  , key: 'roomnum' , width: 10},
			{header: '호실명'    , key: 'room'    , width: 10},
			{header: '구분'      , key: 'category', width: 20},
			{header: '물품번호'  , key: 'itemnum' , width: 20},
			{header: '물품명'    , key: 'device'  , width: 20},
			{header: '모델명(제조사)'    , key: 'model'   , width: 45},
			{header: '소속부서'  , key: 'organi'  , width: 10},
			{header: '공용/개인' , key: 'public'  , width: 10},
			{header: '실별책임자', key: 'master'  , width: 10},
			{header: '물품관리자', key: 'real'    , width: 10},
			{header: '사용자'    , key: 'user'    , width: 10},
			{header: '상태'      , key: 'status'  , width: 10}
		];
		*/
		sheetOne.columns = [
			{ header: '물품번호', key: 'item_num', width: 20 },
			{ header: '물품구분', key: 'category', width: 20 },
			{ header: '물품분류(대)', key: 'category_big', width: 20 },
			{ header: '물품분류(중)', key: 'category_mid', width: 20 },
			{ header: '물품명', key: 'item_name', width: 20 },
			{ header: '모델명(제조사)', key: 'maker', width: 45 },
			{ header: '소속부서', key: 'real_organi', width: 20 },
			{ header: '변동부서', key: 'var_organi', width: 20 },
			{ header: '현재물품관리구분', key: 'real_pub', width: 20 },
			{ header: '현재사용자', key: 'real_user', width: 20 },
			{ header: '변경물품관리구분', key: 'var_pub', width: 20 },
			{ header: '변경사용자코드', key: 'var_userNo', width: 20 },
			{ header: '변경사용자명', key: 'var_user', width: 20 },
			{ header: '현재위치', key: 'real_loc', width: 45 },
			{ header: '변경위치', key: 'var_loc', width: 45 }
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

				var val_pub = '개인';

				if (res_pers[0].sUser == '' || res_pers[0].sUser == '공동사용')
					val_pub = '공동';

				var val_floor = '';

				var part_floor_land = '';
				var part_floor_num = 0;

				part_floor_land = res_pers[0].sFloor.substring(0, 2);
				part_floor_num = parseInt(res_pers[0].sFloor.substring(2, 4));

				console.log(res_pers[0].sFloor.substring(2, 4));

				if (part_floor_land == "BF")
					val_floor = "지하 " + part_floor_num + "층";
				else
					val_floor = part_floor_num + "층";

				// 필드값 넣기
				var rows = {};
				rows['item_num'] = res_pers[0].sFixtureNo;
				rows['category'] = res_pers[0].sFixtureType;
				rows['category_big'] = '';
				rows['category_mid'] = '';
				rows['item_name'] = res_pers[0].sFixtureName;
				rows['maker'] = res_pers[0].sFixtureModel + "(" + res_pers[0].sFixtureMaker + ")";
				rows['real_organi'] = res_pers[0].sUserOrg;
				rows['var_organi'] = '';
				rows['real_pub'] = res_pers[0].sUser === '공동사용' ? '공동' : '개인';
				rows['real_user'] = res_pers[0].sUser;
				rows['var_pub'] = '';
				rows['var_userNo'] = '';
				rows['var_user'] = '';
				rows['real_loc'] = '서울캠퍼스 ' + res_pers[0].sBuild + ' ' + val_floor + ' ' + res_pers[0].sRoom + ' ' + res_pers[0].sRoomNo;
				rows['var_loc'] = '';
				/*
				rows ['build']    = res_pers [0].sBuild;
				rows ['floor']    = res_pers [0].sFloor;
				rows ['roomnum']  = res_pers [0].sRoomNo;
				rows ['room']     = res_pers [0].sRoom;
				rows ['category'] = res_pers [0].sFixtureType;
				rows ['itemnum']  = res_pers [0].sFixtureNo;
				rows ['device']   = res_pers [0].sFixtureName;
				rows ['model']    = res_pers [0].sFixtureModel + "(" + res_pers [0].sFixtureMaker + ")";
				rows ['organi']   = res_pers [0].sUserOrg;
				rows ['public']   = '개인';
				rows ['master']   = res_pers [0].sName;
				rows ['real']     = res_pers [0].sRuUser;
				rows ['user']     = res_pers [0].sUser;
				rows ['status']   = res_pers [0].sRuStatus;
				*/
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

	const selectOptionObj = getSelectOptionObj();
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	let isCommonUser = true;
	/**
	 * "master":0,  
		"hight-master":1,  
		"middle-manager":2,  
		"manager":3,  
		"commonUser":4,  
		"shereId":5,
	 */
	const permissionMap = {
		"master": 0,
		"hight-master": 1,
		"middle-manager": 2,
		"manager": 3,
		"commonUser": 4,
		"shereId": 5,
	}
	if (req.session.user.permission < permissionMap.commonUser) {
		isCommonUser = false;
	}

	var nstart = 0;
	if (req.query.nstart) {
		nstart = req.query.nstart;
	}
	var sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, a.sMail mail,a.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex '
	sql += whereQuery;

	//var user_idx = req.session.user.userid;
	var user_idx = req.session.user.selectAuithority;

	var res_total = isCommonUser ? await directQuery(sql, [user_idx]) : await directQuery(sql);
	var total = res_total.length;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	var rlists = isCommonUser ? await directQuery(sql, [user_idx, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists = rlists.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_audio_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=0 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=0 ';
	sql += rlists_audio_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	var rlists_audio = isCommonUser ? await directQuery(sql, [user_idx, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_audio = rlists_audio.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_video_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=1 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=1 ';
	sql += rlists_video_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	var rlists_video = isCommonUser ? await directQuery(sql, [user_idx, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_video = rlists_video.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_sys_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=2 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=2 ';
	sql += rlists_sys_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	var rlists_sys = isCommonUser ? await directQuery(sql, [user_idx, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_sys = rlists_sys.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_pc_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=3 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=3 ';
	sql += rlists_pc_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	var rlists_pc = isCommonUser ? await directQuery(sql, [user_idx, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_pc = rlists_pc.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	let getDeviceManagerQuery = 'SELECT * FROM tblManager;';
	const diviceManager = await directQuery(getDeviceManagerQuery);

	res.render('sub_status', { page_data: page_data, rlists: rlists, rlists_audio: rlists_audio, rlists_video: rlists_video, rlists_sys: rlists_sys, rlists_pc: rlists_pc, req_name: req.session.user.name, permission: req.session.user.permission, diviceManager: diviceManager });
});

app.post('/device-manager', async function (req, res) {
	console.log('/device-manager')

	let sql = 'INSERT INTO `tblManager`(category, name, `innerTel`, phone, `employeeNum`) VALUES(?,?,?,?,?);';
	const data = req.body.data;
	if (data.category === '자연계, 녹지지역') {
		data.category = '자연계녹지지역'
	}
	const createDeviceManager = await directQuery(sql, [data.category, data.name, data.innerTel, data.phone, data.employeeNum]);

	//갱신된 전체로 다시 보내줘야 하나?
	res.send({ sucess: true, result: createDeviceManager })

})

app.put('/device-manager/:managerId', async function (req, res) {
	console.log('app.put /device-manager')
	let sql = 'UPDATE `tblManager` SET category=?, name=?, `innerTel`=?, phone=?, employeeNum=? WHERE id=?;';
	const data = req.body.data;
	if (data.category === '자연계, 녹지지역') {
		data.category = '자연계녹지지역'
	}
	const editDeviceManager = await directQuery(sql, [data.category, data.name, data.innerTel, data.phone, data.employeeNum, req.params.managerId]);
	res.send({ sucess: true, result: editDeviceManager })
})

app.delete('/device-manager/:managerId', async function (req, res) {
	console.log('app.delete /device-manager')
	//DELETE FROM `tblManager` WHERE `id` IN (8,9,10);
	let sql = 'DELETE FROM `tblManager` WHERE id=?;';

	const removeDeviceManager = await directQuery(sql, [req.params.managerId]);
	res.send({ sucess: true, result: removeDeviceManager })
})

// 나눔 물품 기준 숫자 번호를 없애기 위해 
app.post('/create_reusable_new', async function (req, res) {

	var data = JSON.parse(req.body.data);

	var reusable_name = data.reusable_name;
	var reusable_type = data.reusable_type;
	var reusable_contnet = data.reusable_contnet;
	var reusable_memo = data.reusable_memo;
	var reusable_place = data.reusable_place;
	var reusable_rank = data.reusable_rank;
	var user_email = data.user_email;
	var user_phone = data.user_phone;
	var reusable_UserNo = req.session.user['userid'];
	var prev_name = req.session.user['name'];
	var now_name = req.session.user['name'];
	var reusable_etc = data.reusable_etc;

	var reusable_share = 1;

	// var reusable_number = createRandNum(1000000000000000, 9999999999999999);
	var reusable_number = "-";

	let sql = 'INSERT INTO `tblReusable`(sReusableName, sReusableType, sReusableContent, sReusableMemo, sReusablePlace,sReusableUserNo, sReusableEmail, sReusableMobile,nReusableShare,sFixtureNo,sFixtureName,sFixtureType,dFixtureDate,sReusableNowUser,sReusablePrevUser,nReusableRank,nReusableEtc) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?);';

	const createReusableManager = await directQuery(sql, [reusable_name, reusable_type, reusable_contnet, reusable_memo, reusable_place, reusable_UserNo, user_email, user_phone, reusable_share, reusable_number, reusable_name, reusable_type, prev_name, now_name, reusable_rank, reusable_etc]);
	var resIdx = createReusableManager.insertId;

	res.send({ sucess: true, result: createReusableManager, reus_id: resIdx })
});

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

app.post('/reusableFixtureCreate', async function (req, res) {
	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	console.log('/reusableFixtureCreate');

	var arrayReusableData = req.body.reusableData;

	var arrayImage = req.body.reusableImg;
	var arrayBinImage = req.body.reusableImgBin;

	//console.log(req.body.chk_btn[0]);
	if (req.body.chk_btn) {
		for (var i = 0; i < req.body.chk_btn.length; i++) {
			// 개인별 정보 가져오기
			var sql = "SELECT * FROM tblFixture WHERE sFixtureNo=? ";
			var res_pers = await directQuery(sql, [req.body.chk_btn[i]]);

			var data_reusableName = "";
			var data_reusableType = "";
			var data_reusableContent = "";
			var data_reusableMemo = "";
			var data_reusablePlace = "";
			var data_reusableMail = "";
			var data_reusableRank = "";

			for (var j = 0; j < arrayReusableData.length; j++) {
				if (arrayReusableData[j].pick_num == req.body.chk_btn[i]) {
					data_reusableName = arrayReusableData[j].reusable_name;
					data_reusableType = arrayReusableData[j].reusable_type;
					data_reusableContent = arrayReusableData[j].reusable_contnet;
					data_reusableMemo = arrayReusableData[j].reusable_memo;
					data_reusablePlace = arrayReusableData[j].reusable_place;
					data_reusableMail = arrayReusableData[j].reusable_mail;
					data_reusableRank = arrayReusableData[j].reusable_rank;
					break;
				}
			}

			//var reusable_name = res_pers[0].sFixtureName;
			var reusable_name = data_reusableName;

			//var reusable_Type = res_pers[0].sFixtureType;
			var reusable_Type = data_reusableType;

			//var reusable_Content = res_pers[0].sFixtureName;
			var reusable_Content = data_reusableContent;

			//var reusable_Memo = res_pers[0].sFixtureStandard;
			var reusable_Memo = data_reusableMemo;

			//var reusable_Place = res_pers[0].sBuild;
			var reusable_Place = data_reusablePlace;

			var reusable_Email = req.session.user['email'];
			var reusable_Mobile = req.session.user['tel'];
			var reusable_Share = 0;
			var fixture_no = res_pers[0].sFixtureNo;
			var fixture_name = res_pers[0].sFixtureName;
			var fixture_maker = res_pers[0].sFixtureMaker;
			var fixture_model = res_pers[0].sFixtureModel;
			var fixture_type = res_pers[0].sFixtureType;
			var fixture_price = res_pers[0].sFixturePrice;
			var build_name = res_pers[0].sBuild;
			var room_no = res_pers[0].sRoomNo;
			var prev_name = req.session.user['name'];
			var now_name = req.session.user['name'];
			var reusable_UserNo = req.session.user['userid'];

			let sql_Reusable = 'INSERT INTO `tblReusable`(sReusableName, sReusableType, sReusableContent, sReusableMemo, sReusablePlace, sReusableUserNo, sReusableEmail, sReusableMobile,nReusableShare,sFixtureNo,sFixtureName,sFixtureType,sFixtureMaker,sFixtureModel,sFixturePrice,sFixtureBuildName,sFixtureRoomNo,dFixtureDate,sReusableNowUser,sReusablePrevUser,nReusableRank) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?);';

			var resu_result = await directQuery(sql_Reusable, [reusable_name, reusable_Type, reusable_Content, reusable_Memo, reusable_Place, reusable_UserNo, reusable_Email, reusable_Mobile, reusable_Share, fixture_no, fixture_name, fixture_type, fixture_maker, fixture_model, fixture_price, build_name, room_no, now_name, prev_name, data_reusableRank]);

			var resIdx = resu_result.insertId;

			var arr_img = [];
			var arr_imgBin = [];

			for (var j = 0; j < arrayImage.length; j++) {
				for (var x = 0; x < arrayImage[j].length; x++) {

					if (arrayImage[j][x].pick_num == req.body.chk_btn[i]) {
						arr_img.push(arrayImage[j][x]);
						arr_imgBin.push(arrayBinImage[j][x]);
					}
				}

			}

			/*
			//QR 생성
			if(qr_bool == true)
			{
				for(var j = 0; j < arr_img.length;j++)
				{
					var file_name = arr_img[j].file;
					//const original = fs.readFileSync(file_name);
					var file_bin = arr_img[j].bin;
					const original = Buffer.from(file_bin.split(",")[1], 'base64');

					await fs.writeFile( "./QRTest_" + file_name, original, 'base64', function(err) {
						console.log(err)
					});

					var json_data = {"UserNo":req.session.user['userid'],"FixNo":fixture_no,"FixName":fixture_name};
					var json_text = JSON.stringify(json_data);

					QRCode.toFile("QRImg.png",json_text, {
						color: {
							dark: '#000',
							light: '#0000'
						}
					}, function (error) {
						if(error) throw error;
			
						var water_option = {
							type: "image",
							logo: "QRImg.png",
							destination: "QRResult_" + file_name,
							source: "QRTest_" + file_name,
							position: {
								logoX : 0,
								logoY : 0,
								logoHeight : 80,
								logoWidth : 80
							}
						};
			
						watermark.embed(water_option, function(status) {
							//Do what you want to do here
							console.log(status);
							var file_result = "QRResult_" + file_name +".png";
						});
					});
				}
			}
			
			//Steggy 생성
			if(steegy_bool == true)
			{
				for(var j = 0; j < arr_img.length;j++)
				{
					var file_name = arr_img[j].file;
					const original = fs.readFileSync(file_name);

					var json_data = {"UserNo":req.session.user['userid'],"FixNo":fixture_no,"FixName":fixture_name};
					var json_text = json_data.toString();

					//steegy_pass
					const concealed = steggy.conceal(steegy_pass)(original, json_text, 'utf8');
					fs.writeFile( "SteganoResult_"+ fileName, concealed, function(err) {
						console.log(err)
					});
				}
			}
			*/


			for (var j = 0; j < arr_img.length; j++) {
				console.log(arr_imgBin[j]);

				var imgPath = arr_img[j].file;
				var imgBin = arr_imgBin[j].bin;

				var sql_img = 'INSERT INTO tblReusableImg(nReusableIdx,sImgPath,sImgBin) ';
				sql_img += 'VALUES(?,?,?);';

				await directQuery(sql_img, [resIdx, imgPath, imgBin]);
			}

			/*
			for (var j = 0; j < arrayImage[req.body.chk_btn[i]].length; j++) {
				var img = arrayImage[req.body.chk_btn[i]][j];
				var imgBin = arrayBinImage[req.body.chk_btn[i]][j];

				var sql = 'INSERT INTO tblReusableImg(nReusableIdx,sImgPath,sImgBin) ';
				sql += 'VALUES(?,?,?);';

				//var arrayImage = req.body.imageArray;
				//var arrayBinImage = req.body.imageBinArray;
		
				await directQuery(sql, [resIdx, img, imgBin]);
			}
			*/

		}
	}

	//res.end();

	res.send({ result: "저장되었습니다." });
});

app.post('/reusableExecl', async function (req, res) {
	try {
		console.log('app.post /reusableExecl');

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
		const filename = '물품거래목록_' + curr_date.getFullYear() + month + day + hour + min + sec + '.xlsx';
		// Sheet 생성
		const sheetOne = workbook.addWorksheet('물품거래목록');
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
			{ header: '재사용번호', key: 'reus_no', width: 20 },
			{ header: '재사용물품이름', key: 'reus_name', width: 20 },
			{ header: '재사용물품분류', key: 'reus_type', width: 20 },
			{ header: '수령위치', key: 'reus_place', width: 20 },
			{ header: '등록자메일', key: 'reus_mail', width: 20 },
			{ header: '등록자연락처', key: 'reus_mobile', width: 20 },
			{ header: '비품/나눔', key: 'reus_share', width: 20 },
			{ header: '수령인', key: 'reus_applicant', width: 20 },
			{ header: '수령상태', key: 'reus_state', width: 20 },
			{ header: '물품명', key: 'item_name', width: 20 },
			{ header: '물품명', key: 'item_no', width: 20 },
			{ header: '모델명(제조사)', key: 'maker', width: 45 },
			{ header: '취득일자', key: 'ddate', width: 20 },
			{ header: '취득금액', key: 'bill', width: 20 },
			{ header: '현재캠퍼스', key: 'campus', width: 20 },
			{ header: '현재건물', key: 'build', width: 20 },
			{ header: '현재호실', key: 'roomnum', width: 20 },
			{ header: '기존사용자', key: 'prev_user', width: 20 },
			{ header: '현재사용자', key: 'now_user', width: 20 }
		];
		//console.log(req.body.chk_btn[0]);
		if (req.body.chk_btn) {
			for (var i = 0; i < req.body.chk_btn.length; i++) {
				// 개인별 정보 가져오기
				//var sql = "SELECT * FROM tblUserItem WHERE sItemNo=?";
				var sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
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
				rows['reus_no'] = res_pers[0].nReusableNo;
				rows['reus_name'] = res_pers[0].sReusableName;
				rows['reus_type'] = res_pers[0].sReusableType;
				rows['reus_place'] = res_pers[0].sReusablePlace;
				rows['reus_mail'] = res_pers[0].sReusableEmail;
				rows['reus_mobile'] = res_pers[0].sReusableMobile;

				var share = "비품";

				if (res_pers[0].nReusableShare == 1)
					share = "나눔";

				rows['reus_share'] = share;
				rows['reus_applicant'] = res_pers[0].sReusableApplicant;

				var state = "알 수 없음";


				if (res_pers[0].nReusableState == 1)
					state = "재사용 신청 대기";
				else if (res_pers[0].nReusableState == 2)
					state = "재사용 신청 확인";
				else if (res_pers[0].nReusableState == 3)
					state = "재사용 물품 수령 대기";
				else if (res_pers[0].nReusableState == 4)
					state = "재사용 물품 수령 확인";
				else if (res_pers[0].nReusableState == 5)
					state = "재사용 물품 인수인계 완료";

				rows['reus_state'] = state;
				rows['item_name'] = res_pers[0].sFixtureName;
				rows['item_no'] = res_pers[0].sFixtureNo;
				rows['maker'] = res_pers[0].sFixtureModel + "(" + res_pers[0].sFixtureMaker + ")";
				rows['ddate'] = res_pers[0].dFixtureDate.substring(0, 10);
				rows['bill'] = res_pers[0].sFixturePrice;
				rows['campus'] = '서울캠퍼스';
				rows['build'] = res_pers[0].sFixtureBuildName;
				rows['roomnum'] = res_pers[0].sFixtureRoomNo;
				rows['prev_user'] = res_pers[0].sReusablePrevUser;
				rows['now_user'] = res_pers[0].sReusableNowUser;

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

app.post('/registrationApplicant', async function (req, res) {
	var resu_no = req.body.resu_no;

	var sql = "UPDATE tblReusable SET nReusableState=?, nApplicantState=? WHERE nReusableNo=?";
	var sql_res = await directQuery(sql, [2, 2, resu_no]);

	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
	<body><script>alert ('신청자가 등록되었습니다.');window.close ();</script></body>
	</html>`;
	res.send(html);
});

app.post('/useApplicant', async function (req, res) {
	var resu_no = req.body.resu_no;

	var sql = "SELECT sReusableApplicant FROM tblReusable WHERE nReusableNo = ?";
	var res_resuAppl = await directQuery(sql, [resu_no]);

	if (res_resuAppl[0].sReusableApplicant != "") {
		sql = "UPDATE tblReusable SET nReusableState=?, nApplicantState=? WHERE nReusableNo=?";
		var sql_res = await directQuery(sql, [2, 2, resu_no]);

		const html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
		<body><script>alert ('물품을 전달합니다.');window.close ();</script></body>
		</html>`;
		res.send(html);
	}
	else {
		const html = `<!DOCTYPE html>
		<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
		<body><script>alert ('신청자가 등록되지 않은 상태니다.');window.close ();</script></body>
		</html>`;
		res.send(html);
	}

});

app.post('/confirmReceipt', async function (req, res) {
	var resu_no = req.body.resu_no;

	var sql = "UPDATE tblReusable SET nReusableState=?, nApplicantState=? WHERE nReusableNo=?";
	var sql_res = await directQuery(sql, [4, 4, resu_no]);

	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
	<body><script>alert ('물품을 수령하였습니다.');window.close ();</script></body>
	</html>`;
	res.send(html);
});

// 신청자 수령 완료 처리 API
// app.post('/completeApplicantReceipt', async function (req, res) {
// 	var resu_no = req.body.resu_no;

// 	// 신청자 상태를 수령 완료(3)로 업데이트
// 	var sql = "UPDATE tblReusable SET nApplicantState=? WHERE nReusableNo=?";
// 	await directQuery(sql, [3, resu_no]);

// 	// 재사용 물품 정보 조회
// 	sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
// 	var sql_res = await directQuery(sql, [resu_no]);

// 	// 재사용 물품이고 물품 상태가 수령 완료인 경우
// 	if (sql_res[0].nReusableShare == 0 && sql_res[0].nReusableState == 3) {
// 		var PrevUser = sql_res[0].sReusableNowUser;

// 		// 신청자 정보 초기화
// 		var ApplicantEmail = "";
// 		var ApplicantName = sql_res[0].sReusableApplicant;
// 		var ApplicantOrg = "";
// 		var ApplicantUserOrg = "";
// 		var ApplicantUserNo = "";
// 		var ApplicantUserDptCode = "";

// 		// 테스트 계정별 정보 설정
// 		if (ApplicantName == "고려대 테스트 유저") {
// 			ApplicantEmail = "korea@korea.ac.kr";
// 			ApplicantOrg = "본부";
// 			ApplicantUserOrg = "본부";
// 			ApplicantUserNo = "000000";
// 			ApplicantUserDptCode = "0000";
// 		}
// 		else if (ApplicantName == "원격교육센터 02") {
// 			ApplicantEmail = "kbw5636@kounosoft.com";
// 			ApplicantOrg = "총무부";
// 			ApplicantUserOrg = "총무부";
// 			ApplicantUserNo = "210597";
// 			ApplicantUserDptCode = "5022";
// 		}
// 		else if (ApplicantName == "테스트자산관리01") {
// 			ApplicantEmail = "jaebeen2@kounosoft.com";
// 			ApplicantOrg = "관리팀";
// 			ApplicantUserOrg = "관리팀";
// 			ApplicantUserNo = "597210";
// 			ApplicantUserDptCode = "5846";
// 		}
// 		else if (ApplicantName == "테스트자산관리02") {
// 			ApplicantEmail = "sizin@kounosoft.com";
// 			ApplicantOrg = "관리팀";
// 			ApplicantUserOrg = "관리팀";
// 			ApplicantUserNo = "666308";
// 			ApplicantUserDptCode = "0014";
// 		}
// 		else {
// 			// 실제 사용자 정보 조회
// 			sql = "SELECT * FROM tblUser WHERE sName=? ";
// 			var email_res = await directQuery(sql, [ApplicantName]);

// 			ApplicantEmail = email_res[0].sEMail;
// 			ApplicantUserNo = email_res[0].sNumber;
// 			ApplicantUserDptCode = email_res[0].sDepartmentCode;

// 			// 조직 정보 조회
// 			sql = "SELECT * FROM tblOrganization WHERE nIndex=? ";
// 			var org_res = await directQuery(sql, [email_res[0].nOrgIdx]);

// 			ApplicantOrg = org_res[0].sName;
// 			ApplicantUserOrg = org_res[0].sName;
// 		}

// 		// 재사용 물품 사용자 정보 업데이트
// 		sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
// 		await directQuery(sql, [PrevUser, ApplicantName, resu_no]);

// 		// 비품 정보 업데이트
// 		sql = "UPDATE tblFixture SET sOrg=?, sUserOrg=?, sUser=?, sUserNo=?, sDepartmentCode=? WHERE sFixtureNo=?";
// 		await directQuery(sql, [ApplicantOrg, ApplicantUserOrg, ApplicantName, ApplicantUserNo, ApplicantUserDptCode, sql_res[0].sFixtureNo]);
// 	}
// 	// 나눔 물품이고 물품 상태가 수령 완료인 경우
// 	else if (sql_res[0].nReusableShare == 1 && sql_res[0].nReusableState == 3) {
// 		var PrevUser = sql_res[0].sReusableNowUser;

// 		var ApplicantEmail = "";
// 		var ApplicantName = sql_res[0].sReusableApplicant;

// 		// 테스트 계정별 이메일 설정
// 		if (ApplicantName == "고려대 테스트 유저") {
// 			ApplicantEmail = "korea@korea.ac.kr";
// 		}
// 		else if (ApplicantName == "원격교육센터 02") {
// 			ApplicantEmail = "kbw5636@kounosoft.com";
// 		}
// 		else if (ApplicantName == "테스트자산관리01") {
// 			ApplicantEmail = "jaebeen2@kounosoft.com";
// 		}
// 		else if (ApplicantName == "테스트자산관리02") {
// 			ApplicantEmail = "sizin@kounosoft.com";
// 		}
// 		else {
// 			// 실제 사용자 이메일 조회
// 			sql = "SELECT * FROM tblUser WHERE sName=? ";
// 			var email_res = await directQuery(sql, [ApplicantName]);

// 			ApplicantEmail = email_res[0].sEMail;
// 		}

// 		// 나눔 물품 사용자 정보 업데이트
// 		sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";

// 		console.log("PrevUser", PrevUser);
// 		console.log("ApplicantName", ApplicantName);

// 		await directQuery(sql, [PrevUser, ApplicantName, resu_no]);
// 	}

// 	// 완료 메시지 응답
// 	const html = `<!DOCTYPE html>
// 	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
// 	<body><script>alert ('인수인계가 완료하였습니다.');window.close ();</script></body>
// 	</html>`;
// 	res.send(html);
// });
// 위것과 구분
app.post('/completeApplicantReceipt', async function (req, res) {
	try {
		var resu_no = req.body.resu_no;

		// 신청자 상태를 수령 완료(3)로 업데이트
		var sql = "UPDATE tblReusable SET nApplicantState=? WHERE nReusableNo=?";
		await directQuery(sql, [3, resu_no]);

		// 재사용 물품 정보 조회
		sql = "SELECT * FROM tblReusable WHERE nReusableNo=?";
		var sql_res = await directQuery(sql, [resu_no]);

		// 둘 다 수령 완료 상태(3)일 때만 처리
		if (sql_res[0].nReusableState == 3 && sql_res[0].nApplicantState == 3) {
			// 재사용 물품인 경우
			if (sql_res[0].nReusableShare == 0) {
				var PrevUser = sql_res[0].sReusableNowUser;
				// 신청자 정보 초기화
				var ApplicantEmail = "";
				var ApplicantName = sql_res[0].sReusableApplicant;
				var ApplicantOrg = "";
				var ApplicantUserOrg = "";
				var ApplicantUserNo = "";
				var ApplicantUserDptCode = "";

				// 테스트 계정별 정보 설정
				if (ApplicantName == "고려대 테스트 유저") {
					ApplicantEmail = "korea@korea.ac.kr";
					ApplicantOrg = "본부";
					ApplicantUserOrg = "본부";
					ApplicantUserNo = "000000";
					ApplicantUserDptCode = "0000";
				}
				else if (ApplicantName == "원격교육센터 02") {
					ApplicantEmail = "kbw5636@kounosoft.com";
					ApplicantOrg = "총무부";
					ApplicantUserOrg = "총무부";
					ApplicantUserNo = "210597";
					ApplicantUserDptCode = "5022";
				}
				else if (ApplicantName == "테스트자산관리01") {
					ApplicantEmail = "jaebeen2@kounosoft.com";
					ApplicantOrg = "관리팀";
					ApplicantUserOrg = "관리팀";
					ApplicantUserNo = "597210";
					ApplicantUserDptCode = "5846";
				}
				else if (ApplicantName == "테스트자산관리02") {
					ApplicantEmail = "sizin@kounosoft.com";
					ApplicantOrg = "관리팀";
					ApplicantUserOrg = "관리팀";
					ApplicantUserNo = "666308";
					ApplicantUserDptCode = "0014";
				}
				else {
					// 실제 사용자 정보 조회
					sql = "SELECT * FROM tblUser WHERE sName=?";
					var email_res = await directQuery(sql, [ApplicantName]);

					ApplicantEmail = email_res[0].sEMail;
					ApplicantUserNo = email_res[0].sNumber;
					ApplicantUserDptCode = email_res[0].sDepartmentCode;

					// 조직 정보 조회
					sql = "SELECT * FROM tblOrganization WHERE nIndex=?";
					var org_res = await directQuery(sql, [email_res[0].nOrgIdx]);

					ApplicantOrg = org_res[0].sName;
					ApplicantUserOrg = org_res[0].sName;
				}

				// 재사용 물품 사용자 정보 업데이트
				sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
				await directQuery(sql, [PrevUser, ApplicantName, resu_no]);

				// 비품 정보 업데이트
				sql = "UPDATE tblFixture SET sOrg=?, sUserOrg=?, sUser=?, sUserNo=?, sDepartmentCode=? WHERE sFixtureNo=?";
				await directQuery(sql, [ApplicantOrg, ApplicantUserOrg, ApplicantName, ApplicantUserNo, ApplicantUserDptCode, sql_res[0].sFixtureNo]);
			}
			// 나눔 물품이고 물품 상태가 수령 완료인 경우
			// 나눔 물품인 경우
			else if (sql_res[0].nReusableShare == 1) {
				var PrevUser = sql_res[0].sReusableNowUser;
				var ApplicantName = sql_res[0].sReusableApplicant;
				var ApplicantEmail = "";

				// 테스트 계정별 이메일 설정
				if (ApplicantName == "고려대 테스트 유저") {
					ApplicantEmail = "korea@korea.ac.kr";
				}
				else if (ApplicantName == "원격교육센터 02") {
					ApplicantEmail = "kbw5636@kounosoft.com";
				}
				else if (ApplicantName == "테스트자산관리01") {
					ApplicantEmail = "jaebeen2@kounosoft.com";
				}
				else if (ApplicantName == "테스트자산관리02") {
					ApplicantEmail = "sizin@kounosoft.com";
				}
				else {
					// 실제 사용자 이메일 조회
					sql = "SELECT * FROM tblUser WHERE sName=?";
					var email_res = await directQuery(sql, [ApplicantName]);

					ApplicantEmail = email_res[0].sEMail;
				}

				// 나눔 물품 사용자 정보 업데이트
				sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
				await directQuery(sql, [PrevUser, ApplicantName, resu_no]);
			}

			return res.json({
				success: true,
				message: '인수인계가 완료되었습니다.'
			});
		} else {
			return res.json({
				success: false,
				message: '물품과 신청자의 상태가 모두 수령 완료 상태가 아닙니다.'
			});
		}
	} catch (error) {
		console.error('Error in completeApplicantReceipt:', error);
		return res.status(500).json({
			success: false,
			message: '처리 중 오류가 발생했습니다.'
		});
	}
});




app.post('/completeReusableReceipt', async function (req, res) {
	try {
		var resu_no = req.body.resu_no;

		// 물품 상태를 수령 완료(3)로 업데이트
		var sql = "UPDATE tblReusable SET nReusableState=? WHERE nReusableNo=?";
		await directQuery(sql, [3, resu_no]);

		// 재사용 물품 정보 조회
		sql = "SELECT * FROM tblReusable WHERE nReusableNo=? ";
		var sql_res = await directQuery(sql, [resu_no]);

		// 둘 다 수령 완료 상태(3)일 때만 처리
		if (sql_res[0].nReusableState == 3 && sql_res[0].nApplicantState == 3) {
			// 재사용 물품인 경우
			if (sql_res[0].nReusableShare == 0) {
				// ... existing code for reusable items ...
				var PrevUser = sql_res[0].sReusableNowUser;
				var ApplicantEmail = "";
				var ApplicantName = sql_res[0].sReusableApplicant;
				var ApplicantOrg = "";
				var ApplicantUserOrg = "";
				var ApplicantUserNo = "";
				var ApplicantUserDptCode = "";

				// ... existing test user checks ...
				if (ApplicantName == "고려대 테스트 유저") {
					// ... existing test user logic ...
				} else {
					sql = "SELECT * FROM tblUser WHERE sName=? ";
					var email_res = await directQuery(sql, [ApplicantName]);

					ApplicantEmail = email_res[0].sEMail;
					ApplicantUserNo = email_res[0].sNumber;
					ApplicantUserDptCode = email_res[0].sDepartmentCode;

					sql = "SELECT * FROM tblOrganization WHERE nIndex=? ";
					var org_res = await directQuery(sql, [email_res[0].nOrgIdx]);

					ApplicantOrg = org_res[0].sName;
					ApplicantUserOrg = org_res[0].sName;
				}

				sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
				await directQuery(sql, [PrevUser, ApplicantName, resu_no]);

				sql = "UPDATE tblFixture SET sOrg=?, sUserOrg=?, sUser=?, sUserNo=?, sDepartmentCode=? WHERE sFixtureNo=?";
				await directQuery(sql, [ApplicantOrg, ApplicantUserOrg, ApplicantName, ApplicantUserNo, ApplicantUserDptCode, sql_res[0].sFixtureNo]);
			}
			// 나눔 물품인 경우
			else if (sql_res[0].nReusableShare == 1) {
				// ... existing code for shared items ...
				var PrevUser = sql_res[0].sReusableNowUser;
				var ApplicantName = sql_res[0].sReusableApplicant;

				sql = "UPDATE tblReusable SET sReusablePrevUser=?, sReusableNowUser=?, dReusableDoneDate=NOW() WHERE nReusableNo=?";
				await directQuery(sql, [PrevUser, ApplicantName, resu_no]);
			}

			return res.json({
				success: true,
				message: '수령이 완료되었습니다.'
			});
		} else {
			return res.json({
				success: false,
				message: '물품과 신청자의 상태가 모두 수령 완료 상태가 아닙니다.'
			});
		}
	} catch (error) {
		console.error('Error in completeReusableReceipt:', error);
		return res.status(500).json({
			success: false,
			message: '처리 중 오류가 발생했습니다.'
		});
	}
});


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

app.post('/cancelReusable', async function (req, res) {
	var resu_no = req.body.resu_no;

	var sql = "DELETE FROM tblReusable WHERE nReusableNo=?";
	var sql_res = await directQuery(sql, [resu_no]);

	var sql_del = "DELETE FROM tblReusableApplicant WHERE nReusableNo=?";
	var del_res = await directQuery(sql_del, [resu_no]);

	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
	<body><script>alert ('해당 물품의 재사용 등록을 취소하였습니다..');</script></body>
	</html>`;
	res.send(html);
});

app.post('/cancelReusableApplicant', async function (req, res) {
	var resu_no = req.body.resu_no;

	var sql = "DELETE FROM tblReusable WHERE nReusableNo=?";
	//var sql = "update tblReusable set nApplicantState = 0 WHERE nReusableNo=? ";
	var sql_res = await directQuery(sql, [resu_no]);

	var sql_del = "DELETE FROM tblReusableApplicant WHERE nReusableNo=?";
	var del_res = await directQuery(sql_del, [resu_no]);

	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
	<body><script>alert ('해당 물품의 재사용 등록을 취소하였습니다..');</script></body>
	</html>`;
	res.send(html);
});

app.post('/applicantDone', async function (req, res) {
	var resu_no = req.body.resu_no;

	//var sql = "DELETE FROM tblReusable WHERE nReusableNo=?";
	var sql = "update tblReusable set nApplicantState = 3 WHERE nReusableNo=? ";
	var sql_res = await directQuery(sql, [resu_no]);

	//var sql_del = "DELETE FROM tblReusableApplicant WHERE nReusableNo=?";
	//var del_res = await directQuery(sql_del, [resu_no]);

	const html = `<!DOCTYPE html>
	<html><head><meta charset="UTF-8"><title>재사용 물품 등록/신청 조회</title></head>
	<body><script>alert ('해당 물품의 재사용 등록을 취소하였습니다..');</script></body>
	</html>`;
	res.send(html);
});

app.post('/status_page', async function (req, res) {
	console.log('app.post /status_page');

	const selectOptionObj = getSelectOptionObj();

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}

	let isCommonUser = true;
	/**
	 * "master":0,  
		"hight-master":1,  
		"middle-manager":2,  
		"manager":3,  
		"commonUser":4,  
		"shereId":5,
	 */
	const permissionMap = {
		"master": 0,
		"hight-master": 1,
		"middle-manager": 2,
		"manager": 3,
		"commonUser": 4,
		"shereId": 5,
	}
	if (req.session.user.permission < permissionMap.commonUser) {
		isCommonUser = false;
	}

	var nstart = 0;
	var plimit = 10;
	var data = JSON.parse(req.body.data);

	nstart = data.nstart;


	var sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, a.sMail mail,a.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex '
	sql += whereQuery;

	//req.session.user.selectAuithority;
	//var res_total = isCommonUser ? await directQuery(sql, [req.session.user.userid]) : await directQuery(sql);
	var res_total = isCommonUser ? await directQuery(sql, [req.session.user.selectAuithority]) : await directQuery(sql);
	var total = res_total.length;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	//var rlists = isCommonUser ? await directQuery(sql, [req.session.user.userid, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);
	var rlists = isCommonUser ? await directQuery(sql, [req.session.user.selectAuithority, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists = rlists.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / plimit;
	var page_data = {
		'name': req.session.user.name,
		'count': nstart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_audio_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=0 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=0 ';
	sql += rlists_audio_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	//var rlists_audio = isCommonUser ? await directQuery(sql, [req.session.user.userid, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);
	var rlists_audio = isCommonUser ? await directQuery(sql, [req.session.user.selectAuithority, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_audio = rlists_audio.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_video_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=1 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=1 ';
	sql += rlists_video_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	//var rlists_video = isCommonUser ? await directQuery(sql, [req.session.user.userid, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);
	var rlists_video = isCommonUser ? await directQuery(sql, [req.session.user.selectAuithority, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_video = rlists_video.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_sys_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=2 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=2 ';
	sql += rlists_sys_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	//var rlists_sys = isCommonUser ? await directQuery(sql, [req.session.user.userid, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);
	var rlists_sys = isCommonUser ? await directQuery(sql, [req.session.user.selectAuithority, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_sys = rlists_sys.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	sql = 'SELECT a.nIndex sindex,date_format(a.dMakeDate, "%Y-%m-%d") make_date,date_format(a.dDoneDate , "%Y-%m-%d") done_date,';
	sql += 'a.sUserName user_name,a.sClass class,b.sName build_name,c.sName room_name,a.sTitle title,a.sMemo memo,a.nMode mode,e.sName org_name, d.sEmail mail,d.sTel tel ,d.sNumber userID, a.nDivision division, a.nSubDivision subDivision , a.sDoneName done_name ';
	sql += 'FROM tblRepair a,tblBuild b,tblBuild c,tblUser d LEFT OUTER JOIN tblOrganization e ';
	sql += 'ON d.nOrgIdx=e.nIndex ';

	const rlists_pc_whereQuery = isCommonUser ? 'WHERE d.sNumber=? AND a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=3 ' : 'WHERE a.nBuildIdx=b.nIndex AND a.nRoomIdx=c.nIndex AND a.nUserIdx=d.nIndex AND a.nDivision=3 ';
	sql += rlists_pc_whereQuery;
	sql += 'ORDER BY a.dMakeDate DESC LIMIT 10 OFFSET ?;';
	//var rlists_pc = isCommonUser ? await directQuery(sql, [req.session.user.userid, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);
	var rlists_pc = isCommonUser ? await directQuery(sql, [req.session.user.selectAuithority, Number(nstart * 10)]) : await directQuery(sql, [Number(nstart * 10)]);

	rlists_pc = rlists_pc.map((data) => {
		const targetDivision = selectOptionObj[String(data.division)]
		const subDivisionStr = targetDivision[String(data.subDivision)]
		return { ...data, subDivision: subDivisionStr }
	})

	let getDeviceManagerQuery = 'SELECT * FROM tblManager;';
	const diviceManager = await directQuery(getDeviceManagerQuery)

	res.send({ page_data: page_data, rlists: rlists, rlists_audio: rlists_audio, rlists_video: rlists_video, rlists_sys: rlists_sys, rlists_pc: rlists_pc, req_name: req.session.user.name, permission: req.session.user.permission, diviceManager: diviceManager });
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
	//console.log("nRoomIdx==>"+nRoomIdx);
	console.log("data.room==>" + data.room);
	sql = 'INSERT INTO tblRepair(nUserIdx,sUserName,nBuildIdx,nRoomIdx,sTitle,sMemo,nDivision,sClass,dMakeDate,sMail,sTel) ';
	sql += 'VALUES(?,?,?,?,?,?,?,?,NOW(),?,?);';
	ret = await directQuery(sql, [useridx, data.name, data.build, data.room, data.title, data.memo, data.division, data.class, data.email, data.phone]);

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
	else {
		let today = new Date();

		var html_data = data.name + "님께서 신청하신 고장 점검 요청이 접수되었습니다.<br>";
		html_data += "일자 : " + today.toLocaleString() + "<br>";
		html_data += "고장내용 : " + data.memo + "<br>";

		let mailOptions = {
			from: 'kbw3672@naver.com', // 보내는 메일의 주소
			to: data.email, // 수신할 이메일
			subject: "고려대학교 자산관리 시스템 고장 점검 요청", // 메일 제목
			html: html_data, // 메일 내용
		};

		transporter.sendMail(mailOptions);
	}



	res.send({ result: result });
});

app.post('/main_repair', async function (req, res) {
	console.log('app.post /main_repair!!');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var data = JSON.parse(req.body.data);
	var data = req.body.data;
	console.log('data==> ' + JSON.stringify(data));
	var userid = data.userid;
	console.log('userid==> ' + userid);

	var mode = "";
	//console.log("repairImg",data.repairImg);
	//console.log("repairImgBin",data.repairImgBin);

	var sql = 'SELECT * FROM tblUser WHERE sNumber=?;';
	var ret = await directQuery(sql, [userid]);
	// console.log ('ret: ' + ret);
	var useridx = ret[0].nIndex;
	//console.log("nRoomIdx==>"+nRoomIdx);
	console.log("data.room==>" + data.room);
	sql = 'INSERT INTO tblRepair(nUserIdx,sUserName,nBuildIdx,nRoomIdx,sTitle,sMemo,nDivision,sClass,dMakeDate,sMail,sTel) ';
	sql += 'VALUES(?,?,?,?,?,?,?,?,NOW(),?,?);';
	ret = await directQuery(sql, [useridx, data.name, data.build, data.room, data.title, data.memo, data.division, data.class, data.email, data.phone]);

	//console.log("insertId",ret.insertId);

	var repairIdx = ret.insertId;

	/*select box 추가 ksj 20240219*/
	var build = 43;
	// var room = 4141;
	var nstart = 0;

	var build_all = 1;
	//var category = 110;

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_all_info = await directQuery(sql, [build_all]);

	console.log('build_all_info[0] JSON==>' + JSON.stringify(build_all_info[0]));
	console.log('build_all_info[0]==>' + build_all_info[0].nIndex);
	//console.log('category==>'+category);
	//const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory =? AND sCatagory!="" ORDER BY nIndex;';
	const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory!="" ORDER BY nIndex;';
	//const rooms = await directQuery(roomsSql, [build_all_info[0].nIndex, category]);
	const rooms = await directQuery(roomsSql, [build_all_info[0].nIndex]);
	const roomsInitData = rooms[0];
	/*
	var build_all = 1;
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery (sql, [build_all]);

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? and nIndex= ? ;';
	var room_info = await directQuery (sql, [build,room]);
	*/

	//sql = 'SELECT * FROM tblBuild WHERE sCatagory=? limit 1;';
	//var room_info = await directQuery(sql, [category]);

	//sql = 'SELECT * FROM tblBuild WHERE nIndex= ? ;';
	//var build_select_info = await directQuery(sql, [room_info[0].nRootIndex]);


	//// 강의실 비품 가져오기
	///*
	//	var sql = 'SELECT a.sName name,b.nIndex dindex,b.sItemNumber dnum,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	//	sql += 'b.sStatus status,c.sOrgName org_name,c.sMasterName master_name,c.sRealName real_name,c.sUserName user_name,c.nPublic public ';
	//	sql += 'FROM tblBuild a,tblDevice b LEFT OUTER JOIN tblRelation c ';
	//	sql += 'ON b.nIndex=c.nDeviceIdx WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=? ';
	//	*/

	//sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	//sql += 'FROM tblFixture ';
	//sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	//var res_room = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID]);
	//var total = res_room.length;
	//sql += 'LIMIT 10 OFFSET ?;';
	//var rinfos = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID, Number(nstart * 10)]);

	//var start_page = nstart - (nstart % 10);
	////var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	//var end_page = total / 10;

	var page_data = {
		//'name': req.session.user['name'],
		//'userid': req.session.user['userid'],
		//'class': req.session.user['class'],
		//'email': req.session.user['email'],
		//'tel': req.session.user['tel'],
		//'count': nstart,
		//'start': start_page,
		//'end': end_page,
		//'total': total,
		'build': roomsInitData.nRootIndex,
		'room': roomsInitData.nIndex,
		'mode': mode
		//'roomID': roomsInitData.sRoomID
	};

	//const changedRinfos = rinfos.map((data) => {
	//	if (data.dFixtureDate === undefined) {
	//		return data;
	//	}
	//	const kmtDate = new Date(data.dFixtureDate);
	//	const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
	//	return { ...data, dFixtureDate: correctDate }
	//})

	//res.render("sub_classroom", { page_data: page_data, lists: build_all_info, rinfos: changedRinfos, room_info: rooms });

	console.log('page_data==>' + JSON.stringify(page_data));
	//console.log('lists==>'+JSON.stringify(build_all_info));
	console.log('rooms==>' + JSON.stringify(rooms));
	res.send({ page_data: page_data, lists: build_all_info, room_info: rooms });
});

app.post('/main_repair_room', async function (req, res) {
	console.log('app.post /main_repair_room!!');

	if (req.session.user == undefined) {
		res.render('index.html');
		return;
	}
	//var data = JSON.parse(req.body.data);
	var data = req.body.data;
	console.log('data==> ' + JSON.stringify(data));
	//var userid = data.userid;
	//console.log ('userid==> ' + userid);
	var rIndex = data.rIndex;
	console.log('rIndex==>' + rIndex);

	//var mode = "";
	//console.log("repairImg",data.repairImg);
	//console.log("repairImgBin",data.repairImgBin);

	//var sql = 'SELECT * FROM tblUser WHERE sNumber=?;';
	//var ret = await directQuery(sql, [userid]);
	// console.log ('ret: ' + ret);
	//var useridx = ret[0].nIndex;
	//console.log("nRoomIdx==>"+nRoomIdx);
	//console.log("data.room==>"+data.room);
	//sql = 'INSERT INTO tblRepair(nUserIdx,sUserName,nBuildIdx,nRoomIdx,sTitle,sMemo,nDivision,sClass,dMakeDate,sMail,sTel) ';
	//sql += 'VALUES(?,?,?,?,?,?,?,?,NOW(),?,?);';
	//ret = await directQuery(sql, [useridx, data.name, data.build, data.room, data.title, data.memo, data.division, data.class, data.email, data.phone]);

	//console.log("insertId",ret.insertId);

	//var repairIdx = ret.insertId;

	/*select box 추가 ksj 20240220*/
	//var build = 43;
	// var room = 4141;
	//var nstart = 0;

	//var build_all = 1;
	//var category = 110;

	//	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	//	var build_all_info = await directQuery(sql, [build_all]);
	//
	//	console.log('build_all_info[0] JSON==>'+JSON.stringify(build_all_info[0]));
	//	console.log('build_all_info[0]==>'+build_all_info[0].nIndex);
	//console.log('category==>'+category);
	//const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory =? AND sCatagory!="" ORDER BY nIndex;';
	//const rooms = await directQuery(roomsSql, [rIndex, category]);
	const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory!="" ORDER BY nIndex;';
	const rooms = await directQuery(roomsSql, [rIndex]);
	const roomsInitData = rooms[0];

	var hoData = '있음';
	if (!roomsInitData) {
		console.log('roomsInitData exist logic start!!');
		hoData = '없음';
		var page_data = {
			'build': 0,
			'room': 0,
			'hoData': hoData
		};
	} else {
		console.log("result.room_info exist!!");
		var page_data = {
			'build': roomsInitData.nRootIndex,
			'room': roomsInitData.nIndex,
			'hoData': hoData
		};

	};
	/*
	var build_all = 1;
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery (sql, [build_all]);

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? and nIndex= ? ;';
	var room_info = await directQuery (sql, [build,room]);
	*/

	//sql = 'SELECT * FROM tblBuild WHERE sCatagory=? limit 1;';
	//var room_info = await directQuery(sql, [category]);

	//sql = 'SELECT * FROM tblBuild WHERE nIndex= ? ;';
	//var build_select_info = await directQuery(sql, [room_info[0].nRootIndex]);


	//// 강의실 비품 가져오기
	///*
	//	var sql = 'SELECT a.sName name,b.nIndex dindex,b.sItemNumber dnum,b.sType type,b.sList list,b.sMaker maker,b.sModel model, ';
	//	sql += 'b.sStatus status,c.sOrgName org_name,c.sMasterName master_name,c.sRealName real_name,c.sUserName user_name,c.nPublic public ';
	//	sql += 'FROM tblBuild a,tblDevice b LEFT OUTER JOIN tblRelation c ';
	//	sql += 'ON b.nIndex=c.nDeviceIdx WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=? ';
	//	*/

	//sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	//sql += 'FROM tblFixture ';
	//sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	//var res_room = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID]);
	//var total = res_room.length;
	//sql += 'LIMIT 10 OFFSET ?;';
	//var rinfos = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID, Number(nstart * 10)]);

	//var start_page = nstart - (nstart % 10);
	////var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	//var end_page = total / 10;

	//var page_data = {
	//	//'name': req.session.user['name'],
	//	//'userid': req.session.user['userid'],
	//	//'class': req.session.user['class'],
	//	//'email': req.session.user['email'],
	//	//'tel': req.session.user['tel'],
	//	//'count': nstart,
	//	//'start': start_page,
	//	//'end': end_page,
	//	//'total': total,
	//	'build': roomsInitData.nRootIndex,
	//	'room': roomsInitData.nIndex,
	//	'hoData': hoData
	//	//'mode': mode
	//	//'roomID': roomsInitData.sRoomID
	//};

	//const changedRinfos = rinfos.map((data) => {
	//	if (data.dFixtureDate === undefined) {
	//		return data;
	//	}
	//	const kmtDate = new Date(data.dFixtureDate);
	//	const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
	//	return { ...data, dFixtureDate: correctDate }
	//})

	//res.render("sub_classroom", { page_data: page_data, lists: build_all_info, rinfos: changedRinfos, room_info: rooms });

	console.log('page_data==>' + JSON.stringify(page_data));
	//console.log('lists==>'+JSON.stringify(build_all_info));
	console.log('rooms==>' + JSON.stringify(rooms));
	res.send({ page_data: page_data, room_info: rooms });
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

app.get('/login', async function (req, res) {

	console.log("login user", req.session.user);
	//res.render("login");

	//var resp_per = await get_personal_per();
	//var resp_rec = await get_personal_rec();

	//console.log("resp_per", resp_per);
	//console.log("resp_rec", resp_rec);

	//get_org_data
	//var datas = await get_org_data();

	//await get_fixture_info("1119840142540001");

	//await updateDpt();
	//await get_fixture_info("1119840142540001");

	/*
	var dpt_code = [6343,5842,6467,7189,7071,5857,7195,5850,7194,7192,3708,6881,5863,5865,6787,14,6398,5853,6871,4522,3696,7040,5302,5477,6570,5866,5860,7056,6793,73,6592,7185,5585,5867,5022,
		5123,6693,6091,7017,125,7096,27,6789,3899,5043,5941,6680,5561,6590,6279,6828,5809,6689,3405,3420,5592,5766,5591,22,4523,6411,4250,6744,6903,4393,5819,3710,6751,75,6317,6281,
		4789,5303,5557,6256,6580,6749,7173,123,7191,7193,7181,5530,7011,24,7174,6670,3457,5605,4619,4957,7015,87,5355,3575,4735,3410,5934,6412,6417,6490,4057,4649,5529,5854,6677,7016,
		74,5602,5798,6804,105,4932,5135,6533,6820,5131,5268,5301,5374,6468,6642,6822,6844,7030,5589,6217,6790,107,5306,5762,4903,7149,5369,5950,4021,5310,5428,5488,68,6809,6812,103,
		3576,5272,5372,5424,5882,6672,6747,3412,4278,4902,4929,5076,5141,5248,5427,5761,5770,5815,5852,6746,92,95,3470,3902,5247,5807,6395,6788,6882,82,4237,5083,5312,5373,6168,7141];

	for(var dpt_idx = 0; dpt_idx < dpt_code.length;dpt_idx++)
	{
		await updateDill1(dpt_code[dpt_idx]);
		await updateDill2(dpt_code[dpt_idx]);
	}
	*/

	//await updateDill1(dpt_code);
	//await updateDill2(dpt_code);

	//console.log("get_org_data",datas);

	if (req.session.user != undefined) {
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

	if (req.session.user != null) {
		res.send({ userid: req.session.user.userid, usernm: req.session.user.name, code: req.session.error.code, msg: req.session.error.msg });
	}
	else {
		res.redirect("login");
	}

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

app.post('/selectAuthority', async function (req, res) {
	var sel_authority = req.body.sel_authority;

	//res.render("index", { idx: req.session.user.name,uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list });

	var sql = "SELECT nOrgIdx,nPermission,nPermission_reusable,nPermission_personalchk,nPermission_vr,sDepartmentCode FROM tblUser WHERE sNumber=?";

	var result_permission = await directQuery(sql, [sel_authority]);

	//orgIdx:res_org[0]?.orgIdx || 0,nOrgIdx

	//userid: '210597'

	//req.session.user.userid = sel_authority;
	req.session.user.orgIdx = result_permission[0].nOrgIdx;
	req.session.user.permission = result_permission[0].nPermission;
	req.session.user.permission_reusable = result_permission[0].nPermission_reusable;
	req.session.user.permission_personalchk = result_permission[0].nPermission_personalchk;
	req.session.user.permission_vr = result_permission[0].nPermission_vr;
	req.session.user.dptCode = result_permission[0].sDepartmentCode;
	req.session.user.selectAuithority = sel_authority;

	res.send({ sucess: true });
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
app.post('/login_old2', async function (req, res) {
	console.log('app.post /login');

	//get_personal_per();

	var userid = req.body.userid;
	var userpw = req.body.userpw;
	//var cb1 = req.body.cb1;
	//console.log('id/pw : ', userid, userpw);
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
			//console.log(Error);
			ret = Error;
		});

		return;
	}

	if (userid == 'super_kouno' && userpw == 'architest') {
		req.session.user = {
			code: 0,
			msg: '',
			name: '슈퍼 계정',
			userid: '000000',
			stdtype: 1,
			class: '관리자',
			email: 'kbw5636@kounosoft.com',
			tel: '010-9318-5636',
			dptCode: "0000",
			permission: 0,
			permission_reusable: 1,
			permission_personalchk: 1,
			permission_vr: 1,
			selectAuithority: '000000',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
		req.session.error = {
			code: 0,
			msg: ''
		};
		res.redirect("super_delegationList");
		return;
	}
	else if (userid == 'furniture' && userpw == 'furniture') {
		req.session.user = {
			code: 0,
			msg: '',
			name: '물품 관리자',
			userid: '98765432',
			stdtype: 1,
			class: '총무부',
			email: 'furniture@korea.ac.kr',
			tel: '010-0000-0000',
			dptCode: "0000",
			permission: 3,
			permission_reusable: 1,
			permission_personalchk: 1,
			permission_vr: 1,
			selectAuithority: '98765432',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
		req.session.error = {
			code: 0,
			msg: ''
		};
		res.redirect("home");
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

	const axios_url = "https://auth.korea.ac.kr/directLoginNew.jsp";

	const sendParam = {
		id: userid,
		pw: userpw,
		returnURL: 'avclass.korea.ac.kr'
	}

	/*
	await axios.post(axios_url, querystring.stringify(sendParam)).then((Response) => {
		//console.log(Response.data);
		var json = {};

		if (Response.status == 200) {
			var $ = cheerio.load(Response.data);
			var sYN = $("input[type=hidden][name=sYN]").val();
			var sWHY = $("input[type=hidden][name=sWHY]").val();
			var msg = $("input[type=hidden][name=msg]").val();
			msg = msg.replace(/\n/g, '');
		}
	});
	*/

	//console.log ({ params });
	// id/pw를 검증하는 uri을 호출한다.(SSO)

	let start_sec = Date.now();

	request(params, async function (error, response, body) {
		var json = {};
		if (!error && response.statusCode == 200) {
			//console.log ({ body });
			let test1_date = Date.now();
			let test1_sec = test1_date - start_sec;
			console.log('test 1 : ' + test1_sec);

			var $ = cheerio.load(body);
			var sYN = $("input[type=hidden][name=sYN]").val();
			var sWHY = $("input[type=hidden][name=sWHY]").val();
			var msg = $("input[type=hidden][name=msg]").val();
			msg = msg.replace(/\n/g, '');

			if (sYN == 'Y') {
				//console.log("jarFilePath",jarFilePath);
				let test2_date = Date.now();
				let test2_sec = test2_date - test1_date;
				console.log('test 2 : ' + test2_sec);

				java.classpath.push(jarFilePath);
				var progInstance = java.import('DecodeEncryptor168');
				var decrypt = progInstance.getDecryptedValueSync(msg);

				let test3_date = Date.now();
				let test3_sec = test3_date - test2_date;
				console.log('test 3 : ' + test3_sec);

				// var decrypt = progInstance.getDecryptedValueSync (body.msg);
				// var instance = new progInstance ();
				// var decrypt = instance.getDecryptedValueSync (msg);
				//console.log ({ decrypt });

				var datas = decrypt.split("&");
				//console.log ({ datas });
				for (var i = 0; i < datas.length; i++) {
					var key_data = datas[i].split("=");
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

				let test4_date = Date.now();
				let test4_sec = test4_date - test3_date;
				console.log('test 4 : ' + test4_sec);

				if (userid == 'atdtest02') {
					json.code = 0;
					json.msg = '';
					json.data = { 'name': sName, 'id': sStdId };

					sql = 'SELECT nPermission permission, nPermission_reusable permission_reusable, nPermission_personalchk permission_personalchk, nPermission_vr permission_vr ';
					sql += 'FROM tblUser ';
					sql += 'WHERE sPortal=?';
					var res_org = await directQuery(sql, [userid]);

					req.session.user = {
						code: 0,
						msg: '',
						name: "원격교육센터 02",
						userid: '210597',
						stdtype: 1,
						orgIdx: 187,
						dptCode: "5022",
						class: '국제교류팀',
						email: 'kbw5636@kounosoft.com',
						tel: '010-9318-5636',
						permission: res_org[0].permission,
						permission_reusable: res_org[0].permission_reusable,
						permission_personalchk: res_org[0].permission_personalchk,
						permission_vr: res_org[0].permission_vr,
						selectAuithority: '210597',
						sel_areaIdx: 0,
						sel_buildIdx: 0,
						sel_floorIdx: 0,
						sel_roomIdx: 0
					};
				}
				else if (userid == 'test_esgasset01') {
					json.code = 0;
					json.msg = '';
					json.data = { 'name': sName, 'id': sStdId };

					sql = 'SELECT nPermission permission, nPermission_reusable permission_reusable, nPermission_personalchk permission_personalchk, nPermission_vr permission_vr ';
					sql += 'FROM tblUser ';
					sql += 'WHERE sPortal=?';
					var res_org = await directQuery(sql, [userid]);

					req.session.user = {
						code: 0,
						msg: '',
						name: '테스트자산관리01',
						userid: '597210',
						stdtype: 1,
						orgIdx: 262,
						dptCode: "5846",
						class: '공과대학행정팀',
						email: 'jaebeen2@kounosoft.com',
						tel: '010-6277-4800',
						permission: res_org[0].permission,
						permission_reusable: res_org[0].permission_reusable,
						permission_personalchk: res_org[0].permission_personalchk,
						permission_vr: res_org[0].permission_vr,
						selectAuithority: '597210',
						sel_areaIdx: 0,
						sel_buildIdx: 0,
						sel_floorIdx: 0,
						sel_roomIdx: 0
					};
				}
				else if (userid == 'test_esgasset02') {
					json.code = 0;
					json.msg = '';
					json.data = { 'name': sName, 'id': sStdId };

					sql = 'SELECT nPermission permission, nPermission_reusable permission_reusable, nPermission_personalchk permission_personalchk, nPermission_vr permission_vr ';
					sql += 'FROM tblUser ';
					sql += 'WHERE sPortal=?';
					var res_org = await directQuery(sql, [userid]);

					req.session.user = {
						code: 0,
						msg: '',
						name: '테스트자산관리02',
						userid: '666308',
						stdtype: 2,
						orgIdx: 174,
						class: '학생지원팀',
						dptCode: "0014",
						email: 'sizin@kounosoft.com',
						tel: '010-3380-4340',
						permission: res_org[0].permission,
						permission_reusable: res_org[0].permission_reusable,
						permission_personalchk: res_org[0].permission_personalchk,
						permission_vr: res_org[0].permission_vr,
						selectAuithority: '666308',
						sel_areaIdx: 0,
						sel_buildIdx: 0,
						sel_floorIdx: 0,
						sel_roomIdx: 0
					};
				}
				else {
					// sql = "SELECT * FROM tblUser WHERE sName=? AND sID=?";
					// res_org = await directQuery(sql, [sName, sStdId]);
					//로그인시 Insert -> 추가만 되고 삭제가 안됨. tblManager연동해서 여기에 있으면 추가하게 하고, 매니저 삭제하면 유저도 삭제하게 하면 계약직이나 임시는 가능. -> 일단 해당 7명은 제어가 가능.
					//문제는 정직원. 테이블 생성 이후 고려대에 등록된 직원은 tblUser에 안들어가 있음. 마찬가지로 넣을 수는 있지만 없는 사람을 찾아서 삭제하진 못함.
					//당장 지금도 tblUser에 변동이 있을 수 있는 상황. 

					// 대분류 리스트
					sql = 'SELECT distinct(b.sName) org,a.nOrgIdx orgIdx,a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.nStdType stdType,a.sDepartmentCode dptCode ,a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
					sql += 'FROM tblUser a,tblOrganization b ';
					sql += 'WHERE a.sNumber=? and a.nOrgIdx=b.nIndex';
					var res_org = await directQuery(sql, [sStdId]);

					const deviceManagerPermission = 3;
					let deviceManagerData = {}
					let isDiviceManager = false
					if (res_org.length > 0) {
						let findManagerSqlByNum = 'SELECT * FROM `tblManager` WHERE employeeNum = ?;'
						const deviceManager = await directQuery(findManagerSqlByNum, [res_org[0].employeeNum]);
						deviceManagerData = deviceManager;
					} else {
						//고려대에 인증은 되는데 DB에 데이터가 없어서 로그인 안되는 경우 처리
						console.log('매니저 임시 분기')
						let findManagerSqlByName = 'SELECT * FROM `tblManager` WHERE name = ?;'
						const deviceManager = await directQuery(findManagerSqlByName, [sName]);
						deviceManagerData = deviceManager;
					}
					isDiviceManager = deviceManagerData && deviceManagerData.length > 0 ? true : false;

					if (res_org[0]?.org == "") {
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
						stdtype: res_org[0]?.stdType || 2,
						orgIdx: res_org[0]?.orgIdx || 0,
						class: res_org[0]?.org || deviceManagerData.category,
						email: res_org[0]?.email || "",
						tel: res_org[0]?.tel || deviceManagerData.phone,
						dptCode: res_org[0]?.dptCode || "0000",
						permission: isDiviceManager ? deviceManagerPermission : res_org[0].permission,
						permission_reusable: isDiviceManager ? deviceManagerPermission : res_org[0].permission_reusable,
						permission_personalchk: isDiviceManager ? deviceManagerPermission : res_org[0].permission_personalchk,
						permission_vr: isDiviceManager ? deviceManagerPermission : res_org[0].permission_vr,
						selectAuithority: sStdId,
						sel_areaIdx: 0,
						sel_buildIdx: 0,
						sel_floorIdx: 0,
						sel_roomIdx: 0
					}
					req.session.error = {
						code: 0,
						msg: ''
					};
				}

				//res.send (json);
				if (req.session.user.permission == 0) {
					res.redirect("super_delegationList");
				}
				else {
					res.redirect("home");
				}


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
		//res.send(json);
	});
});

app.post('/login', async function (req, res) {
	console.log('app.post /login');

	//get_personal_per();

	var userid = req.body.userid;
	var userpw = req.body.userpw;
	//var cb1 = req.body.cb1;
	//console.log('id/pw : ', userid, userpw);
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
			//console.log(Error);
			ret = Error;
		});

		return;
	}

	if (userid == 'super_kouno' && userpw == 'architest') {
		req.session.user = {
			code: 0,
			msg: '',
			name: '슈퍼 계정',
			userid: '000000',
			userpw: userpw,
			stdtype: 1,
			class: '관리자',
			email: 'kbw5636@kounosoft.com',
			tel: '010-9318-5636',
			dptCode: "0000",
			permission: 0,
			permission_reusable: 1,
			permission_personalchk: 1,
			permission_vr: 1,
			selectAuithority: '000000',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
		req.session.error = {
			code: 0,
			msg: ''
		};
		res.redirect("super_delegationList");
		return;
	}
	else if (userid == 'furniture' && userpw == 'furniture') {
		req.session.user = {
			code: 0,
			msg: '',
			name: '물품 관리자',
			userid: '98765432',
			userpw: userpw,
			stdtype: 1,
			class: '총무부',
			email: 'furniture@korea.ac.kr',
			tel: '010-0000-0000',
			dptCode: "0000",
			permission: 3,
			permission_reusable: 1,
			permission_personalchk: 1,
			permission_vr: 1,
			selectAuithority: '98765432',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
		req.session.error = {
			code: 0,
			msg: ''
		};
		res.redirect("home");
		return;
	}

	// POST 직접호출방법
	var form = {
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

	const axios_url = "https://auth.korea.ac.kr/directLoginNew.jsp";

	const sendParam = {
		id: userid,
		pw: userpw,
		returnURL: 'avclass.korea.ac.kr'
	}

	await axios.post(axios_url, querystring.stringify(sendParam)).then((Response) => {
		//console.log(Response.data);
		var json = {};

		if (Response.status == 200) {
			var $ = cheerio.load(Response.data);
			var sYN = $("input[type=hidden][name=sYN]").val();
			var sWHY = $("input[type=hidden][name=sWHY]").val();
			var msg = $("input[type=hidden][name=msg]").val();
			msg = msg.replace(/\n/g, '');

			if (sYN == 'Y') {
				login_process(userid, userpw, msg, req, res);
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
	}).catch(error => {
		var json = {};
		// 타임아웃 또는 요청 실패 처리할 로직
		if (error.code === 'ECONNABORTED') {
			json.code = 100;
			json.msg = '요청이 타임아웃되었습니다';
			//json.msg = body;
			json.data = {};
			req.session.error = {
				code: 100,
				msg: '요청이 타임아웃되었습니다.'
			}
			res.redirect("login");
		} else {
			//console.error('요청 실패:', error);
			json.code = 100;
			json.msg = '로그인을 실패하였습니다.';
			//json.msg = body;
			json.data = {};
			req.session.error = {
				code: 100,
				msg: '로그인을 실패하였습니다.'
			}
			res.redirect("login");
		}
	});;
});

async function login_process(userid, userpw, msg_data, request, response) {
	var json = {};
	//console.log("jarFilePath",jarFilePath);

	java.classpath.push(jarFilePath);
	var progInstance = java.import('DecodeEncryptor168');
	var decrypt = progInstance.getDecryptedValueSync(msg_data);

	var datas = decrypt.split("&");

	var sStdId = "";
	var sName = "";
	var sDeptNm = "";

	console.log('datas', datas);

	for (var i = 0; i < datas.length; i++) {
		var key_data = datas[i].split("=");
		if (key_data[0] == "sStdId") {
			sStdId = key_data[1];
		}
		else if (key_data[0] == "sNAME") {
			sName = key_data[1];
		}
		else if (key_data[0] == "sDeptNm") {
			sDeptNm = key_data[1];
		}
	}

	if (userid == 'atdtest02') {
		json.code = 0;
		json.msg = '';
		json.data = { 'name': sName, 'id': sStdId };

		sql = 'SELECT nPermission permission, nPermission_reusable permission_reusable, nPermission_personalchk permission_personalchk, nPermission_vr permission_vr ';
		sql += 'FROM tblUser ';
		sql += 'WHERE sPortal=?';
		var res_org = await directQuery(sql, [userid]);

		request.session.user = {
			code: 0,
			msg: '',
			name: "원격교육센터 02",
			userid: '210597',
			portalid: userid,
			userpw: userpw,
			stdtype: 1,
			orgIdx: 187,
			dptCode: "5022",
			class: '국제교류팀',
			email: 'kbw5636@kounosoft.com',
			tel: '010-9318-5636',
			permission: res_org[0].permission,
			permission_reusable: res_org[0].permission_reusable,
			permission_personalchk: res_org[0].permission_personalchk,
			permission_vr: res_org[0].permission_vr,
			selectAuithority: '210597',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
	}
	else if (userid == 'test_esgasset01') {
		json.code = 0;
		json.msg = '';
		json.data = { 'name': sName, 'id': sStdId };

		sql = 'SELECT nPermission permission, nPermission_reusable permission_reusable, nPermission_personalchk permission_personalchk, nPermission_vr permission_vr ';
		sql += 'FROM tblUser ';
		sql += 'WHERE sPortal=?';
		var res_org = await directQuery(sql, [userid]);

		request.session.user = {
			code: 0,
			msg: '',
			name: '테스트자산관리01',
			userid: '597210',
			portalid: userid,
			userpw: userpw,
			stdtype: 1,
			orgIdx: 262,
			dptCode: "5846",
			class: '공과대학행정팀',
			email: 'jaebeen2@kounosoft.com',
			tel: '010-6277-4800',
			permission: res_org[0].permission,
			permission_reusable: res_org[0].permission_reusable,
			permission_personalchk: res_org[0].permission_personalchk,
			permission_vr: res_org[0].permission_vr,
			selectAuithority: '597210',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
	}
	else if (userid == 'test_esgasset02') {
		json.code = 0;
		json.msg = '';
		json.data = { 'name': sName, 'id': sStdId };

		sql = 'SELECT nPermission permission, nPermission_reusable permission_reusable, nPermission_personalchk permission_personalchk, nPermission_vr permission_vr ';
		sql += 'FROM tblUser ';
		sql += 'WHERE sPortal=?';
		var res_org = await directQuery(sql, [userid]);

		request.session.user = {
			code: 0,
			msg: '',
			name: '테스트자산관리02',
			userid: '666308',
			portalid: userid,
			userpw: userpw,
			stdtype: 2,
			orgIdx: 174,
			class: '학생지원팀',
			dptCode: "0014",
			email: 'sizin@kounosoft.com',
			tel: '010-3380-4340',
			permission: res_org[0].permission,
			permission_reusable: res_org[0].permission_reusable,
			permission_personalchk: res_org[0].permission_personalchk,
			permission_vr: res_org[0].permission_vr,
			selectAuithority: '666308',
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		};
	}
	else {
		// sql = "SELECT * FROM tblUser WHERE sName=? AND sID=?";
		// res_org = await directQuery(sql, [sName, sStdId]);
		//로그인시 Insert -> 추가만 되고 삭제가 안됨. tblManager연동해서 여기에 있으면 추가하게 하고, 매니저 삭제하면 유저도 삭제하게 하면 계약직이나 임시는 가능. -> 일단 해당 7명은 제어가 가능.
		//문제는 정직원. 테이블 생성 이후 고려대에 등록된 직원은 tblUser에 안들어가 있음. 마찬가지로 넣을 수는 있지만 없는 사람을 찾아서 삭제하진 못함.
		//당장 지금도 tblUser에 변동이 있을 수 있는 상황. 

		// 대분류 리스트
		sql = 'SELECT distinct(b.sName) org,a.nOrgIdx orgIdx,a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.nStdType stdType,a.sDepartmentCode dptCode ,a.nPermission permission, a.nPermission_reusable permission_reusable, a.nPermission_personalchk permission_personalchk, a.nPermission_vr permission_vr ';
		sql += 'FROM tblUser a,tblOrganization b ';
		sql += 'WHERE a.sNumber=? and a.nOrgIdx=b.nIndex';
		var res_org = await directQuery(sql, [sStdId]);

		const deviceManagerPermission = 3;
		let deviceManagerData = {}
		let isDiviceManager = false
		if (res_org.length > 0) {
			let findManagerSqlByNum = 'SELECT * FROM `tblManager` WHERE employeeNum = ?;'
			const deviceManager = await directQuery(findManagerSqlByNum, [res_org[0].employeeNum]);
			deviceManagerData = deviceManager;
		} else {
			//고려대에 인증은 되는데 DB에 데이터가 없어서 로그인 안되는 경우 처리
			console.log('매니저 임시 분기')
			let findManagerSqlByName = 'SELECT * FROM `tblManager` WHERE name = ?;'
			const deviceManager = await directQuery(findManagerSqlByName, [sName]);
			deviceManagerData = deviceManager;
		}
		isDiviceManager = deviceManagerData && deviceManagerData.length > 0 ? true : false;

		if (res_org[0]?.org == "") {
			res_org[0].org = sDeptNm;
		}

		json.code = 0;
		json.msg = '';
		json.data = { 'name': sName, 'id': sStdId };
		request.session.user = {
			code: 0,
			msg: '',
			name: sName,
			userid: sStdId,
			portalid: userid,
			userpw: userpw,
			stdtype: res_org[0]?.stdType || 2,
			orgIdx: res_org[0]?.orgIdx || 0,
			class: res_org[0]?.org || deviceManagerData.category,
			email: res_org[0]?.email || "",
			tel: res_org[0]?.tel || deviceManagerData.phone,
			dptCode: res_org[0]?.dptCode || "0000",
			permission: isDiviceManager ? deviceManagerPermission : res_org[0].permission,
			permission_reusable: isDiviceManager ? deviceManagerPermission : res_org[0].permission_reusable,
			permission_personalchk: isDiviceManager ? deviceManagerPermission : res_org[0].permission_personalchk,
			permission_vr: isDiviceManager ? deviceManagerPermission : res_org[0].permission_vr,
			selectAuithority: sStdId,
			sel_areaIdx: 0,
			sel_buildIdx: 0,
			sel_floorIdx: 0,
			sel_roomIdx: 0
		}
		request.session.error = {
			code: 0,
			msg: ''
		};
	}

	//res.send (json);
	if (request.session.user.permission == 0) {
		response.redirect("super_delegationList");
	}
	else {
		response.redirect("home");
	}
}

app.post('/logout', function (req, res) {
	console.log("logout");

	req.session.user = {
		code: 0,
		msg: '',
		name: '',
		userid: '',
		class: '',
		email: '',
		tel: '',
		sel_areaIdx: 0,
		sel_buildIdx: 0,
		sel_floorIdx: 0,
		sel_roomIdx: 0
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
		console.log(Response.data);
	}).catch((Error) => {
		console.log(Error);
		ret = Error;
	})

	res.redirect("login");
	//return;
});

app.post('/getCo2Data', function (req, res) {
	const ku_select = "B_TCO2";

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {
		let query = "select * from Data_KU where YEAR IN (2021,2022) AND BID = ? ORDER BY `YEAR` DESC";
		console.log(ku_select)
		connection.query(query, [ku_select], (error, response) => {
			console.log(response)
			const json = {
				thisMon: '-',
				prevMon: '-',
				thisYear: response[0].YEAR,
				prevYear: response[1].YEAR,
				thisYearValue: response[0].YEAR_SUM,
				prevYearValue: response[1].YEAR_SUM,
			}
			const result = JSON.parse(JSON.stringify(json));
			res.send(result);
		});
	});



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
	console.log('ku_year==>.' + ku_year)
	console.log('ku_year==>t.' + typeof ku_year)
	var ku_select = "B_TCO2";//req.body.select;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "select * from Data_KU where BID = ?";
		let query2 = "select * from carbon_month where YEAR = ?";

		connection.query(query, [ku_select], (error, response) => {
			console.log('response==>.' + JSON.stringify(response));
			var obj = JSON.parse(JSON.stringify(response));

			connection.query(query2, [ku_year, ku_select], (error, response) => {
				var obj2 = JSON.parse(JSON.stringify(response));

				res.send({ list_data: obj, list_data2: obj2 });
			});


		});
	});
});

app.post('/getFixture', async function (req, res) {
	console.log("getFixture start!!");
	var ku_year = req.body.year;
	var ku_year1 = ku_year - 1;
	var ku_year2 = ku_year - 2;
	var ku_year3 = ku_year - 3;

	var ku_year_before = ku_year - 4;
	var ku_nextYear = ku_year + 1;
	console.log('ku_year==>' + ku_year);
	console.log('ku_year1==>' + ku_year1);
	console.log('ku_year2==>' + ku_year2);
	console.log('ku_year3==>' + ku_year3);
	console.log('ku_year_before==>' + ku_year_before);
	console.log('ku_nextYear==>' + ku_nextYear);
	console.log('ku_year==t>' + typeof ku_year)
	console.log('ku_year_before==t>' + typeof ku_year_before)
	var ku_mar = '-03';
	var ku_feb = '-02';
	console.log('ku_mar==>' + ku_mar);
	console.log('ku_feb==>' + ku_feb);
	var ku_year_beforeMar = ku_year_before + ku_mar;
	var ku_year3Feb = ku_year3 + ku_feb;
	var ku_year3Mar = ku_year3 + ku_mar;
	var ku_year2Feb = ku_year2 + ku_feb;
	var ku_year2Mar = ku_year2 + ku_mar;
	var ku_year1Feb = ku_year1 + ku_feb;
	var ku_year1Mar = ku_year1 + ku_mar;
	var ku_yearFeb = ku_year + ku_feb;
	var ku_yearMar = ku_year + ku_mar;
	var ku_nextYearFeb = ku_nextYear + ku_feb;


	console.log("ku_year_beforeMar==>" + ku_year_beforeMar);
	console.log("ku_year3Feb==>" + ku_year3Feb);
	console.log("ku_year3Mar==>" + ku_year3Mar);
	console.log("ku_year2Feb==>" + ku_year2Feb);
	console.log("ku_year2Mar==>" + ku_year2Mar);
	console.log("ku_year1Feb==>" + ku_year1Feb);
	console.log("ku_year1Mar==>" + ku_year1Mar);
	console.log("ku_yearFeb==>" + ku_yearFeb);
	console.log("ku_yearMar==>" + ku_yearMar);
	console.log("ku_nextYearFeb==>" + ku_nextYearFeb);

	var ku_select = "B_TCO2";//req.body.select;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		//let query = "select * from Data_KU where BID = ?";
		//let query = "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 4) between ? and ? group by substring(dFixtureDate,1, 4) order by substring(dFixtureDate,1, 4)";
		//let query = "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 4) between ? and ? ";
		//query +="group by substring(dFixtureDate,1, 4) "; 
		//query +="order by substring(dFixtureDate,1, 4)";
		let query = "select tbl2.years, tbl2.price from ( ";
		query += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.price) as price from ( ";
		query += "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query += "group by substring(dFixtureDate,1, 4)) tbl ";
		query += "union all ";
		query += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.price) as price from ( ";
		query += "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query += "group by substring(dFixtureDate,1, 4)) tbl ";
		query += "union all ";
		query += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.price) as price from ( ";
		query += "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query += "group by substring(dFixtureDate,1, 4)) tbl ";
		query += "union all ";
		query += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.price) as price from ( ";
		query += "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query += "group by substring(dFixtureDate,1, 4)) tbl ";
		query += "union all ";
		query += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.price) as price from ( ";
		query += "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query += "group by substring(dFixtureDate,1, 4)) tbl ) tbl2";


		//let query2 = "select * from carbon_month where YEAR = ?";
		//let query2 = "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 4) between ? and ? ";
		//query2 +="group by substring(dFixtureDate,1, 4) ";
		//query2 +="order by substring(dFixtureDate,1, 4)";
		let query2 = "select tbl2.years, tbl2.count from ( ";
		query2 += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.count) as count from ( ";
		query2 += "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query2 += "group by substring(dFixtureDate,1, 4)) tbl ";
		query2 += "union all ";
		query2 += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.count) as count from ( ";
		query2 += "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query2 += "group by substring(dFixtureDate,1, 4)) tbl ";
		query2 += "union all ";
		query2 += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.count) as count from ( ";
		query2 += "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query2 += "group by substring(dFixtureDate,1, 4)) tbl ";
		query2 += "union all ";
		query2 += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.count) as count from ( ";
		query2 += "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query2 += "group by substring(dFixtureDate,1, 4)) tbl ";
		query2 += "union all ";
		query2 += "select SUBSTRING_INDEX(?, '-',1) as years, sum(tbl.count) as count from ( ";
		query2 += "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query2 += "group by substring(dFixtureDate,1, 4)) tbl ) tbl2";

		//connection.query(query, [ku_year_before, ku_year], (error, response) => {
		//connection.query(query, [ku_year_before,ku_year_before,ku_year3,ku_year3,ku_year3,ku_year2,ku_year2,ku_year2,ku_year1,ku_year1,ku_year1,ku_year,ku_year,ku_year,ku_nextYear], (error, response) => {
		connection.query(query, [ku_year_beforeMar, ku_year_beforeMar, ku_year3Feb, ku_year3Mar, ku_year3Mar, ku_year2Feb, ku_year2Mar, ku_year2Mar, ku_year1Feb, ku_year1Mar, ku_year1Mar, ku_yearFeb, ku_yearMar, ku_yearMar, ku_nextYearFeb], (error, response) => {
			console.log('response==>' + JSON.stringify(response));
			var obj = JSON.parse(JSON.stringify(response));

			//connection.query(query2, [ku_year, ku_select], (error, response) => {
			//	var obj2 = JSON.parse(JSON.stringify(response));
			//connection.query(query2, [ku_year_before, ku_year], (error, response) => {
			connection.query(query2, [ku_year_beforeMar, ku_year_beforeMar, ku_year3Feb, ku_year3Mar, ku_year3Mar, ku_year2Feb, ku_year2Mar, ku_year2Mar, ku_year1Feb, ku_year1Mar, ku_year1Mar, ku_yearFeb, ku_yearMar, ku_yearMar, ku_nextYearFeb], (error, response) => {
				console.log('response2==>' + JSON.stringify(response));
				var obj2 = JSON.parse(JSON.stringify(response));

				res.send({ list_data: obj, list_data2: obj2 });
			});


		});
	});
});

app.post('/getFixture2', async function (req, res) {
	console.log("getFixture2 start!!");
	var ku_year = req.body.year;
	var ku_year_before = ku_year - 4;
	var ku_lastYear = ku_year - 1;
	console.log('ku_year==>' + ku_year);
	console.log('ku_year_before==>' + ku_year_before);
	console.log('ku_lastYear==>' + ku_lastYear);
	console.log('ku_year==t>' + typeof ku_year)
	console.log('ku_year_before==t>' + typeof ku_year_before)
	var ku_year2 = ku_year + '-02';
	var ku_lastYear2 = ku_lastYear + '-03';
	console.log('ku_year2==>' + ku_year2);
	console.log('ku_lastYear2==>' + ku_lastYear2);
	var dat0 = req.body.dat0;
	var dat2 = req.body.dat2;
	console.log('dat0==>' + dat0);
	console.log(typeof dat0);
	console.log('dat2==>' + dat2);
	console.log(typeof dat2);

	var ku_select = "B_TCO2";//req.body.select;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query3 = "select ";
		query3 += "years, ";
		query3 += "price, ";
		query3 += "(@sum_pri:=@sum_pri+price) as sum_pri ";
		query3 += "from  ";
		query3 += "(select substring(dFixtureDate,1, 7) as years ";
		query3 += ", sum(sFixturePrice) as price  ";
		query3 += "from tblFixture ";
		query3 += "where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query3 += "group by substring(dFixtureDate,1, 7) ";
		query3 += "order by substring(dFixtureDate,1, 7)) tbl, (select @sum_pri:=0) x";

		let query4 = "select ";
		query4 += "years, ";
		query4 += "cnt, ";
		query4 += "(@sum_cnt:=@sum_cnt+cnt) as sum_cnt ";
		query4 += "from  ";
		query4 += "(select substring(dFixtureDate,1, 7) as years ";
		query4 += ", count(sFixtureNo) as cnt  ";
		query4 += "from tblFixture ";
		query4 += "where substring(dFixtureDate,1, 7) between ? and ? and sFixtureStatus = '사용' ";
		query4 += "group by substring(dFixtureDate,1, 7) ";
		query4 += "order by substring(dFixtureDate,1, 7)) tbl2, (select @sum_cnt:=0) x";

		connection.query(query3, [dat0, dat2], (error, response) => {
			console.log('response3==>' + JSON.stringify(response));
			var obj3 = JSON.parse(JSON.stringify(response));

			connection.query(query4, [dat0, dat2], (error, response) => {
				console.log('response4==>' + JSON.stringify(response));
				var obj4 = JSON.parse(JSON.stringify(response));

				res.send({
					list_data3: obj3,
					list_data4: obj4
				});
			});
		});
	});
});

app.post('/getFixture3', async function (req, res) {
	console.log("getFixture3 start!!");
	var ku_year = req.body.year;
	var ku_nextYear = ku_year + 1;
	var ku_mar = '-03';
	var ku_feb = '-02';

	var ku_yearMar = ku_year + ku_mar;
	var ku_nextYearFeb = ku_nextYear + ku_feb;

	console.log('ku_year==>' + ku_year);
	console.log('ku_nextYear==>' + ku_nextYear);
	console.log('ku_year==t>' + typeof ku_year);
	console.log('ku_nextYear==t>' + typeof ku_nextYear);
	console.log('ku_yearMar==>' + ku_yearMar);
	console.log('ku_nextYearFeb==>' + ku_nextYearFeb);
	console.log('ku_yearMar==>' + typeof ku_yearMar);
	console.log('ku_nextYearFeb==>' + typeof ku_nextYearFeb);

	var ku_select = "B_TCO2";//req.body.select;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		//let query = "select * from Data_KU where BID = ?";
		//let query = "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 4) between ? and ? group by substring(dFixtureDate,1, 4) order by substring(dFixtureDate,1, 4)";
		//let query = "select substring(dFixtureDate,1, 4) as years, sum(sFixturePrice) as price from tblFixture  where substring(dFixtureDate,1, 4) between ? and ? ";
		//query +="group by substring(dFixtureDate,1, 4) "; 
		//query +="order by substring(dFixtureDate,1, 4)";

		////let query2 = "select * from carbon_month where YEAR = ?";
		//let query2 = "select substring(dFixtureDate,1, 4) as years, count(sFixtureNo) as count from tblFixture  where substring(dFixtureDate,1, 4) between ? and ? ";
		//query2 +="group by substring(dFixtureDate,1, 4) ";
		//query2 +="order by substring(dFixtureDate,1, 4)";
		/*
		let query = "SELECT";
		query +="    orgs.sOrg,";
		query +="   COALESCE(SUM(tblFixture.sFixturePrice), 0) AS price,";
		query +="   COALESCE(COUNT(tblFixture.sFixtureNo), 0) AS count";
		query +=" FROM";
		query +="   (SELECT '경영대학' AS sOrg";
		query +="    UNION ALL SELECT '교수학습개발원'";
		query +="    UNION ALL SELECT '관리처'";
		query +="    UNION ALL SELECT '심리학부'";
		query +="    UNION ALL SELECT '문과대학'";
		query +="    UNION ALL SELECT '교무처'";
		query +="    UNION ALL SELECT '미디어학부'";
		query +="    UNION ALL SELECT '기타') AS orgs";
		query +=" LEFT JOIN tblFixture ON";
		query +="   CASE";
		query +="     WHEN orgs.sOrg = '경영대학' AND tblFixture.sOrg IN ('경영대학학사지원부','경영대학행정팀','경영대학-어학실습실') THEN TRUE";
		query +="     WHEN orgs.sOrg = '교수학습개발원' AND tblFixture.sOrg IN ('교수학습개발원 ','교수의회','교수학습지원팀') THEN TRUE";
		query +="     WHEN orgs.sOrg = '관리처' AND tblFixture.sOrg IN ('관리처','관리팀','과학정보관리부','안암학사관리운영팀','입학관리팀','테크노콤플렉스기획관리팀','학술정보관리부','입학전형관리실','농장기획관리팀','안전관리팀','방사선안전관리센터','입학전형관리팀','시설관리팀','건축사업관리팀') THEN TRUE";
		query +="     WHEN orgs.sOrg = '심리학부' AND tblFixture.sOrg IN ('심리학과','심리학부행정팀','심리학과행정실','4단계 BK21 심리학교육연구단') THEN TRUE";
		query +="     WHEN orgs.sOrg = '문과대학' AND tblFixture.sOrg IN ('문과대학학사지원부','문과대학행정팀','문과대학') THEN TRUE";
		query +="     WHEN orgs.sOrg = '교무처' AND tblFixture.sOrg IN ('교무지원부','교무기획팀','교무팀','교무지원팀') THEN TRUE";
		query +="     WHEN orgs.sOrg = '미디어학부' AND tblFixture.sOrg IN ('미디어학부·언론대학원학사지원부', '미디어학부행정팀', '미디어학부','미디어대학원행정팀','4단계 BK21 미디어학교육연구단') THEN TRUE";
		query +="     WHEN orgs.sOrg = '기타' AND tblFixture.sOrg NOT IN ('경영대학학사지원부','경영대학행정팀','경영대학-어학실습실','교수학습개발원 ','교수의회','교수학습지원팀','관리처','관리팀','심리학과','심리학부행정팀','심리학과행정실','4단계 BK21 심리학교육연구단','문과대학학사지원부','문과대학행정팀','문과대학','교무지원부','교무기획팀','교무팀','교무지원팀','미디어학부·언론대학원학사지원부', '미디어학부행정팀', '미디어학부','미디어대학원행정팀','4단계 BK21 미디어학교육연구단') THEN TRUE";
		query +="     ELSE FALSE";
		query +="   END";
		//query +="   AND SUBSTRING(tblFixture.dFixtureDate, 1, 4) = ?";
		query +="   AND SUBSTRING(tblFixture.dFixtureDate, 1, 7) between ? and ? ";
		query +="   AND tblFixture.sFixtureStatus = '사용' ";
		query +=" GROUP BY orgs.sOrg";
		query +=" ORDER BY orgs.sOrg;";*/

		let query = "select * from (";
		query += " SELECT ";
		query += " '교수학습개발원' as sOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (SELECT distinct sName FROM tblOrganization WHERE nIndex=7 or nRootIndex=7 ) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '교양교육원' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (SELECT distinct sName FROM tblOrganization WHERE nIndex=6 or nRootIndex=6) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '기타기관' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (SELECT distinct sName FROM tblOrganization WHERE nIndex=5 or nRootIndex=5) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '대학' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (select distinct sName from (";
		query += " 	SELECT * FROM tblOrganization WHERE nIndex=1 or nRootIndex=1";
		query += " 	union all";
		query += " 	SELECT * FROM tblOrganization WHERE nRootIndex in (20,9,11,13,22,16,14,12,19,10,25,15,24,18,23,17,21)";
		query += " 	union all";
		query += " 	SELECT * FROM tblOrganization WHERE nRootIndex in (140,152,159,141,142,69,58,118,135,125,144,77,91,131,130,129,128,97,110,108,96,63,59,78,60,126,86,87,151,71,133,114,136,154,103,101,98,84,138,70,81,115,92,94,93,149,123,127,139,155,68,62,65,95,132,148,161,100,89,61,106,64,66,157,111,102,134,72,74,146,83,112,124,90,153,113,156,85,117,143,99,145,80,120,122,160,147,82,105,79,150,88,119,121,67,107,104,73,137,116,109,158)";
		query += " 	) tbl1 ";
		query += " ) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '본부' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (";
		query += " 	select distinct sName from (";
		query += " 	SELECT * FROM tblOrganization WHERE nIndex=2 or nRootIndex=2  ";
		query += " 	union all";
		query += " 	SELECT * FROM tblOrganization WHERE nRootIndex in (";
		query += " 	31,26,33,28,32,29,27,30";
		query += " 	) ) tbl2 ";
		query += " ) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '부속교육기관' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (";
		query += " 	select distinct sName from (";
		query += " 	SELECT * FROM tblOrganization WHERE nIndex=4 or nRootIndex=4 ";
		query += " 	union all";
		query += " 	SELECT * FROM tblOrganization WHERE nRootIndex in (47,48,49) ) tbl4   ";
		query += " ) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '부속기관' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (";
		query += " 	select distinct sName from (";
		query += " 	SELECT * FROM tblOrganization WHERE nIndex=3 or nRootIndex=3 ";
		query += " 	union all";
		query += " 	SELECT * FROM tblOrganization WHERE nRootIndex in (40,46,38,42,34,39,41,44,35,36,45,37,43) ";
		query += " 	union all";
		query += " 	SELECT * FROM tblOrganization WHERE nRootIndex in (197,194,196,193,190,191,195,198,192,199) )tbl3";
		query += " ) and sFixtureStatus='사용' ";
		query += " UNION ALL";
		query += " SELECT ";
		query += " '사회공헌원' as sUserOrg,";
		query += " COALESCE(SUM(sFixturePrice), 0) AS price,";
		query += " COALESCE(COUNT(sFixtureNo), 0) AS count";
		query += " from tblFixture where SUBSTRING(dFixtureDate, 1, 7) between ? and ? and  sUserOrg IN (SELECT distinct sName FROM tblOrganization WHERE nIndex=8  or nRootIndex=8) and sFixtureStatus='사용') org";
		query += " order by price desc		";

		connection.query(query, [ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb], (error, response) => {
			console.log('response==>' + JSON.stringify(response));
			var obj = JSON.parse(JSON.stringify(response));

			res.send({ list_data: obj });
			////connection.query(query2, [ku_year, ku_select], (error, response) => {
			////	var obj2 = JSON.parse(JSON.stringify(response));
			//connection.query(query2, [ku_year_before, ku_year], (error, response) => {
			//	console.log('response2==>'+JSON.stringify(response));
			//	var obj2 = JSON.parse(JSON.stringify(response));

			//	res.send({ list_data: obj, list_data2: obj2 });
			//});


		});
	});
});

app.post('/getFixture4', async function (req, res) {
	console.log("getFixture4 start!!");
	var ku_year = req.body.year;
	var ku_nextYear = ku_year + 1;
	var ku_mar = '-03';
	var ku_feb = '-02';

	var ku_yearMar = ku_year + ku_mar;
	var ku_nextYearFeb = ku_nextYear + ku_feb;

	console.log('ku_year==>' + ku_year);
	console.log('ku_nextYear==>' + ku_nextYear);
	console.log('ku_year==t>' + typeof ku_year);
	console.log('ku_nextYear==t>' + typeof ku_nextYear);
	console.log('ku_yearMar==>' + ku_yearMar);
	console.log('ku_nextYearFeb==>' + ku_nextYearFeb);
	console.log('ku_yearMar==>' + typeof ku_yearMar);
	console.log('ku_nextYearFeb==>' + typeof ku_nextYearFeb);

	var ku_select = "B_TCO2";//req.body.select;

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query = "SELECT";
		query += "   amount.amountRange,";
		query += "   COUNT(tblFixture.sFixtureNo) AS count,";
		//query +="   ROUND(COUNT(tblFixture.sFixtureNo) / (select COUNT(sFixtureNo) from tblFixture where SUBSTRING(tblFixture.dFixtureDate, 1, 4) = ? ) * 100, 2) AS cnt_ratio";
		// tblFixture.sFixtureStatus = '사용' 일경우 tblFixture.sFixturePrice null 이나 '' 이 없었음, ''은 현재 없었음 
		//query +="   ROUND(COUNT(tblFixture.sFixtureNo) / (select COUNT(sFixtureNo) from tblFixture where (SUBSTRING(tblFixture.dFixtureDate, 1, 7) between ? and ? ) and (tblFixture.sFixturePrice is not null or  tblFixture.sFixturePrice <> '') ) * 100, 2) AS cnt_ratio";		
		query += "   ROUND(COUNT(tblFixture.sFixtureNo) / (select COUNT(sFixtureNo) from tblFixture where (SUBSTRING(tblFixture.dFixtureDate, 1, 7) between ? and ? ) and  tblFixture.sFixtureStatus = '사용') * 100, 2) AS cnt_ratio";
		query += " FROM ";
		query += "   (SELECT '0' AS amountRange";
		query += "    UNION ALL SELECT '1'";
		query += "    UNION ALL SELECT '2'";
		query += "    UNION ALL SELECT '3'";
		query += "    UNION ALL SELECT '4'";
		query += "    UNION ALL SELECT '5') AS amount";
		//query +="    UNION ALL SELECT '금액미등록') AS amount";
		query += " LEFT JOIN tblFixture ON ";
		query += "   CASE";
		query += " 	WHEN amount.amountRange = '0' AND tblFixture.sFixturePrice between 0 and 499999 THEN TRUE";
		query += "     WHEN amount.amountRange = '1' AND tblFixture.sFixturePrice between 500000 and 999999 THEN TRUE";
		query += "     WHEN amount.amountRange = '2' AND tblFixture.sFixturePrice between 1000000 and 1999999 THEN TRUE";
		query += "     WHEN amount.amountRange = '3' AND tblFixture.sFixturePrice between 2000000 and 4999999 THEN TRUE";
		query += "     WHEN amount.amountRange = '4' AND tblFixture.sFixturePrice between 5000000 and 9999999 THEN TRUE";
		query += "     WHEN amount.amountRange = '5' AND tblFixture.sFixturePrice >= 10000000 THEN TRUE";
		//query +="     WHEN amount.amountRange = '금액미등록' AND (tblFixture.sFixturePrice is null or  tblFixture.sFixturePrice = '') THEN TRUE";
		query += "     ELSE FALSE";
		query += "   END";
		//query +="   AND SUBSTRING(tblFixture.dFixtureDate, 1, 4) = ? ";
		query += "   AND SUBSTRING(tblFixture.dFixtureDate, 1, 7) between ? and ? ";
		//query +="   AND (tblFixture.sFixturePrice is not null or  tblFixture.sFixturePrice <> '') ";
		query += " AND tblFixture.sFixtureStatus = '사용' ";
		query += " GROUP BY amount.amountRange ";
		query += " ORDER BY amount.amountRange asc;";

		//connection.query(query, [ku_year, ku_year], (error, response) => {
		connection.query(query, [ku_yearMar, ku_nextYearFeb, ku_yearMar, ku_nextYearFeb], (error, response) => {
			console.log('response==>' + JSON.stringify(response));
			var obj = JSON.parse(JSON.stringify(response));

			res.send({ list_data: obj });
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
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let query_new = "select * from Data_KU where BID = ?";
		let query_new2 = "select * from Data_KU where YEAR = ? and BID = ?";

		connection.query(query_new, [select_ELEC], (error, response) => {
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

app.post('/getKUFee', async function (req, res) {

	var ku_year = req.body.year;
	var ku_prev = ku_year - 1;
	var ku_two_year_ago = ku_year - 2;
	var ku_three_year_ago = ku_year - 3;
	var select_ELEC = 'B_FEE_ELEC';
	var select_WATER = 'B_FEE_WATER';
	var select_GAS = 'B_FEE_GAS';

	console.log("ku_year", ku_year);

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': 'kouno1234',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		let sql_query = "select * from Data_KU where YEAR = ? and BID = ?";
		const testSql = 'select * from Data_KU where YEAR in (2023,2022,2021) and BID in ("B_FEE_ELEC","B_FEE_WATER","B_FEE_GAS") ORDER BY `YEAR`' //결과물은 같게 나옴. 결과물 순서가 문제

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
															list_FEE_ELEC: obj,
															list_PREV_FEE_ELEC: obj2,
															list_FEE_WATER: obj3,
															list_PREV_FEE_WATER: obj4,
															list_FEE_GAS: obj5,
															list_PREV_FEE_GAS: obj6,
															list_TWO_YEAR_AGO_FEE_ELEC: obj7,
															list_TWO_YEAR_AGO_FEE_WATER: obj8,
															list_TWO_YEAR_AGO_FEE_GAS: obj9,
															list_THREE_YEAR_AGO_FEE_ELEC: obj10,
															list_THREE_YEAR_AGO_FEE_WATER: obj11,
															list_THREE_YEAR_AGO_FEE_GAS: obj12,
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


app.post('/getKUFeeTracking', async function (req, res) {

	var ku_year = req.body.year;
	// var ku_prev = ku_year - 1;
	// var ku_two_year_ago = ku_year - 2;
	// var ku_three_year_ago = ku_year - 3;
	var select_ELEC = 'B_FEE_ELEC';
	var select_WATER = 'B_FEE_WATER';
	var select_GAS = 'B_FEE_GAS';

	console.log("ku_year", ku_year);

	const pool = mysql.createPool({
		connectionLimit: 250, //connectionLimit 필드의 기본 값은 10이다.
		connectTimeout: 30000,
		'host': '127.0.0.1',
		'user': 'root',
		// 'password': 'kouno1234',
		'password': '!kouno0815',
		'database': 'carbonKU'
	});

	pool.getConnection((error, connection) => {  // getConnection -> 커넥션 풀에서 커넥션 가져오

		// let sql_query = "select * from Data_KU where YEAR = ? and BID = ?";
		let query_new = "select * from Data_KU where BID = ?";
		let query_new2 = "select * from Data_KU where YEAR = ? and BID = ?";

		// const testSql = 'select * from Data_KU where YEAR in (2023,2022,2021) and BID in ("B_FEE_ELEC","B_FEE_WATER","B_FEE_GAS") ORDER BY `YEAR`' //결과물은 같게 나옴. 결과물 순서가 문제
		connection.query(query_new, [select_ELEC], (error, response) => {
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

								res.send({ list_FEE_ELEC: obj, list_FEE_YEAR_ELEC: obj2, list_FEE_WATER: obj3, list_FEE_YEAR_WATER: obj4, list_FEE_GAS: obj5, list_FEE_YEAR_GAS: obj6 });
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
	console.log("app.get('/space' start!!");
	var build = 4;
	//var room = 67;
	var nstart = 0;

	var build_all = 1;
	var category = 110;

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_all_info = await directQuery(sql, [build_all]); //모든 건물 불러오기(가장 좌측 드롭박스)

	const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory !=? AND sCatagory!="" ORDER BY nIndex;';
	const rooms = await directQuery(roomsSql, [build_all_info[0].nIndex, category]);
	const roomsInitData = rooms[0];

	sql = 'SELECT * FROM tblBuild WHERE sCatagory!=? and sCatagory!="" limit 1;';

	var room_info = await directQuery(sql, [category]);

	sql = 'SELECT * FROM tblBuild WHERE nIndex= ? ;';
	var build_select_info = await directQuery(sql, [roomsInitData.nRootIndex]);

	// 강의실 정보 가져오기
	/*
	var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
	sql += 'FROM tblBuild a,tblDevice b ';
	sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
	*/
	sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
	sql += 'FROM tblFixture ';
	sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

	var res_room = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID]);
	var total = res_room.length;
	sql += 'LIMIT 10 OFFSET ?;';
	var rinfos = await directQuery(sql, [roomsInitData.sBuildID, roomsInitData.sRoomID, Number(nstart * 10)]);

	var start_page = nstart - (nstart % 10);
	//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
	var end_page = total / 10;

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
		'build': roomsInitData.nRootIndex,
		'room': roomsInitData.nIndex,
		'roomID': roomsInitData.sRoomID,
		'roomName': roomsInitData.sName
	};

	const changedRinfos = rinfos.map((data) => {
		if (data.dFixtureDate === undefined) {
			return data;
		}
		const kmtDate = new Date(data.dFixtureDate);
		const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
		return { ...data, dFixtureDate: correctDate }
	})
	res.render("sub_space", { page_data: page_data, lists: build_all_info, rinfos: changedRinfos, room_info: rooms });
});

app.post('/space', async function (req, res) {
	console.log("app.post('/space' start!!");

	var build = 4;
	var room = 67;
	var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	build = req.body.build;
	room = req.body.room;
	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var room_info = [];

	/*
	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery (sql, [build]);

	if(room == "0")
	{
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		room_info = await directQuery (sql, [room]);
	}
	else
	{
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		room_info = await directQuery (sql, [room]);
	}
	*/

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and sCatagory!="110" and sCatagory!="";';
	var room_info = await directQuery(sql, [build]);
	console.log(room_info[0])
	if (room_info.length == 0) {
		var rinfos = [];

		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;

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

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rooms: room, rinfos: changedRinfos, room_info: room_info });
	}
	else {
		// 강의실 정보 가져오기
		/*
		var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
		sql += 'FROM tblBuild a,tblDevice b ';
		sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
		*/
		//sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql = 'SELECT sRoom room, sRoomNo roomno,sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT 10 OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * plimit)]);
		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;
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
			'build': room_info[0].nRootIndex,
			'room': room_info[0].nIndex,
			'roomID': room_info[0].sRoomID,
			'roomName': room_info[0].sName
		};

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})

		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rooms: room, rinfos: changedRinfos, room_info: room_info });
	}
});

app.post('/space_room', async function (req, res) {

	var build = 4;
	var room = 67;
	var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	build = req.body.build;
	room = req.body.room;
	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var room_info = [];

	/*
	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_info = await directQuery (sql, [build]);

	if(room == "0")
	{
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		room_info = await directQuery (sql, [room]);
	}
	else
	{
		sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
		room_info = await directQuery (sql, [room]);
	}
	*/

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and nIndex=? and sCatagory!="110" and sCatagory!="";';
	var room_info = await directQuery(sql, [build, room]);

	if (room_info.length == 0) {
		var rinfos = [];

		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;

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

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rooms: room, rinfos: changedRinfos, room_info: room_info });
	}
	else {
		// 강의실 정보 가져오기
		/*
		var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
		sql += 'FROM tblBuild a,tblDevice b ';
		sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
		*/
		//sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		//sql += 'FROM tblFixture ';
		//sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		sql = 'SELECT sBuild build, sRoom room, sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		var res_room = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT 10 OFFSET ?;';
		var rinfos = await directQuery(sql, [room_info[0].sBuildID, room_info[0].sRoomID, Number(nstart * plimit)]);
		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;
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
			'roomID': room_info[0].sRoomID,
			'roomNm': room_info[0].sName
		};

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rooms: room, rinfos: changedRinfos, room_info: room_info });
	}
});

app.post('/space_page', async function (req, res) {
	var build = 4;
	var room = 67;
	var nstart = 0;
	var pmode = 0;
	var plimit = 10;

	build = req.body.build;
	room = req.body.room;
	nstart = req.body.nstart;

	pmode = parseInt(req.body.pmode);

	if (pmode == 0) {
		plimit = 10;
	}
	else if (pmode == 1) {
		plimit = 20;
	}
	else if (pmode == 2) {
		plimit = 50;
	}

	var room_info = [];

	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? and sCatagory!="110" and sCatagory!="";';
	var room_info = await directQuery(sql, [build]);

	if (room_info.length == 0) {
		var rinfos = [];

		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;

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

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rooms: room, rinfos: changedRinfos, room_info: room_info });
	}
	else {
		// 강의실 정보 가져오기
		/*
		var sql = 'SELECT a.sName name,b.nIndex dindex,b.sType type,b.sList list,b.sMaker maker,b.sModel model,b.sStatus status ';
		sql += 'FROM tblBuild a,tblDevice b ';
		sql += 'WHERE a.nIndex=b.nRoomIndex AND b.nRoomIndex=?;';
		*/
		//sql = 'SELECT sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql = 'SELECT sRoom room, sRoomNo roomno, sFixtureType type,sFixtureName name,sFixtureNo no,sFixtureModel model,sFixtureMaker maker,sFixturePrice price,dFixtureDate date,sUserOrg org,sUser user ';
		sql += 'FROM tblFixture ';
		sql += 'WHERE sBuildNo=? AND sRoomNo=? AND sFixtureStatus="사용" ';

		const filteredRoom = room_info.filter((roomData) => { return roomData.nIndex === room })
		var res_room = await directQuery(sql, [filteredRoom[0].sBuildID, filteredRoom[0].sRoomID]);
		var total = res_room.length;
		sql += 'LIMIT ? OFFSET ?;';
		var rinfos = await directQuery(sql, [filteredRoom[0].sBuildID, filteredRoom[0].sRoomID, plimit, Number(nstart * plimit)]);
		var start_page = nstart - (nstart % 10);
		//var end_page = (total >= (start_page + 10) * 10 ? (start_page + 10) : ((total - (total % 10)) / 10 + 1));
		var end_page = total / plimit;
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
			'roomID': filteredRoom[0].sRoomID
		};

		const changedRinfos = rinfos.map((data) => {
			if (data.dFixtureDate === undefined) {
				return data;
			}
			const kmtDate = new Date(data.dFixtureDate);
			const correctDate = new Date(kmtDate.setHours(kmtDate.getHours(data.dFixtureDate) + 9)).toISOString();
			return { ...data, dFixtureDate: correctDate }
		})
		res.send({ idx: req.session.user.name, uname: req.session.user.name, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, modex: req.session.mode, page_data: page_data, rooms: room, rinfos: changedRinfos, room_info: room_info });
	}
});

// 임시로 추가 한 코드입니다. 나중에 수정 할 코드입니다. 결재 시스템 관련 코드입니다.
app.get('/approval_system', session_exists, async function (req, res) {
	var user_idx = req.session.user.userid;

	if (user_idx != req.session.user.selectAuithority) {
		user_idx = req.session.user.selectAuithority;
	}

	var user_mail = req.session.user.email;
	var user_phone = req.session.user.tel;

	var tsql = "SELECT count(*) as tot FROM tblFixture WHERE sUserNo=? AND (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	tsql += "AND (sPublic='개인' or sPublic='')";

	var res_total = await directQuery(tsql, [user_idx]);

	var total = res_total[0].tot;

	var sql = "SELECT * FROM tblFixture WHERE sUserNo=? AND (sFixtureStatus='사용' or sFixtureStatus='불용') ";
	sql += "AND (sPublic='개인' or sPublic='')";
	sql += " LIMIT 10 OFFSET ?;";

	var nStart = 0;

	var pinfos = await directQuery(sql, [user_idx, Number(nStart * 10)]);

	var start_page = nStart - (nStart % 10);
	var end_page = total / 10;
	var page_data = {
		'name': req.session.user.name,
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': total
	};

	console.log('total', total);

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

	res.render("approval_system", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, pinfos: pinfos, page_data: page_data, user_mail: user_mail, user_phone: user_phone, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/approval_box', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");
	}
	*/

	var user_idx = req.session.user.userid;
	var user_mail = req.session.user.email;
	var user_phone = req.session.user.tel;
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	var tsql = "SELECT count(*) as tot FROM tblApproval";

	var res_total = await directQuery(tsql, [user_idx]);

	var total = res_total[0].tot;

	sql = "SELECT * FROM tblApproval";
	var approval_list = await directQuery(sql);

	var fix_list = [];

	for (var appoval_idx = 0; appoval_idx < approval_list.length; appoval_idx++) {
		sql = "SELECT * FROM tblFixture WHERE sFixtureNo=?";
		var fix_info = await directQuery(sql, [approval_list[appoval_idx].sFixtureNo]);
		fix_info[0].nReusableRank = approval_list[appoval_idx].nReusableRank;

		fix_list.push(fix_info[0]);
	}

	res.render("approval_box", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, total: total, user_mail: user_mail, user_phone: user_phone, authority_list: authority_list, sel_authority: req.session.user.selectAuithority, approval_list: approval_list, fix_list: fix_list });
});

app.get('/approval_main', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("approval_main", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/approval_employeeLlist', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("approval_employeeLlist", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/applicationForm', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");pm2 restart KUcarbon
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("applicationForm", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/approverForm', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");pm2 restart KUcarbon
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("approverForm", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.get('/approval_request', session_exists, async function (req, res) {
	/*
	if (req.session.user == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid == undefined) {
		res.redirect("login");
	}
	else if (req.session.user.userid && req.session.user.userid != '') {
		res.render("index", { idx: req.session.user.name, session: req.session, userid: req.session.user.userid });
	}
	else {
		res.redirect("login");pm2 restart KUcarbon
	}
	*/

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("approval_request", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, orgIdx: req.session.user.orgIdx, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});

app.post('/approvalDetail', async function (req, res) {
	var appr_idx = -1;
	if (req.body) {
		appr_idx = req.body.apprIdx;
	}
	// 승인 정보 조회 (제목, 요청일자, 내용 등)
	var sql = "SELECT * FROM tblApproval WHERE nIndex=?";
	var approval_info = await directQuery(sql, [appr_idx]);

	// 결재자 조회 – tblApprover에서 nApprIdx가 같은 승인자들을 nApprOrder 오름차순으로 정렬
	sql = "SELECT * FROM tblApprover WHERE nApprIdx=? ORDER BY nApprOrder ASC";
	var approver_list = await directQuery(sql, [appr_idx]);

	// 물품 상세 정보 조회 
	// – tblReusable의 기본키는 nReusableNo이므로 해당 컬럼으로 조회
	sql = "SELECT * FROM tblReusable WHERE nReusableNo=?";
	var fix_info = await directQuery(sql, [approval_info[0].nReusableNo]);

	res.send({ approval_info: approval_info, approver_list: approver_list, fix_info: fix_info });
});

app.post('/approvalCollect', async function (req, res) {
	var appr_idx = -1;

	if (req.body) {
		appr_idx = req.body.apprIdx;
	}

	var sql = "SELECT * FROM tblApproval WHERE nIndex=?";
	var approval_info = await directQuery(sql, [appr_idx]);

	sql = "SELECT * FROM tblApprover WHERE nApprIdx=?";
	var approver_list = await directQuery(sql, [appr_idx]);
});

app.post('/approver_list', async function (req, res) {
	var org_idx = 1;

	if (req.body.data) {
		var json = JSON.parse(req.body.data);
		org_idx = json.orgIdx;
	}

	var sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex and a.sPortal!="" and a.nStdType=1';
	var approver_list = await directQuery(sql);

	res.send({ approver_list: approver_list });
});

app.post('/approver_search', async function (req, res) {
	var search_idx = -1;
	var search_value = "";

	console.log("req.body", req.body);

	if (req.body) {
		search_idx = req.body.searchIdx;
		search_value = req.body.searchValue;
	}

	search_value = "%" + search_value + "%";

	var sql = 'SELECT distinct(b.sName) org, a.sPortal portal, a.sEmail email, a.sTel tel, a.sNumber employeeNum, a.sName name ';
	sql += 'FROM tblUser a,tblOrganization b ';
	sql += 'WHERE a.nOrgIdx=b.nIndex AND a.sPortal!="" AND a.nStdType=1 ';

	console.log("search_idx", search_idx);

	switch (parseInt(search_idx)) {
		case 0: sql += 'AND a.sPortal LIKE ? '; break; // 포털아이디
		case 1: sql += 'AND a.sNumber LIKE ? '; break; // 교직원번호
		case 2: sql += 'AND a.sName LIKE ? '; break; // 이름
		case 3: sql += 'AND b.sName LIKE ? '; break; // 소속부서
		case 4: sql += 'AND a.sEmail LIKE ? '; break; // 이메일
		case 5: sql += 'AND a.sTel LIKE ? '; break; // 연락처
	}

	var approver_list = await directQuery(sql, [search_value]);

	res.send({ approver_list: approver_list });
});

app.post('/approval_request', async function (req, res) {
	var approval_title = "";
	var approval_date = "";
	var approval_memo = "";
	var fix_list = [];
	var approver_list = [];

	if (req.body) {
		approval_title = req.body.title;
		approval_date = req.body.date;
		approval_memo = req.body.memo;
		fix_list = req.body.fixItem;
		approver_list = req.body.approvalList;
	}

	//console.log(fix_list[0]);
	//console.log(approver_list[0]);

	var sql = "";

	var user_no = req.session.user.userid;
	var user_name = req.session.user.name;
	var user_org = req.session.user.class;
	var user_email = req.session.user.email;

	sql = "SELECT sPortal FROM tblUser WHERE sNumber=?";
	var user_info = await directQuery(sql, [user_no]);

	for (var fix_id = 0; fix_id < fix_list.length; fix_id++) {
		sql = 'INSERT INTO tblApproval(sFixtureNo,sApprovalTitle,dApprovalDate,sApprovalReason,sFixtureName,sBuild,sRoomNo,sFixturePrice,nReusableRank,nApprovalState,sUserName,sUserOrg,sUserPortal,nApprovalType) ';
		sql += 'VALUES(?,?,NOW(),?,?,?,?,?,?,1,?,?,?,1);';

		var approval_ret = await directQuery(sql, [fix_list[fix_id].fix_no, approval_title, approval_memo, fix_list[fix_id].fix_name, fix_list[fix_id].fix_build, fix_list[fix_id].fix_room, fix_list[fix_id].fix_price, fix_list[fix_id].reusable_rank, user_name, user_org, user_info[0].sPortal]);

		var approvalIdx = approval_ret.insertId;

		for (var approver_idx = 0; approver_idx < approver_list.length; approver_idx++) {
			sql = 'INSERT INTO tblApprover(sName,sNumber,sPortal,sOrg,sEMail,sTel,nApprIdx,nApprOrder) ';
			sql += 'VALUES(?,?,?,?,?,?,?,?);';

			var approver_ret = await directQuery(sql, [approver_list[approver_idx].name, approver_list[approver_idx].employeeNum, approver_list[approver_idx].portal, approver_list[approver_idx].org,
			approver_list[approver_idx].email, approver_list[approver_idx].tel, approvalIdx, (approver_idx + 1)]);

			if (approver_idx == 0) {
				var html_data = user_name + "(" + user_email + ")님으로부터 불용 신청 결재가 요청되었습니다." + "<br><br>";
				html_data += "결재 링크<br><a>http://203.251.137.136:32000/approverForm</a><br><br>";
				html_data += "불용 리스트<br>" + fix_list[fix_id].fix_no + " " + fix_list[fix_id].fix_name + " " + fix_list[fix_id].fix_build + " " + fix_list[fix_id].fix_room + " " + fix_list[fix_id].fix_price;

				let mailOptions = {
					from: 'kbw3672@naver.com', // 보내는 메일의 주소
					to: approver_list[approver_idx].email, // 수신할 이메일
					//to: "jaebeen2@kounosoft.com", // 수신할 이메일
					subject: "탄소중립 자산관리 시스템 불용 신청", // 메일 제목
					html: html_data, // 메일 내용
				};

				transporter.sendMail(mailOptions);
			}
		}
	}

	res.send({ result: "완료" });
});

// 임시로 추가 한 코드입니다. 나중에 수정 할 코드입니다. 결재 시스템 관련 코드입니다.

// 건물 누수 신고 관련 임시 페이지 Start
app.get('/water', async function (req, res) {
	var build_all = 1;

	var sql = 'SELECT * FROM tblBuild WHERE nRootIndex=? ORDER BY sName ASC;';
	var build_all_info = await directQuery(sql, [build_all]);
	var category = 110;

	const roomsSql = 'SELECT * FROM tblBuild WHERE nRootIndex= ? AND sCatagory =? AND sCatagory!="" ORDER BY nIndex;';
	const rooms = await directQuery(roomsSql, [build_all_info[0].nIndex, category]);

	res.render("water", { build: build_all_info, rooms: rooms });
});

app.post('/water_build', async function (req, res) {

	var build = 1;

	if (req.body.data) {
		var json = JSON.parse(req.body.data);
		build = json.build;
	}

	var sql = '';
	//sql = 'SELECT * FROM tblBuild WHERE nRootIndex=?;';
	sql = 'SELECT * FROM tblBuild WHERE nRootIndex=?;';
	var room_info = await directQuery(sql, [build]);

	res.send({ room_info: room_info });
});

app.post('/water', async function (req, res) {
	var json = JSON.parse(req.body.data);

	var reportor = json.reportor;
	var tel = json.tel;
	var email = json.email;
	var build = json.build;
	var room = json.room;
	var memo = json.memo;

	sql = "SELECT sName FROM tblBuild WHERE nIndex=?";
	var sql_build = await directQuery(sql, [build]);

	sql = 'INSERT INTO tblWaterReport(sUser,sTel,sMail,sBuildNo,sDetail,sBuild,sRoom) ';
	sql += 'VALUES(?,?,?,?,?,?,?);';
	var water_ret = await directQuery(sql, [reportor, tel, email, build, memo, sql_build[0].sName, room]);

	var repairIdx = water_ret.insertId;

	for (var i = 0; i < json.reportImg.length; i++) {
		sql = 'INSERT INTO tblWaterReportImg(nReportIdx,sImgPath,sImgBin) ';
		sql += 'VALUES(?,?,?);';

		ret = await directQuery(sql, [repairIdx, json.reportImg[i], json.reportImgBin[i]]);
	}

	var result = '신고되었습니다.';
	if (!ret.affectedRows) {
		result = '저장하지 못했습니다.\n관리자에게 문의해주세요.';
	}

	var html_data = reportor + "(" + email + ")님으로부터 " + sql_build[0].sName + " " + room + " 의 누수 신고가 접수되었습니다." + "<br>";

	let mailOptions = {
		from: 'kbw3672@naver.com', // 보내는 메일의 주소
		//to: "hdkim514@korea.ac.kr", // 수신할 이메일
		to: "jaebeen2@kounosoft.com", // 수신할 이메일
		subject: "고려대학교 자산관리 시스템 재사용 물품 신청", // 메일 제목
		html: html_data, // 메일 내용
	};

	transporter.sendMail(mailOptions);

	res.send({ result: result });
});

app.get('/waterlist', async function (req, res) {
	var sql = 'SELECT * FROM tblWaterReport ORDER BY nIndex DESC;';
	var ret_water = await directQuery(sql);

	sql = 'SELECT * FROM tblWaterReportImg;';
	var ret_img = await directQuery(sql);

	res.render("water_list", { water_list: ret_water, image_list: ret_img });
});

app.post('/getWaterImage', async function (req, res) {
	var json = JSON.parse(req.body.data);
	var idx = json.idx;

	var sql = 'SELECT * FROM tblWaterReportImg WHERE nReportIdx=?;';
	var ret_img = await directQuery(sql, [idx]);

	res.send({ image_list: ret_img });
});

//건물 누수 신고 관련 임시 페이지 End

//임시 작업 페이지 코드
app.get('/temporarypage01', session_exists, async function (req, res) {

	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("temporarypage01", { idx: req.session.user.name, uname: req.session.user.name, session: req.session, userid: req.session.user.userid, permission: req.session.user.permission, stdtype: req.session.user.stdtype, orgIdx: req.session.user.orgIdx, authority_list: authority_list, sel_authority: req.session.user.selectAuithority });
});
//임시 작업 페이지 코드 End


// 바로바로 서비스 임시 페이지 코드

app.post('/reports_id', async function (req, res) {
	var idx = req.body.idx;

	const response = await axios.get('http://192.168.100.136:3000/api/reports/' + idx);

	//console.log(response.data);

	res.send(response.data);
});

app.post('/reports_page', async function (req, res) {
	var num = req.body.num;

	const response = await axios.get('http://192.168.100.136:3000/api/reports?page=' + num);

	res.send(response.data);
});

app.post('/notice_all', async function (req, res) {

	const response = await axios.get('http://192.168.100.136:3000/api/notices');

	res.send(response.data);
});

app.post('/reports_search', async function (req, res) {
	var keyword = req.body.keyword;
	var searchType = req.body.searchType;

	const formData = new FormData();
	formData.append('keyword', keyword);
	formData.append('searchType', searchType);

	const response = await axios.post('http://192.168.100.136:3000/api/reports', formData, {
		headers: {
			...formData.getHeaders()
		}
	});

	res.send(response.data);
});

//최상위 관리자
// 최상위 관리자 메인 화면
app.get(['/Top_admin_index'], (req, res) => {
	res.render('Top_admin_index');
});

// 관리자 등록 버튼 클릭, 관리자 목록 화면
app.get(['/Top_admin_list'], (req, res) => {
	res.render('Top_admin_list');
});

// 신규 관리자 등록 화면
app.get(['/Top_admin_newRegistration'], (req, res) => {
	res.render('Top_admin_newRegistration');
});

app.post('/User_role1', async function (req, res) {
	const response = await axios.get('http://192.168.100.136:3000/api/users?roleId=1');

	res.send(response.data);
});

app.post('/User_role1_search', async function (req, res) {
	var keyword = req.body.keyword;
	var searchType = req.body.searchType;

	const response = await axios.get('http://192.168.100.136:3000/api/users/search?keyword=' + keyword + '&searchType=' + searchType + '&roleId=1');

	res.send(response.data);
});

app.post('/User_role2', async function (req, res) {
	const response = await axios.get('http://192.168.100.136:3000/api/users?roleId=2');

	res.send(response.data);
});

app.post('/User_role2_search', async function (req, res) {
	var keyword = req.body.keyword;
	var searchType = req.body.searchType;

	const response = await axios.get('http://192.168.100.136:3000/api/users/search?keyword=' + keyword + '&searchType=' + searchType + '&roleId=2');

	res.send(response.data);
});

app.post('/update_Role', async function (req, res) {
	var userId = req.body.userId;
	var roleId = req.body.roleId;

	const formData = new FormData();
	formData.append('roleId', roleId);

	const response = await axios.put('http://192.168.100.136:3000/api/users/updateRole/' + userId, formData, {
		headers: {
			...formData.getHeaders()
		}
	});

	res.send(response.data);
});

// 관리자
// 관리자 메인 화면
app.get('/admin_index', async (req, res) => {
	try {
		// 백엔드 API 호출하여 게시글 리스트 가져오기
		const responseReports = await axios.get('http://192.168.100.136:3000/api/reports'); // 백엔드 API URL
		const reports = responseReports.data; // API로부터 받은 데이터

		// 백엔드 API 호출하여 공지사항 리스트 가져오기
		const responseNotices = await axios.get('http://192.168.100.136:3000/api/notices'); // 백엔드 API URL
		const notices = responseNotices.data; // API로부터 받은 데이터

		// 게시글 리스트와 공지사항 리스트와 함께 admin_index.ejs 렌더링
		res.render('admin_index', { reports, notices });
	} catch (error) {
		console.error('게시글 또는 공지사항 조회 중 오류 발생:', error);
		res.status(500).send('게시글 또는 공지사항 조회 중 오류가 발생했습니다.');
	}
});

// 관리자 답변 미완료 글 내용
app.get('/admin_notcompleted', (req, res) => {
	res.render('admin_notcompleted');
});

// 관리자 답변
app.get('/admin_answer', (req, res) => {
	res.render('admin_answer');
});

// 직원 글 작성 API
app.post('/admin_answer', upload.single('imageUrl'), async (req, res) => {
	console.log("글 작성 페이지 현재 세션 데이터:", req.session); // 세션 데이터 확인
	const { reportId, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('reportId', reportId);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	if (req.file) {
		formData.append('imageUrl', req.file.buffer, req.file.originalname);
	}

	try {
		const response = await axios.post('http://192.168.100.136:3000/api/comments', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 작성 중 오류 발생:', error);
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
	}
});

// 관리자 답변 완료 글 내용 (본인 작성 O)
app.get('/admin_completed', (req, res) => {
	res.render('admin_completed');
});

// 관리자 답변 완료 글 수정 (본인 작성 O)
app.get('/admin_completed_modify', (req, res) => {
	res.render('admin_completed_modify');
});

// 관리자 답변 완료 글 내용 (본인 작성 X, 수정 불가)
app.get('/admin_completed02', (req, res) => {
	res.render('admin_completed02');
});

app.post('/notice_save', async (req, res) => {
	var contnet = req.body.contnet;

	const formData = new FormData();
	formData.append('contnet', contnet);

	const response = await axios.post('http://192.168.100.136:3000/api/notices', formData, {
		headers: {
			...formData.getHeaders()
		}
	});

	res.send(response.data);
});

app.post('/notice_delete', async (req, res) => {
	const idx = req.body.idx;

	try {
		const response = await axios.delete('http://192.168.100.136:3000/api/notices/' + idx);
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 삭제 중 오류 발생:', error);
		res.status(500).json({ error: '글 삭제 중 오류가 발생했습니다.' });
	}
});

app.post('/admin_delete', async (req, res) => {
	const idx = req.body.idx;

	try {
		const response = await axios.delete('http://192.168.100.136:3000/api/reports/' + idx);
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 삭제 중 오류 발생:', error);
		res.status(500).json({ error: '글 삭제 중 오류가 발생했습니다.' });
	}
});

//학생
// 기본 화면 / 학생 메인 화면
app.get('/student_index', async (req, res) => {
	console.log("학생 메인 화면 현재 세션 데이터:", req.session); // 세션 데이터 확인
	try {
		// 백엔드 API 호출하여 게시글 리스트 가져오기
		const response = await axios.get('http://192.168.100.136:3000/api/reports'); // 백엔드 API URL
		const reports = response.data; // API로부터 받은 데이터

		// 게시글 리스트와 함께 student_index.ejs 렌더링
		res.render('student_index', { reports });
	} catch (error) {
		console.error('게시글 조회 중 오류 발생:', error);
		res.status(500).send('게시글 조회 중 오류가 발생했습니다.');
	}
});

// 학생 글쓰기 화면
app.get('/student_write', (req, res) => {
	// 테스트를 위해 세션에 사용자 정보 임시 저장
	req.session.user = {
		sNAME: '원격교육센터 02',
		sStdId: 'atdtest02',
		sDeptNms: '교수학습개발원 :',
		role: '학생',
		// DB에서 가져온 권한 설정
	};
	console.log("글쓰기 화면 현재 세션 데이터:", req.session); // 세션 데이터 확인
	res.render('student_write');
});

// 학생 글 작성 API
app.post('/student_write', upload.single('imageUrl'), async (req, res) => {
	console.log("글 작성 페이지 현재 세션 데이터:", req.session); // 세션 데이터 확인
	const { title, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('title', title);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	if (req.file) {
		formData.append('imageUrl', req.file.buffer, req.file.originalname);
	}

	try {
		const response = await axios.post('http://192.168.100.136:3000/api/reports', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 작성 중 오류 발생:', error);
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
	}
});

// 학생 답변 완료 글 내용
app.get('/student_completed', (req, res) => {
	res.render('student_completed');
});

// 학생 답변 미완료 글 내용 (본인 작성 O)
app.get('/student_notcompleted', (req, res) => {
	res.render('student_notcompleted');
});

// 학생 답변 완료 글 수정 (본인 작성 O)
app.get('/student_notcompleted_modify', (req, res) => {
	res.render('student_notcompleted_modify');
});

// 학생 답변 미완료 글 내용 (본인 작성 X, 수정 불가)
app.get('/student_notcompleted02', (req, res) => {
	res.render('student_notcompleted02');
});

app.post('/student_motify', upload.single('imageUrl'), async (req, res) => {
	console.log("student_motify");

	const { idx, title, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('id', idx);
	formData.append('title', title);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	try {
		const response = await axios.put('http://192.168.100.136:3000/api/reports', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 수정 중 오류 발생:', error);
		res.status(500).json({ error: '글 수정 중 오류가 발생했습니다.' });
	}
});

app.post('/student_delete', upload.single('imageUrl'), async (req, res) => {
	const idx = req.body.idx;

	try {
		const response = await axios.delete('http://192.168.100.136:3000/api/reports/' + idx);
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 삭제 중 오류 발생:', error);
		res.status(500).json({ error: '글 삭제 중 오류가 발생했습니다.' });
	}
});

//직원
// 직원 메인 화면
app.get('/staff_index', async (req, res) => {
	try {
		// 백엔드 API 호출하여 게시글 리스트 가져오기
		const response = await axios.get('http://192.168.100.136:3000/api/reports'); // 백엔드 API URL
		const reports = response.data; // API로부터 받은 데이터

		// 게시글 리스트와 함께 staff_index.ejs 렌더링
		res.render('staff_index', { reports });
	} catch (error) {
		console.error('게시글 조회 중 오류 발생:', error);
		res.status(500).send('게시글 조회 중 오류가 발생했습니다.');
	}
});

// 직원 글쓰기 화면
app.get('/staff_write', (req, res) => {
	res.render('staff_write');
});

// 직원 글 작성 API
app.post('/staff_write', upload.single('imageUrl'), async (req, res) => {
	console.log("글 작성 페이지 현재 세션 데이터:", req.session); // 세션 데이터 확인
	const { title, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('title', title);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	if (req.file) {
		formData.append('imageUrl', req.file.buffer, req.file.originalname);
	}

	try {
		const response = await axios.post('http://192.168.100.136:3000/api/reports', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 작성 중 오류 발생:', error);
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
	}
});

// 직원 답변 완료 글 내용 (답변 본인 작성 O)
app.get('/staff_completed', (req, res) => {
	res.render('staff_completed');
});

// 직원 답변 완료 글 수정 (답변 본인 작성 O)
app.get('/staff_completed_modify', (req, res) => {
	res.render('staff_completed_modify');
});

// 직원 답변 완료 글 내용 (답변 본인 작성 X)
app.get('/staff_completed02', (req, res) => {
	res.render('staff_completed02');
});

// 직원 답변 미완료 글 내용 (본인 작성 X, 답변 가능)
app.get('/staff_notcompleted', (req, res) => {
	res.render('staff_notcompleted');
});

// 직원 답변
app.get('/staff_answer', (req, res) => {
	res.render('staff_answer');
});

// 직원 글 작성 API
app.post('/staff_answer', upload.single('imageUrl'), async (req, res) => {
	console.log("글 작성 페이지 현재 세션 데이터:", req.session); // 세션 데이터 확인
	const { reportId, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('reportId', reportId);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	if (req.file) {
		formData.append('imageUrl', req.file.buffer, req.file.originalname);
	}

	try {
		const response = await axios.post('http://192.168.100.136:3000/api/comments', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 작성 중 오류 발생:', error);
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
	}
});

// 직원 답변 미완료 글 내용 (본인 작성 O, 답변 X, 수정 가능)
app.get('/staff_notcompleted02', (req, res) => {
	res.render('staff_notcompleted02');
});

// 직원 답변 완료 글 수정 (답변 본인 작성 O)
app.get('/staff_notcompleted_modify', (req, res) => {
	res.render('staff_notcompleted_modify');
});

app.post('/staff_motify', upload.single('imageUrl'), async (req, res) => {
	console.log("staff_motify");

	const { idx, title, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('id', idx);
	formData.append('title', title);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	try {
		const response = await axios.put('http://192.168.100.136:3000/api/reports', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 수정 중 오류 발생:', error);
		res.status(500).json({ error: '글 수정 중 오류가 발생했습니다.' });
	}
});

app.post('/staff_delete', upload.single('imageUrl'), async (req, res) => {
	const idx = req.body.idx;

	try {
		const response = await axios.delete('http://192.168.100.136:3000/api/reports/' + idx);
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 삭제 중 오류 발생:', error);
		res.status(500).json({ error: '글 삭제 중 오류가 발생했습니다.' });
	}
});

app.post('/comment_motify', upload.single('imageUrl'), async (req, res) => {
	console.log("comment_motify");

	const { idx, content } = req.body; // 요청 본문에서 데이터 추출

	// 세션 데이터가 없을 경우 처리
	if (req.session.user) {
		sNAME = req.session.user.name;
		sStdId = req.session.user.userid;
		sDeptNms = req.session.user.sDeptNms;
	} else {
		sNAME = 'guest';
		sStdId = 'guest';
		sDeptNms = 'guest';

		console.log("로그인 내역이 없어 게스트로 글을 작성합니다.");
		res.status(500).json({ error: '글 작성 중 오류가 발생했습니다.' });
		return;
	}

	const formData = new FormData();
	formData.append('id', idx);
	formData.append('content', content);
	formData.append('sNAME', sNAME);
	formData.append('sStdId', sStdId);
	formData.append('sDeptNms', sDeptNms);

	try {
		const response = await axios.put('http://192.168.100.136:3000/api/comments', formData, {
			headers: {
				...formData.getHeaders()
			}
		});
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 수정 중 오류 발생:', error);
		res.status(500).json({ error: '글 수정 중 오류가 발생했습니다.' });
	}
});

app.post('/comment_delete', upload.single('imageUrl'), async (req, res) => {
	const idx = req.body.idx;

	try {
		const response = await axios.delete('http://192.168.100.136:3000/api/comments/' + idx);
		res.status(201).json(response.data);
	} catch (error) {
		console.error('글 삭제 중 오류 발생:', error);
		res.status(500).json({ error: '글 삭제 중 오류가 발생했습니다.' });
	}
});

// 직원 답변 완료 글 내용 (수정 불가 화면)
app.get('/staff_completed03', (req, res) => {
	res.render('staff_completed03');
});

// 바로바로 서비스 임시 페이지 코드

app.get('/images_download', async (req, res) => {

	var result_value = "";
	var user_idx = req.session.user.selectAuithority;

	if (user_idx == "98765432") {
		//result_value = "총무부";
		result_value = "";
	}
	else {
		var dpt_sql = "SELECT sNameKor FROM tblDepartment WHERE sDepartmentCode = ? ";
		var dpt_infos = await directQuery(dpt_sql, [req.session.user.dptCode]);
		result_value = dpt_infos[0].sNameKor;
	}

	res.render('images_download', { dpt_name: result_value });
});

app.post('/pdf_list', async function (req, res) {
	var check_list = req.body.list;

	//console.log("pdf_list",check_list[0]);

	var dpt_name = "";
	var user_idx = req.session.user.selectAuithority;

	if (user_idx == "98765432") {
		dpt_name = "";
	}
	else {
		var dpt_sql = "SELECT sNameKor FROM tblDepartment WHERE sDepartmentCode = ? ";
		var dpt_infos = await directQuery(dpt_sql, [req.session.user.dptCode]);
		dpt_name = dpt_infos[0].sNameKor;
	}

	var fix_sql = "SELECT * FROM tblFixture WHERE sFixtureNo IN (?) ";

	var fix_infos = await directQuery(fix_sql, [check_list]);

	var img_sql = "SELECT * FROM tblFixtureImg WHERE nFixtureIdx IN (?) ";

	var img_infos = await directQuery(img_sql, [check_list]);

	var page_sql = "SELECT * FROM tblFixture WHERE sFixtureNo IN (?) LIMIT 10 OFFSET 0";

	var page_infos = await directQuery(page_sql, [check_list]);

	res.send({ fix_infos: fix_infos, img_infos: img_infos, page_infos: page_infos, dpt_name: dpt_name });
});

app.post('/pdf_page', async function (req, res) {
	var check_list = req.body.list;
	var nStart = req.body.start;

	var fix_sql = "SELECT * FROM tblFixture WHERE sFixtureNo IN (?) ";

	var fix_infos = await directQuery(fix_sql, [check_list]);

	var img_sql = "SELECT * FROM tblFixtureImg WHERE nFixtureIdx IN (?) ";

	var img_infos = await directQuery(img_sql, [check_list]);

	var page_sql = "SELECT * FROM tblFixture WHERE sFixtureNo IN (?) LIMIT 10 OFFSET ?";

	var page_infos = await directQuery(page_sql, [check_list, Number(nStart * 10)]);

	var start_page = nStart - (nStart % 10);
	var end_page = fix_infos.length / 10;
	var page_data = {
		'count': nStart,
		'start': start_page,
		'end': end_page,
		'total': fix_infos.length
	};

	res.send({ page_infos: page_infos, img_infos: img_infos, page_data: page_data });
});

// 소개 인사말 페이지
app.get('/intro_greeting', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("intro_greeting", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});


// 소개 서비스 소개 페이지
app.get('/intro_introduction', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("intro_introduction", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});

// 소개 이용방법 페이지
app.get('/intro_how', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("intro_how", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});
// 소개 esg 페이지
app.get('/intro_ESG', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("intro_ESG", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});

// 소개 기술지원 페이지
app.get('/intro_support', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("intro_support", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});


// 소개 UI 자료 페이지
app.get('/intro_UIdown', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("intro_UIdown", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});

// 이거 기준 

app.get('/equipment_inquiry', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("equipment_inquiry", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});




// 양도 이력 팝업
app.get(['/handoverItem_Popup'], (req, res) => {
	res.render('handoverItem_Popup');
});

// 사진 변경 팝업
app.get(['/changephoto_Popup'], (req, res) => {
	res.render('changephoto_Popup');
});

// 비품 실사 물품 실사 페이지
app.get('/equipment_idiligence', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("equipment_idiligence", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});
// 비품 실사 실사 현황 페이지
app.get('/equipment_current', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("equipment_current", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});
// 부서 조회 팝업
app.get('/department_list_Popup', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("department_list_Popup", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});

// 권한 위임
app.get('/right_authority', session_exists, async function (req, res) {
	var sql = "SELECT * FROM tblAuthority WHERE sAuthorityNum=?";
	var authority_list = await directQuery(sql, [req.session.user.userid]);

	// userid를 세션에서 가져옵니다.
	var userid = req.session.user.userid; // 추가된 부분

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
			console.log(authority_list[idx]);

			var result = await directQuery(sql, [authority_list[idx].sStdId]);

			if (result.length > 0) {
				authority_list[idx].sName = result[0].sName;
			}
			else {
				authority_list[idx].sName = "데이터 없음";
			}
		}

	}

	res.render("right_authority", {
		idx: req.session.user.name,
		uname: req.session.user.name,
		session: req.session,
		userid: userid, // 추가된 부분
		portalid: req.session.user.portalid,
		userpw: req.session.user.userpw,
		permission: req.session.user.permission,
		stdtype: req.session.user.stdtype,
		authority_list: authority_list,
		sel_authority: req.session.user.selectAuithority
	});
});
// 권한 신규 위임
app.get(['/right_authority02'], (req, res) => {
	res.render('right_authority02');
});

// 현재 유저 
app.get('/getUserId', function (req, res) {
	if (req.session && req.session.user) {
		res.json({ userid: req.session.user.userid });
	} else {
		res.json({ userid: null });
	}
});

var port = process.env.PORT || 33000;
//var host = "0.0.0.0";

//app.listen(port, host);
app.listen(port);

console.log('Order API is runnning at ' + port);
