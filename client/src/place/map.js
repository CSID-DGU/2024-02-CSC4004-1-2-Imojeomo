/* global kakao */


/**
 * 지도 초기화
 * @param {string} containerId - 지도를 표시할 HTML 요소 ID
 * @returns {Object} - Kakao 지도 객체
 */


let map;
let markers = [];

export function initializeMap(containerId) {
    const mapContainer = document.getElementById(containerId); // 지도를 표시할 div
    const mapOption = {
        center: new kakao.maps.LatLng(37.537187, 127.005476), // 지도의 중심좌표
        level: 7 // 지도의 확대 레벨
    };

    // 지도를 미리 생성
    map = new kakao.maps.Map(mapContainer, mapOption);
    console.log("지도 초기화 완료", map);

    return map;
}


/**
 * 지도에 마커 추가
 * @param {Object} map - Kakao 지도 객체
 * @param {string} address - 주소
 * @param {string} memberName - 멤버 이름
 * @returns {Object} - 생성된 마커 객체
 */

export function addMarker(map, address, memberName) {
    const geocoder = new kakao.maps.services.Geocoder();

    return new Promise((resolve, reject) => {
        geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                const marker = new kakao.maps.Marker({
                    position: coords,
                    map: map,
                });

                const infoWindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;">${memberName}</div>`,
                    removable: true,
                });

                kakao.maps.event.addListener(marker, 'mouseover', () => {
                    infoWindow.open(map, marker);
                });
                kakao.maps.event.addListener(marker, 'mouseout', () => {
                    infoWindow.close();
                });

                const markerObj = { address, marker };
                markers.push(markerObj); // 전역 배열 업데이트
                resolve(markerObj);
            } else {
                reject(new Error(`주소 변환 실패: ${address}, 상태 코드: ${status}`));
            }
        });
    });
}





export function removeMarker(address) {
    const markerObj = markers.find((m) => m.address === address);

    if (markerObj && markerObj.marker instanceof kakao.maps.Marker) {
        markerObj.marker.setMap(null); // 지도에서 마커 제거
        markers = markers.filter((m) => m.address !== address); // 전역 배열에서 제거
        console.log("마커 제거 완료:", address);
        return true;
    } else {
        console.warn("삭제할 마커를 찾을 수 없습니다 또는 마커가 올바르지 않습니다:", markerObj);
        return false;
    }
}



export function clearMarkers() {
    markers.forEach((markerObj) => {
        if (markerObj.marker instanceof kakao.maps.Marker) {
            markerObj.marker.setMap(null); // 지도에서 마커 제거
        }
    });
    markers = []; // 전역 배열 초기화
    console.log("모든 마커가 제거되었습니다.");
}
