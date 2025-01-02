const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const PORT = 3000;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// body-parser 추가
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// multer 설정 추가
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// 아이템 데이터 저장을 위한 임시 배열
let items = [];

// 파일 업로드 API
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({
            success: true,
            filePath: '/uploads/' + req.file.filename
        });
    } else {
        res.json({ success: false });
    }
});

// 아이템 등록 API
app.post('/api/items', upload.single('image'), (req, res) => {
    const newItem = {
        id: items.length + 1,
        type: req.body.type,
        title: req.body.title,
        content: req.body.content,
        imagePath: '/uploads/' + req.file.filename,
        grade: req.body.grade,
        email: req.body.email,
        phone: req.body.phone,
        createdAt: new Date()
    };
    
    items.push(newItem);
    
    res.json({
        success: true,
        item: newItem
    });
});

// 아이템 목록 조회 API
app.get('/api/items', (req, res) => {
    res.json(items);
});

// 로그인 페이지 라우트 설정
app.get(['/', '/login'], (req, res) => {
    res.render('login'); 
});

// 메인페이지
app.get('/index', (req, res) => {
    // items 배열을 역순으로 정렬하여 최신 항목이 먼저 표시되도록 함
    const sortedItems = [...items].reverse();
    res.render('index', { items: sortedItems });
});

// 재사용 마켓 메인페이지
app.get(['/reusable_market'], (req, res) => {
    // items 배열을 역순으로 정렬하여 최신 항목이 먼저 표시되도록 함
    const sortedItems = [...items].reverse();
    res.render('reusable_market', { items: sortedItems }); 
});

// 반납 신청 목록 페이지
app.get(['/return_application_list'], (req, res) => {
    res.render('return_application_list'); 
});

// 반납 신청서 작성 팝업창 (교수님)
app.get(['/return_applicationPopup'], (req, res) => {
    res.render('return_applicationPopup'); 
});

// 반납 신청서 작성 팝업창 (직원)
app.get(['/approval_applicationPopup'], (req, res) => {
    res.render('approval_applicationPopup'); 
});

// 등록 물품 관리
app.get(['/registration_list'], (req, res) => {
    res.render('registration_list'); 
});
// 신청자 확인 팝업
app.get(['/applicant_checkPopup'], (req, res) => {
    res.render('applicant_checkPopup'); 
});


// 등록 물품 관리
app.get(['/applications_list'], (req, res) => {
    res.render('applications_list'); 
});
// 등록자 확인 팝업업
app.get(['/registrar_checkPopup'], (req, res) => {
    res.render('registrar_checkPopup'); 
});


// 양도 완료된 물품 목록
app.get(['/transactions_list'], (req, res) => {
    res.render('transactions_list'); 
});

// 결재함
app.get(['/approval_box'], (req, res) => {
    res.render('approval_box'); 
});

// 결재 요청 신청자 상세보기 팝업
app.get(['/approval_applicationPopup02'], (req, res) => {
    res.render('approval_applicationPopup02'); 
});

// 결재자 (중간 결재자) 팝업
app.get(['/approval_applicationPopup03'], (req, res) => {
    res.render('approval_applicationPopup03'); 
});

// 결재자 (최종 결재자) 팝업
app.get(['/approval_applicationPopup04'], (req, res) => {
    res.render('approval_applicationPopup04'); 
});

// test
app.get(['/test'], (req, res) => {
    res.render('test'); 
});
// test popup
app.get(['/CheckMyItems_Popup'], (req, res) => {
    res.render('CheckMyItems_Popup'); 
});




app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
