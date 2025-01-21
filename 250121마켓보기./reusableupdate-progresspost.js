주요 변경사항:
pool.promise()를 사용하지 않고 일반 콜백 방식으로 변경
Promise를 직접 생성하여 비동기 처리
연결 관리 개선
에러 처리 강화
X_icon.svg 404 오류 해결을 위해서는:
해당 이미지 파일이 /public/images/ 디렉토리에 있는지 확인
없다면 파일을 해당 위치에 추가
또는 이미지 경로를 올바르게 수정
이러한 변경사항들로 두 오류가 모두 해결되어야 합니다.


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
