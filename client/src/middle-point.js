// 완료 버튼이 클릭되면 중간 지점 계산 함수 실행
document.addEventListener("DOMContentLoaded", function () {
    const completeButton = document.getElementById("complete-button");

    if (completeButton) {
        completeButton.addEventListener("click", function () {
            // 중간 지점 계산 로직 호출
            console.log("완료 버튼 클릭됨!");
            addMeanMarker(); // 중간 지점 마커 표시
        });
    }
});

// 원의 반경 저장하는 변수
var radius = null;

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


var meanMarker = null; // 평균 마커를 저장할 변수

// 중간 지점 마커 표시 함수
function addMeanMarker() {
        if (coordinates.length === 0) return;

        var meanCoord = calculateMeanCoordinates();
        var meanLatLng = new daum.maps.LatLng(meanCoord.y, meanCoord.x);

        // 기존 평균 마커가 있으면 제거
        if (meanMarker) {
            meanMarker.setMap(null);
        }

        // 새로운 평균 마커 추가
        meanMarker = new daum.maps.Marker({
            position: meanLatLng,
            map: map,
            title: "평균 위치"
        });
        map.setCenter(meanLatLng);
        console.log("평균 마커가 추가되었습니다:", meanCoord);
        
        // 지도에 표시할 원을 생성합니다
        var circle = new kakao.maps.Circle({
        center : new kakao.maps.LatLng(meanCoord.y, meanCoord.x),  // 원의 중심좌표
        radius: 1500, // 미터 단위의 원의 반지름입니다 
        strokeWeight: 5, // 선의 두께입니다 
        strokeColor: '#75B8FA', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'dashed', // 선의 스타일 입니다
        fillColor: '#CFE7FF', // 채우기 색깔입니다
        fillOpacity: 0.7  // 채우기 불투명도 입니다   
        }); 
            
        // 지도에 원을 표시합니다 
        circle.setMap(map);
        console.log("원이 생성되었습니다");
    

        // 원의 반경을 저장할 변수
        radius = circle.getRadius();
        console.log("원의 반경 저장됨.", radius);
    }

export { meanMarker, radius }