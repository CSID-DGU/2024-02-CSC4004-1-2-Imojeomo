// middle-point.js

var meanMarker = null; // 평균 마커를 저장할 변수
var circle = null; // 원을 저장할 변수
var radius = null; // 원의 반경을 저장할 변수


// 완료 버튼이 클릭되면 중간 지점 계산 함수 실행
document.addEventListener("DOMContentLoaded", function () {
    const completeButton = document.getElementById("complete-button");

    if (completeButton) {
        completeButton.addEventListener("click", function () {
            // 중간 지점 계산 로직 호출
            console.log("완료 버튼 클릭됨!");
               
            // 완료 버튼 두번째로 눌리는 경우 기존 원 삭제
            if(circle){
                circle.setMap(null);
            }

            var radius = 1500; // 원 반경 1.5km로 초기화

            addMeanMarker(); // 중간 지점 마커 표시

            addCircle(radius);

            // 원 내부의 마커 개수
            var markerCount = 0;

            // 원 내부의 지하철 역 검색
            ps.categorySearch('SW8', placesSearchCB, {
                location: meanMarker.getPosition(),
                radius: radius
            });

            // 키워드 검색 완료 시 호출되는 콜백함수
            function placesSearchCB (data, status, pagination) {
                if (status === kakao.maps.services.Status.OK) {
                    for (var i=0; i<data.length; i++) {
                        displayMarker(data[i]);    
                        console.log("data 배열에 저장된 장소가 마커로 표시되었음.", data[i]);
                    }
                    markerCount = data.length;
                    console.log("마커 개수 업데이트됨: ", markerCount);       
                }

                // 마커가 없으면 반경을 증가시키고 다시 검색
                if (markerCount === 0) {
                circle.setMap(null);
                console.log("기존 원 삭제되었습니다.");

                radius += 1000; // 반경 1000m씩 증가
                console.log("마커가 없어 반경을 증가합니다. 새로운 반경:", radius);

                // 원 생성
                addCircle(radius);

                // 지도에 원을 표시합니다 
                circle.setMap(map);
                console.log("새로운 원이 생성되었습니다. 반경: ", radius);
                
                // 재귀 호출로 지하철역 탐색 반복
                ps.categorySearch('SW8', placesSearchCB, {
                    location: meanMarker.getPosition(),
                    radius: radius
                }); 
                }
            }
        });
    }
});

// 중간 지점 계산 함수
function calculateMeanCoordinates() {
        var sumX = 0, sumY = 0;

        coordinates.forEach(coord => {
            sumX += coord.x;
            sumY += coord.y;
        });

        var mean = {
            x: sumX / coordinates.length,
            y: sumY / coordinates.length
        };
        console.log("계산된 평균 좌표:", mean);
      return mean;
    }

var meanCoord = null;   // 평균 좌표 순서쌍
var meanLatLng = null;  // 평균 좌표 경도, 위도

// 중간 지점 마커 표시 함수
function addMeanMarker() {
        if (coordinates.length === 0) return;

        meanCoord = calculateMeanCoordinates();
        meanLatLng = new daum.maps.LatLng(meanCoord.y, meanCoord.x);

        // 기존 평균 마커가 있으면 제거
        if (meanMarker) {
            meanMarker.setMap(null);
            console.log("기존 중점 마커 제거");
        }

        // 새로운 평균 마커 추가
        meanMarker = new daum.maps.Marker({
            position: meanLatLng,
            map: map,
            title: "평균 위치"
        });
        map.setCenter(meanLatLng);
        console.log("평균 마커가 추가되었습니다:", meanCoord);        
}

function addCircle(radius){
    // 지도에 표시할 원을 생성합니다
    circle = new kakao.maps.Circle({
        center : new kakao.maps.LatLng(meanCoord.y, meanCoord.x),  // 원의 중심좌표
        radius: radius, // 미터 단위의 원의 반지름입니다 
        strokeWeight: 5, // 선의 두께입니다 
        strokeColor: '#75B8FA', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'dashed', // 선의 스타일 입니다
        fillColor: '#CFE7FF', // 채우기 색깔입니다
        fillOpacity: 0.7  // 채우기 불투명도 입니다   
        });
}
// export { meanMarker, radius }

// import { meanMarker, radius } from './middle-point.js'

// 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places(map);  

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
