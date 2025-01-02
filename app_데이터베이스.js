// 데이터베이스추가로인해 이제 localhost중단했다 껏다 켜도 사진이랑 자료들이 그대로 남아있다 DB쓰는이유 

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql2');

const PORT = 3000;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// body-parser 추가
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// multer를 사용하여 파일 업로드를 위한 설정
// destination: 업로드된 파일이 저장될 경로 지정 
// filename: 저장될 파일명 설정 (현재시간-원본파일명)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// MySQL 연결 설정 추가
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mandu.',
  database: 'reusable_market'
});

// 아이템 목록 조회 API 수정
app.get('/api/items', (req, res) => {
    connection.query(
        'SELECT * FROM items ORDER BY createdAt DESC',
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: '데이터베이스 조회 실패' });
            }
            res.json(results);
        }
    );
});

// 아이템 등록 API도 수정 필요
app.post('/api/items', upload.single('image'), (req, res) => {
    const newItem = {
        type: req.body.type,
        title: req.body.title,
        content: req.body.content,
        imagePath: '/uploads/' + req.file.filename,
        grade: req.body.grade,
        email: req.body.email,
        phone: req.body.phone,
        createdAt: new Date()
    };
    
    connection.query(
        'INSERT INTO items SET ?',
        newItem,
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: '등록 실패' });
            }
            newItem.id = results.insertId;
            res.json({
                success: true,
                item: newItem
            });
        }
    );
});

// 단일 파일 업로드를 처리하는 API 엔드포인트
// 업로드 성공시 파일 경로 반환, 실패시 success: false 반환
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

// 로그인 페이지 라우트 설정
app.get(['/', '/login'], (req, res) => {
    res.render('login'); 
});

// 메인페이지
app.get('/index', (req, res) => {
    connection.query(
        'SELECT * FROM items ORDER BY createdAt DESC',
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: '데이터베이스 조회 실패' });
            }
            const sortedItems = results;
            // 아이템을 5개씩 그룹화
            const itemGroups = [];
            for (let i = 0; i < sortedItems.length; i += 5) {
                itemGroups.push(sortedItems.slice(i, i + 5));
            }
            res.render('index', { 
                items: sortedItems,
                itemGroups: itemGroups,
                totalItems: sortedItems.length
            });
        }
    );
});

// 재사용 마켓 메인페이지
app.get(['/reusable_market'], (req, res) => {
    connection.query(
        'SELECT * FROM items ORDER BY createdAt DESC',
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: '데이터베이스 조회 실패' });
            }
            const sortedItems = results;
            res.render('reusable_market', { items: sortedItems }); 
        }
    );
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
