// 브라우저 콘솔에서 실행할 localStorage 확인 스크립트

console.log("=== SignChain Auth Status Check ===");

// 토큰 정보 확인
const token = localStorage.getItem('signchain_token');
const refreshToken = localStorage.getItem('signchain_refresh_token'); 
const user = localStorage.getItem('signchain_user');

console.log("토큰 존재:", !!token);
console.log("리프레시 토큰 존재:", !!refreshToken);
console.log("사용자 정보 존재:", !!user);

if (token) {
    console.log("토큰 길이:", token.length);
    // JWT 토큰 디코딩 시도
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("토큰 만료 시간:", new Date(payload.exp * 1000));
        console.log("현재 시간:", new Date());
        console.log("토큰 유효:", payload.exp > Date.now() / 1000);
    } catch (e) {
        console.log("토큰 디코딩 실패:", e.message);
    }
}

if (user) {
    try {
        const userData = JSON.parse(user);
        console.log("사용자 정보:", userData);
    } catch (e) {
        console.log("사용자 정보 파싱 실패:", e.message);
    }
}

// 이전 auth 시스템 확인
const oldUser = localStorage.getItem('user');
console.log("이전 auth 시스템 사용자:", !!oldUser);
if (oldUser) {
    try {
        console.log("이전 사용자 정보:", JSON.parse(oldUser));
    } catch (e) {
        console.log("이전 사용자 정보 파싱 실패");
    }
}
