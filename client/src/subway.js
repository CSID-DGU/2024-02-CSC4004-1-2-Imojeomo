import { meanMarker, radius } from './middle-point.js'

// 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places(map);  

// import 해온 반경을 업데이트 하기 위해 새로운 변수에 저장한다
// var circleRadius = radius;
// console.log("circleRadius에 원의 반경 저장됨", circleRadius);


document.addEventListener("DOMContentLoaded", function () {
const completeButton = document.getElementById("complete-button");

    if (completeButton) {
        completeButton.addEventListener("click", function () {
            console.log("완료 버튼 클릭됨!");

            // 원 내부의 마커 개수
            var markerCount = 0;

            // 원 내부의 지하철역 검색
            ps.categorySearch('SW8', placesSearchCB, {
                location: meanMarker.getPosition(),
                radius: radius
            });
            // 키워드 검색 완료 시 호출되는 콜백함수 입니다
            function placesSearchCB (data, status, pagination) {
                if (status === kakao.maps.services.Status.OK) {
                    for (var i=0; i<data.length; i++) {
                        displayMarker(data[i]);    
                        console.log("data 배열에 저장된 장소가 마커로 표시되었음.", data[i]);
                        markerCount = markerCount + 1;
                        console.log("마커 개수 업데이트됨", markerCount);
                    }       
                }
            }
    });
}
});


// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x) 
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
}