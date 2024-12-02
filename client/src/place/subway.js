/*global kakao*/

/**
 * 지하철역 검색 및 마커 생성
 * @param {Object} mapInstance - Kakao 지도 객체
 * @param {Object} position - 중심 위치 (kakao.maps.LatLng)
 * @param {number} radius - 검색 반경 (미터)
 * @returns {Promise<Object[]>} - 역 이름과 마커 객체 배열 반환
 */
export async function searchSubwayStations(mapInstance, position, radius = 1500) {
    return new Promise((resolve, reject) => {
        if (!mapInstance || !position) {
            reject(new Error("지도 객체 또는 중심 위치가 제공되지 않았습니다."));
            return;
        }

        const ps = new kakao.maps.services.Places(mapInstance);

        ps.categorySearch(
            'SW8', // 지하철 카테고리 코드
            (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    const results = data.map((place) => {
                        // 커스텀 마커 이미지 설정
                        const imageSrc = '/subway-icon.png'; // 작은 지하철 아이콘 이미지 경로
                        const imageSize = new kakao.maps.Size(18, 18); // 이미지 크기 (가로x세로)
                        const imageOption = { offset: new kakao.maps.Point(12, 12) }; // 이미지 중심점
                        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

                        // 커스텀 마커 생성
                        const marker = new kakao.maps.Marker({
                            map: mapInstance,
                            position: new kakao.maps.LatLng(place.y, place.x),
                            image: markerImage,
                        });

                        // InfoWindow 생성
                        const infowindow = new kakao.maps.InfoWindow({
                            content: `<div style="padding:5px;font-size:12px;">${place.place_name}</div>`,
                            zIndex: 1,
                        });

                        // 마우스 오버 이벤트
                        kakao.maps.event.addListener(marker, 'mouseover', () => {
                            infowindow.open(mapInstance, marker); // 마커 위에 InfoWindow 열기
                        });

                        // 마우스 아웃 이벤트
                        kakao.maps.event.addListener(marker, 'mouseout', () => {
                            infowindow.close(); // 마커에서 벗어나면 InfoWindow 닫기
                        });

                        return { name: place.place_name, marker };
                    });

                    resolve(results); // 역 이름과 마커를 포함한 객체 배열 반환
                } else {
                    reject(new Error("지하철역 검색 실패 또는 결과 없음."));
                }
            },
            {
                location: position,
                radius,
            }
        );
    });
}
