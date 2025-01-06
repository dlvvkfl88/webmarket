        <!-- header -->
        <header id="header">
            <%-/*header 불러오기*/ include ("./templates/header") %>
        </header>
        <!-- header -->

        일경우는 따로 header 파일을 만들어 
        SQL 
header.ejs 로그인연동 
        <!-- 헤더 내부 컨테이너 - 중앙 정렬 및 양쪽 정렬 적용 -->
<div class="header_inner fix_flexbetween center">
    <!-- 헤더 좌측 영역 -->
    <div class="header_L">
        <!-- 헤더 로고 영역 -->
        <a href="home">
            <!-- 로고 제목 -->
            <h1 class="tit_h1">
                <!-- 화면에는 보이지 않는 로고 텍스트 -->
                <span class="blind">logo</span>
            </h1>
        </a>

        <!-- 글로벌 네비게이션 바 영역 -->
        <nav class="gnb">
            <ul>
                <li>
                    <a href="#none">알아보기</a>
                    <ul class="sub_menu">
                        <li>
                            <a href="#none">인사말</a>
                        </li>
                        <li>
                            <a href="#none">서비스 소개</a>
                        </li>
                        <li>
                            <a href="#none">이용방법</a>
                        </li>
                        <li>
                            <a href="#none">ESG 자료</a>
                        </li>
                        <li>
                            <a href="#none">기술지원</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#none">비품 조회</a>
                    
                </li>
                <li>
                    <a href="#none">비품 실사</a>
                    <ul class="sub_menu">
                        <li>
                            <a href="#none">연간 물품 실사</a>
                        </li>
                        <li>
                            <a href="#none">실사 현항 확인</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#none">재사용 마켓</a>
                    <ul class="sub_menu">
                        <li>
                            <a href="reusable_market">마켓 보기</a>
                        </li>
                        <li>
                            <a href="registration_list">등록 물품 관리</a>
                        </li>
                        <li>
                            <a href="applications_list">신청 물품 관리</a>
                        </li>
                        <li>
                            <a href="return_application_list">반납 신청 목록</a>
                        </li>
                        <li>
                            <a href="approval_box">반납 신청 관리</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#none">공간 정보</a>
                </li>
            </ul>
        </nav>
    </div>

    <!-- 서브 네비게이션 바 - 사용자 관련 메뉴 -->
    <ul class="snb">
        <!-- 권한 선택 드롭다운 -->
        <li>
            <select id="authorityDropdown" onchange="chageAuthoritySelect()">
                <!-- 기본 계정 옵션 -->
                <option value="<%=userid%>" <%=(userid==sel_authority?' selected':'')%>>본 계정</option>
                <!-- 권한 위임된 계정 목록 반복 출력 -->
                <%
                for(var idx = 0; idx < authority_list.length; idx++)
                {
                %>
                <option value="<%=authority_list[idx].sStdId%>" <%=(authority_list[idx].sStdId==sel_authority?' selected':'')%>><%=authority_list[idx].sName%></option>
                <%
                }
                %>
            </select>
        </li>
        <!-- 관리자(stdtype=1)인 경우에만 권한 위임 메뉴 표시 -->
        <%
        if(stdtype == 1)
        {
        %>
        <li class="snb_icon01">
            <!-- 권한 위임 페이지 링크 -->
            <a href="authorityDelegation_list">
                <img src="/images/snb_icon01.svg" alt="권한위임아이콘">
                <p>권한 위임</p>
            </a>
        </li>
        <%
        }
        %>
        <!-- 사용자 프로필 메뉴 -->
        <li class="snb_icon02">
            <a href="#none">
                <img src="/images/snb_icon02.svg" alt="로그인아이콘">
                <!-- 현재 로그인한 사용자 이름 표시 -->
                <p id="bookerName"><%=uname%></p>
            </a>
        </li>
        <!-- 로그아웃 버튼 -->
        <li class="snb_icon03">
            <button onclick="logOut()" class="btn_none">
                <img src="/images/snb_icon03.svg" alt="로그아웃아이콘"><p>LOGOUT</p>
            </button>
        </li>
    </ul>
</div>

<!-- 로그아웃 처리를 위한 자바스크립트 -->
<script type="text/javascript">
// 로그아웃 함수 - AJAX를 통해 서버에 로그아웃 요청
function logOut() {
    $.ajax({
        url: '/logout',
        type: "post",
        success: function(res){
            // 로그아웃 성공 시 로그인 페이지로 이동
            window.location.href = "login";
        }
    });
}
</script>
