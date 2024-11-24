var mapContainer = document.getElementById('map'), // 지도를 표시할 div
        mapOption = {
            center: new daum.maps.LatLng(37.537187, 127.005476), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

    // 지도를 미리 생성
    var map = new daum.maps.Map(mapContainer, mapOption);
    
    // 주소-좌표 변환 객체를 생성
    var geocoder = new daum.maps.services.Geocoder();

    // 마커를 저장할 배열
    var markers = [];

    // 좌표를 저장할 배열
    var coordinates = [];

    // 지도 범위를 정의할 LatLngBounds 객체
    var bounds = new daum.maps.LatLngBounds();